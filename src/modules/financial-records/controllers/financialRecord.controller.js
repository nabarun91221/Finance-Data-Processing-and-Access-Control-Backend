import FinancialRecord from "../models/financialRecords.model.js";
import invalidateCache from "../../../shared/middleware/cache-manager/cacheInvalidate.middleware.js";
import Category from "../../financial-record-categories/models/category.model.js";
import mongoose from "mongoose";
class FinancialRecordsController
{

    async createRecord(req, res, next)
    {
        try {

            const financialRecordsCategoryExist = await Category.findById(req.body.category);

            if (!financialRecordsCategoryExist) {
                return next({
                    statusCode: 404,
                    message: "category not exist",
                    data: {
                        categoryId: req.body.category
                    }
                })
            }

            const record = await FinancialRecord.create({ ...req.body, createdBy: req.user.sub });

            await invalidateCache("records:*");
            res.locals.auditLog = {
                action: "CREATE",
                entity: "FinancialRecord",
                entityId: record._id,
            };
            res.status(201).locals.responseData = {
                status: true,
                message: "Financial record created successfully",
                data: record
            };

            next();

        } catch (err) {
            next(err);
        }
    }


    async getAllRecords(req, res, next)
    {
        try {

            const {
                page = 1,
                limit = 10,
                startDate,
                endDate,
                category,
                type
            } = req.query;

            const pageNumber = parseInt(page);
            const limitNumber = Math.min(parseInt(limit), 100);
            const skip = (pageNumber - 1) * limitNumber;

            const matchStage = {
                isDeleted: false
            };

            if (startDate && endDate) {
                matchStage.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            if (category) {
                matchStage.category = new mongoose.Types.ObjectId(category);
            }

            const pipeline = [
                { $match: matchStage },

                {
                    $lookup: {
                        from: "categories",
                        let: { categoryId: "$category" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$categoryId"] }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    slug: 1,
                                    type: 1,
                                    parentCategory: 1
                                }
                            }
                        ],
                        as: "category"
                    }
                },

                { $unwind: "$category" }
            ];

            if (type) {
                const normalizedType = type.toUpperCase();

                if (!["INCOME", "EXPENSE"].includes(normalizedType)) {
                    return next({
                        statusCode: 400,
                        message: "Invalid type filter"
                    });
                }
                pipeline.push({
                    $match: {
                        "category.type": normalizedType
                    }
                });
            }

            pipeline.push(
                { $sort: { date: -1 } },
                { $skip: skip },
                { $limit: limitNumber }
            );

            const records = await FinancialRecord.aggregate(pipeline);

            const totalPipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                { $unwind: "$category" }
            ];

            if (type) {
                totalPipeline.push({
                    $match: {
                        "category.type": type
                    }
                });
            }

            totalPipeline.push({ $count: "total" });

            const totalResult = await FinancialRecord.aggregate(totalPipeline);
            const total = totalResult[0]?.total || 0;

            const totalPages = Math.ceil(total / limitNumber);

            res.status(200).locals.responseData = {
                status: true,
                message: "Records fetched successfully",
                data: records,
                meta: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages
                }
            };

            next();

        } catch (err) {
            next(err);
        }
    }

    async getRecordById(req, res, next)
    {
        try {

            const record = await FinancialRecord
                .findOne({
                    _id: req.params.id,
                    isDeleted: false
                })
                .populate("category", "name slug type");

            if (!record) {
                return next({
                    statusCode: 404,
                    message: "Financial record not found"
                });
            }

            res.status(200).locals.responseData = {
                message: "Record fetched successfully",
                data: record
            };

            next();

        } catch (err) {
            next(err);
        }
    }


    async updateRecord(req, res, next)
    {
        try {

            const record = await FinancialRecord.findOneAndUpdate(
                {
                    _id: req.params.id,
                    isDeleted: false
                },
                { ...req.body, updatedBy: req.user.sub },
                { new: true, runValidators: true }
            );

            if (!record) {
                return next({
                    statusCode: 404,
                    message: "Financial record not found"
                });
            }

            await invalidateCache("records:*");
            res.locals.auditLog = {
                action: "UPDATE",
                entity: "FinancialRecord",
                entityId: record._id,
                changes: {
                    ...req.body
                }
            };
            res.status(200).locals.responseData = {
                message: "Financial record updated successfully",
                data: record
            };

            next();

        } catch (err) {
            next(err);
        }
    }


    async deleteRecord(req, res, next)
    {
        try {

            const record = await FinancialRecord.findByIdAndUpdate(
                req.params.id,
                {
                    isDeleted: true,
                    updatedBy: req.user.sub
                },
                { new: true }
            );

            if (!record) {
                return next({
                    statusCode: 404,
                    message: "Financial record not found"
                });
            }

            await invalidateCache("records:*");
            res.locals.auditLog = {
                action: "DELETE",
                entity: "FinancialRecord",
                entityId: record._id,
            };
            res.status(200).locals.responseData = {
                message: "Financial record deleted successfully"
            };

            next();

        } catch (err) {
            next(err);
        }
    }

}

export default new FinancialRecordsController();