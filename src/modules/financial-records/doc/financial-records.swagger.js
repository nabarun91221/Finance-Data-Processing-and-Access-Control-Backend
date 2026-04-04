/**
 * @swagger
 * tags:
 *   name: Financial Records
 *   description: Manage financial transactions and records
 */


/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create a financial record
 *     tags: [Financial Records]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               category:
 *                 type: string
 *                 example: 64a7b8c9f0a12b3c4d5e6789
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-04-10
 *               note:
 *                 type: string
 *                 example: Monthly salary
 *
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               note:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Financial record created successfully
 */


/**
 * @swagger
 * /records:
 *   get:
 *     summary: Get financial records
 *     description: Retrieve financial records with pagination and filtering
 *     tags: [Financial Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *         description: Number of records per page
 *
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-04-01
 *         description: Filter records starting from this date
 *
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-05-01
 *         description: Filter records until this date
 *
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         example: 69ce386b985b9665facf6328
 *         description: Filter by category ID
 *
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         example: EXPENSE
 *         description: Filter by category type
 *
 *     responses:
 *       200:
 *         description: Records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     totalPages:
 *                       type: number
 */


/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get financial record by ID
 *     tags: [Financial Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Financial record ID
 *
 *     responses:
 *       200:
 *         description: Record fetched successfully
 *       404:
 *         description: Financial record not found
 */


/**
 * @swagger
 * /records/{id}:
 *   patch:
 *     summary: Update financial record
 *     tags: [Financial Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Financial record ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               note:
 *                 type: string
 *
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               note:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Financial record updated successfully
 *       404:
 *         description: Financial record not found
 */


/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Delete financial record
 *     tags: [Financial Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Financial record ID
 *
 *     responses:
 *       200:
 *         description: Financial record deleted successfully
 *       404:
 *         description: Financial record not found
 */