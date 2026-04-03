/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Budget management APIs
 */


/**
 * @swagger
 * /budgets:
 *   post:
 *     summary: Create a new budget
 *     tags: [Budgets]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalBudget
 *               - financialYear
 *               - startDate
 *               - endDate
 *             properties:
 *               totalBudget:
 *                 type: number
 *                 example: 200000
 *               financialYear:
 *                 type: string
 *                 example: 2025-2026
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-04-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-31
 *               isActive:
 *                 type: boolean
 *                 example: true
 *
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - totalBudget
 *               - financialYear
 *               - startDate
 *               - endDate
 *             properties:
 *               totalBudget:
 *                 type: number
 *               financialYear:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *
 *     responses:
 *       201:
 *         description: Budget created successfully
 */


/**
 * @swagger
 * /budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Budgets]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */


/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     summary: Get budget by ID
 *     tags: [Budgets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget fetched successfully
 *       404:
 *         description: Budget not found
 */


/**
 * @swagger
 * /budgets/{id}:
 *   patch:
 *     summary: Update budget
 *     tags: [Budgets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalBudget:
 *                 type: number
 *               financialYear:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               totalBudget:
 *                 type: number
 *               financialYear:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       404:
 *         description: Budget not found
 */


/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     summary: Delete budget
 *     tags: [Budgets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *       404:
 *         description: Budget not found
 */