import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";


import analyticsController from "../../../modules/analytics/controllers/analytics.controller.js";
import FinancialRecord from "../../../modules/financial-records/models/financialRecords.model.js";
import Category from "../../../modules/financial-record-categories/models/category.model.js";
import Budget from "../../../modules/budgets/models/budget.model.js";

jest.unstable_mockModule(
    "../../../shared/utils/getFinancialYear.js",
    () => ({
        default: jest.fn(() => "2025-2026")
    })
);

let mongoServer;
let app;

beforeAll(async () =>
{

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);

    app = express();
    app.use(express.json());

    app.use((req, res, next) =>
    {
        res.locals = {};
        next();
    });

    const base = "/api";

    app.get(`${base}/analytics/summary`, analyticsController.getFinancialSummary);
    app.get(`${base}/analytics/totals`, analyticsController.getCategoryTotals);
    app.get(`${base}/analytics/activity`, analyticsController.getRecentActivity);
    app.get(`${base}/analytics/mtrend`, analyticsController.getMonthlyTrend);

    app.use((req, res) =>
    {
        res.status(res.statusCode || 200).json(res.locals.responseData);
    });

});

afterEach(async () =>
{

    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany();
    }

});

afterAll(async () =>
{
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("Analytics Controller Integration", () =>
{

    test("should return financial summary", async () =>
    {


        const incomeCategory = await Category.create({
            name: "Salary",
            slug: "salary",
            type: "INCOME"
        });

        const expenseCategory = await Category.create({
            name: "Operational Cost",
            slug: "opco",
            type: "EXPENSE"
        });

        await FinancialRecord.create({
            amount: 10000,
            category: incomeCategory._id,
            date: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });

        await FinancialRecord.create({
            amount: 4000,
            category: expenseCategory._id,
            date: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });


        await Budget.create({
            totalBudget: 20000,
            financialYear: "2025-2026",
            startDate: new Date("2025-04-01"),
            endDate: new Date("2026-03-31"),
            createdBy: new mongoose.Types.ObjectId(),
            isActive: true
        });

        const res = await request(app).get("/api/analytics/summary");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.income).toBe(10000);
        expect(res.body.data.expense).toBe(4000);

    });

    test("should return category totals", async () =>
    {

        const category = await Category.create({
            name: "Marketing",
            slug: "marketing",
            type: "EXPENSE"
        });

        await FinancialRecord.create({
            amount: 3000,
            category: category._id,
            date: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app).get("/api/analytics/totals");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);

    });

    test("should return recent activity", async () =>
    {

        const category = await Category.create({
            name: "Salary",
            slug: "salary",
            type: "INCOME"
        });

        await FinancialRecord.create({
            amount: 5000,
            category: category._id,
            date: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app).get("/api/analytics/activity");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);

    });

    test("should return monthly trend", async () =>
    {

        const category = await Category.create({
            name: "Operational Cost",
            slug: "opco",
            type: "EXPENSE"
        });

        await FinancialRecord.create({
            amount: 2000,
            category: category._id,
            date: new Date("2026-03-01"),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app).get("/api/analytics/mtrend");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);

    });

});