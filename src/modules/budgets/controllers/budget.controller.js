import Budget from "../models/budget.model.js";
import invalidateCache from "../../../shared/middleware/cache-manager/cacheInvalidate.middleware.js";
class BudgetController
{
    createBudget = async (req, res, next) =>
    {
        try {
            const budget = await Budget.create({ ...req.body, createdBy: req.user.sub });
            if (budget) {
                await invalidateCache("budgets:*")
                res.locals.auditLog = {
                    action: "CREATE",
                    entity: "Budget",
                    entityId: budget._id
                };
                res.status(201).locals.responseData = {
                    success: true,
                    message: "Budget created successfully",
                    data: budget
                };

                next();
            }

        } catch (error) {
            next(error);
        }
    };


    getAllBudgets = async (req, res, next) =>
    {
        try {
            console.log("hitting controller..")
            const budgets = await Budget.find()
                .populate("createdBy", "name email")
                .sort({ createdAt: -1 });


            res.status(200).locals.responseData = {
                success: true,
                count: budgets.length,
                data: budgets
            };
            next();

        } catch (error) {
            next(error);
        }
    };

    getBudgetById = async (req, res, next) =>
    {
        try {
            const budget = await Budget.findById(req.params.id)
                .populate("createdBy", "name email");

            if (!budget) {

                return res.status(404).json({
                    success: false,
                    message: "Budget not found"
                });
            }
            res.locals.responseData = {
                success: true,
                data: budget
            };
            next();

        } catch (error) {
            next(error);
        }
    };

    updateBudget = async (req, res, next) =>
    {
        try {
            const budget = await Budget.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!budget) {
                return res.status(404).json({
                    success: false,
                    message: "Budget not found"
                });
            }

            await invalidateCache("budgets:*")
            res.locals.auditLog = {
                action: "UPDATE",
                entity: "Budget",
                entityId: budget._id,
                changes: {
                    ...req.body
                }
            };
            res.status(200).locals.responseData = {
                success: true,
                message: "Budget updated successfully",
                data: budget
            };
            next();

        } catch (error) {
            next(error);
        }
    };


    deleteBudget = async (req, res, next) =>
    {
        try {
            const budget = await Budget.findByIdAndDelete(req.params.id);

            if (!budget) {
                return res.status(404).json({
                    success: false,
                    message: "Budget not found"
                });
            }
            await invalidateCache("budgets:*")
            res.locals.auditLog = {
                action: "DELETE",
                entity: "Budget",
                entityId: budget._id
            };
            res.status(200).locals.responseData = {
                success: true,
                message: "Budget deleted successfully"
            };
            next();

        } catch (error) {
            next(error);
        }
    };
}

export default new BudgetController();