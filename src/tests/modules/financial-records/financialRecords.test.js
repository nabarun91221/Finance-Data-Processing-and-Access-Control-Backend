import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import financialRecordsController from "../../../modules/financial-records/controllers/financialRecord.controller.js";
import FinancialRecord from "../../../modules/financial-records/models/financialRecords.model.js";
import Category from "../../../modules/financial-record-categories/models/category.model.js";

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

    app.post(`${base}/records`, financialRecordsController.createRecord);
    app.get(`${base}/records`, financialRecordsController.getAllRecords);
    app.get(`${base}/records/:id`, financialRecordsController.getRecordById);
    app.patch(`${base}/records/:id`, financialRecordsController.updateRecord);
    app.delete(`${base}/records/:id`, financialRecordsController.deleteRecord);

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

describe("FinancialRecordsController Integration", () =>
{

    test("should create financial record", async () =>
    {

        const category = await Category.create({
            name: "Salary",
            slug: "salary",
            type: "INCOME",
            createdBy: new mongoose.Types.ObjectId()
        });

        const payload = {
            amount: 5000,
            category: category._id,
            date: new Date(),
            note: "Monthly salary"
        };

        const res = await request(app)
            .post("/api/records")
            .send(payload);

        expect(res.statusCode).toBe(201);
        expect(res.body.data.amount).toBe(5000);

    });


    test("should get all records", async () =>
    {

        const category = await Category.create({
            name: "Operations",
            slug: "ops",
            type: "EXPENSE",
            createdBy: new mongoose.Types.ObjectId()
        });

        await FinancialRecord.create({
            amount: 1000,
            category: category._id,
            date: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app).get("/api/records");

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);

    });


    test("should filter records by type", async () =>
    {

        const incomeCategory = await Category.create({
            name: "Consulting",
            slug: "consulting",
            type: "INCOME",
            createdBy: new mongoose.Types.ObjectId()
        });

        await FinancialRecord.create({
            amount: 8000,
            category: incomeCategory._id,
            date: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .get("/api/records?type=INCOME");

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);

    });


    test("should get record by id", async () =>
    {

        const category = await Category.create({
            name: "Infrastructure",
            slug: "infra",
            type: "EXPENSE",
            createdBy: new mongoose.Types.ObjectId()
        });

        const record = await FinancialRecord.create({
            amount: 2000,
            category: category._id,
            date: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .get(`/api/records/${record._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.amount).toBe(2000);

    });


    test("should update financial record", async () =>
    {

        const category = await Category.create({
            name: "Marketing",
            slug: "marketing",
            type: "EXPENSE",
            createdBy: new mongoose.Types.ObjectId()
        });

        const record = await FinancialRecord.create({
            amount: 3000,
            category: category._id,
            date: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .patch(`/api/records/${record._id}`)
            .send({ amount: 4000 });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.amount).toBe(4000);

    });


    test("should soft delete financial record", async () =>
    {

        const category = await Category.create({
            name: "Legal",
            slug: "legal",
            type: "EXPENSE",
            createdBy: new mongoose.Types.ObjectId()
        });

        const record = await FinancialRecord.create({
            amount: 1000,
            category: category._id,
            date: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .delete(`/api/records/${record._id}`);

        expect(res.statusCode).toBe(200);

        const updated = await FinancialRecord.findById(record._id);

        expect(updated.isDeleted).toBe(true);

    });

});