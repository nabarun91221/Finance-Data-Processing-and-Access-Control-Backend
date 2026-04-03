import Category from "../models/category.model.js";
import invalidateCache from "../../../shared/middleware/cache-manager/cacheInvalidate.middleware.js";

class CategoriesController
{

    async createCategory(req, res, next)
    {
        try {

            const category = await Category.create({ ...req.body, createdBy: req.user.sub });

            await invalidateCache("categories:*");

            res.locals.auditLog = {
                action: "CREATE",
                entity: "Category",
                entityId: category._id,
            };

            res.status(201).locals.responseData = {
                message: "Category created successfully",
                data: category
            };

            next();

        } catch (err) {
            next(err);
        }
    }

    async getAllCategories(req, res, next)
    {
        try {

            const categories = await Category
                .find({ isActive: true })
                .populate("parentCategory", "name slug")
                .sort({ createdAt: -1 });

            res.status(200).locals.responseData = {
                message: "Categories fetched successfully",
                data: categories
            };
            next();

        } catch (err) {
            next(err);
        }
    }

    async getCategoryById(req, res, next)
    {
        try {

            const category = await Category
                .findById(req.params.id)
                .populate("parentCategory", "name slug");

            if (!category) {
                return next({
                    statusCode: 404,
                    message: "Category not found"
                });
            }

            res.status(200).locals.responseData = {
                message: "Category fetched successfully",
                data: category
            };

            next();

        } catch (err) {
            next(err);
        }
    }

    async updateCategory(req, res, next)
    {
        try {

            const category = await Category.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!category) {
                return next({
                    statusCode: 404,
                    message: "Category not found"
                });
            }

            await invalidateCache("categories:*");
            res.locals.auditLog = {
                action: "UPDATE",
                entity: "Category",
                entityId: category._id,
                changes: {
                    ...req.body
                }
            };
            res.status(200).locals.responseData = {
                message: "Category updated successfully",
                data: category
            };

            next();

        } catch (err) {
            next(err);
        }
    }

    async deleteCategory(req, res, next)
    {
        try {

            const category = await Category.findByIdAndDelete(req.params.id);

            if (!category) {
                return next({
                    statusCode: 404,
                    message: "Category not found"
                });
            }

            await invalidateCache("categories:*");

            res.locals.auditLog = {
                action: "DELETE",
                entity: "Category",
                entityId: category._id,
            };
            res.status(200).locals.responseData = {
                message: "Category deleted successfully"
            };

            next();

        } catch (err) {
            next(err);
        }
    }

}

export default new CategoriesController();