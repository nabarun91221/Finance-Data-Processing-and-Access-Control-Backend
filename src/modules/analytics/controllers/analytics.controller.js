import FinancialRecord from "../../financial-records/models/financialRecords.model.js"
import getFinancialYear from "../../../shared/utils/getFinancialYear.js";
import Budget from "../../budgets/models/budget.model.js";
class AnalyticsController
{
    getFinancialSummary = async (req, res, next) =>
    {
        try {

            const result = await FinancialRecord.aggregate([
                { $match: { isDeleted: false } },

                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },

                { $unwind: "$category" },

                {
                    $group: {
                        _id: "$category.type",
                        total: { $sum: "$amount" }
                    }
                }
            ]);

            let income = 0;
            let expense = 0;

            result.forEach(r =>
            {
                if (r._id === "INCOME") income = r.total;
                if (r._id === "EXPENSE") expense = r.total;
            });

            const currentFinancialYear = getFinancialYear();

            const budgetOfThisFinancialYear = await Budget.findOne({ isActive: true, financialYear: currentFinancialYear });

            res.status(200).locals.responseData = {
                success: true,
                message: "Financial summary generated",
                data: {
                    income,
                    expense,
                    net: `${income - expense}`,
                    budget: budgetOfThisFinancialYear?.totalBudget,
                    runway: budgetOfThisFinancialYear?.totalBudget - expense,
                }
            };

            next();

        } catch (err) {
            next(err);
        }
    }
    getCategoryTotals = async (req, res, next) =>
    {
        try {

            const result = await FinancialRecord.aggregate([
                { $match: { isDeleted: false } },

                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },

                { $unwind: "$category" },

                {
                    $group: {
                        _id: "$category.name",
                        type: { $first: "$category.type" },
                        total: { $sum: "$amount" }
                    }
                },

                { $sort: { total: -1 } }
            ])

            res.status(200).locals.responseData = {
                success: true,
                message: "Category totals generated",
                data: result
            }

            next()

        } catch (err) {
            next(err)
        }
    }
    getRecentActivity = async (req, res, next) =>
    {
        try {

            const records = await FinancialRecord
                .find({ isDeleted: false })
                .populate("category", "name type")
                .sort({ createdAt: -1 })
                .limit(10)

            res.status(200).locals.responseData = {
                success: true,
                message: "Recent activity fetched",
                data: records
            }

            next()

        } catch (err) {
            next(err)
        }
    }
    getMonthlyTrend = async (req, res, next) =>
    {
        try {

            const result = await FinancialRecord.aggregate([
                { $match: { isDeleted: false } },

                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },

                { $unwind: "$category" },

                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" },
                            type: "$category.type"
                        },
                        total: { $sum: "$amount" }
                    }
                },

                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])

            res.status(200).locals.responseData = {
                success: true,
                message: "Monthly trend generated",
                data: result
            }

            next()

        } catch (err) {
            next(err)
        }
    }
}

export default new AnalyticsController();

