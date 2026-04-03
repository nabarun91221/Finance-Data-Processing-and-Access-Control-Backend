import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import budgetController from "../../../modules/budgets/controllers/budget.controller.js";
import Budget from "../../../modules/budgets/models/budget.model.js";
import User from "../../../modules/users/models/user.model.js"
let mongoServer;
let app;

beforeAll(async () =>
{

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    app = express();
    app.use(express.json());

    app.use((req, res, next) =>
    {
        req.user = { sub: new mongoose.Types.ObjectId() };
        res.locals = {};
        next();
    });

    const base = "/api";

    app.post(`${base}/budgets`, budgetController.createBudget);
    app.get(`${base}/budgets`, budgetController.getAllBudgets);
    app.get(`${base}/budgets/:id`, budgetController.getBudgetById);
    app.patch(`${base}/budgets/:id`, budgetController.updateBudget);
    app.delete(`${base}/budgets/:id`, budgetController.deleteBudget);

    app.use((req, res, next) =>
    {

        const response = res.locals.responseData;

        if (!response) return next();

        const statusCode = res.statusCode || response.statusCode || 200;

        res.status(statusCode).json(response);

    });

});

afterEach(async () =>
{

    const collections = mongoose.connection.collections;

    for (const collection of Object.values(collections)) {
        await collection.deleteMany();
    }

});

afterAll(async () =>
{
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("BudgetController Integration", () =>
{

    test("should create a budget", async () =>
    {

        const payload = {
            totalBudget: 20000,
            financialYear: "2025-2026",
            startDate: "2025-04-01",
            endDate: "2026-03-31",
            isActive: true
        };

        const res = await request(app)
            .post("/api/budgets")
            .send(payload);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.totalBudget).toBe(20000);


    });


    test("should get all budgets", async () =>
    {
        const user = await User.create({
            name: "Test User",
            email: "test@example.com",
            password: "password"
        });

        await Budget.create({
            totalBudget: 10000,
            financialYear: "2025-2026",
            startDate: new Date("2025-04-01"),
            endDate: new Date("2026-03-31"),
            createdBy: user._id
        });

        const res = await request(app).get("/api/budgets");

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);

    });


    test("should get budget by id", async () =>
    {
        const user = await User.create({
            name: "Test User",
            email: "test@example.com",
            password: "password"
        });

        const budget = await Budget.create({
            totalBudget: 15000,
            financialYear: "2025-2026",
            startDate: new Date("2025-04-01"),
            endDate: new Date("2026-03-31"),
            createdBy: user._id
        });

        const res = await request(app)
            .get(`/api/budgets/${budget._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.totalBudget).toBe(15000);

    });


    test("should update budget", async () =>
    {

        const budget = await Budget.create({
            totalBudget: 10000,
            financialYear: "2025-2026",
            startDate: new Date("2025-04-01"),
            endDate: new Date("2026-03-31"),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .patch(`/api/budgets/${budget._id}`)
            .send({ totalBudget: 30000 });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.totalBudget).toBe(30000);



    });


    test("should delete budget", async () =>
    {

        const budget = await Budget.create({
            totalBudget: 10000,
            financialYear: "2025-2026",
            startDate: new Date("2025-04-01"),
            endDate: new Date("2026-03-31"),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .delete(`/api/budgets/${budget._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        const deleted = await Budget.findById(budget._id);
        expect(deleted).toBeNull();

    });

});