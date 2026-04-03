import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import categoryController from "../../../modules/financial-record-categories/controllers/category.controller.js";
import Category from "../../../modules/financial-record-categories/models/category.model.js"

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

    app.post(`${base}/categories`, categoryController.createCategory);
    app.get(`${base}/categories`, categoryController.getAllCategories);
    app.get(`${base}/categories/:id`, categoryController.getCategoryById);
    app.patch(`${base}/categories/:id`, categoryController.updateCategory);
    app.delete(`${base}/categories/:id`, categoryController.deleteCategory);

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

describe("CategoriesController Integration", () =>
{

    test("should create category", async () =>
    {

        const payload = {
            name: "Operational Cost",
            slug: "opco",
            type: "EXPENSE"
        };

        const res = await request(app)
            .post("/api/categories")
            .send(payload);

        expect(res.statusCode).toBe(201);
        expect(res.body.data.name).toBe("Operational Cost");

    });


    test("should get all categories", async () =>
    {

        await Category.create({
            name: "Salary",
            slug: "salary",
            type: "INCOME",
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .get("/api/categories");

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);

    });


    test("should get category by id", async () =>
    {

        const category = await Category.create({
            name: "Infrastructure",
            slug: "infra",
            type: "EXPENSE",
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .get(`/api/categories/${category._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.name).toBe("Infrastructure");

    });


    test("should update category", async () =>
    {

        const category = await Category.create({
            name: "Marketing",
            slug: "marketing",
            type: "EXPENSE",
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .patch(`/api/categories/${category._id}`)
            .send({ name: "Digital Marketing" });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.name).toBe("Digital Marketing");

    });


    test("should delete category", async () =>
    {

        const category = await Category.create({
            name: "Consulting",
            slug: "consulting",
            type: "EXPENSE",
            createdBy: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .delete(`/api/categories/${category._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Category deleted successfully");

        const deleted = await Category.findById(category._id);
        expect(deleted).toBeNull();

    });

});