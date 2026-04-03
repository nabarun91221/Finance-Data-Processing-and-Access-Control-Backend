/**
 * @swagger
 * tags:
 *   name: Financial Record Categories
 *   description: Manage categories used for financial records
 */


/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a financial record category
 *     tags: [Financial Record Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Operational Cost
 *               slug:
 *                 type: string
 *                 example: opco
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 example: EXPENSE
 *               parentCategory:
 *                 type: string
 *                 example: 64a7b8c9f0a12b3c4d5e6789
 *               icon:
 *                 type: string
 *                 example: wallet
 *               color:
 *                 type: string
 *                 example: "#FF5733"
 *
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               type:
 *                 type: string
 *               parentCategory:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Category created successfully
 */


/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all financial record categories
 *     tags: [Financial Record Categories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 */


/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Financial Record Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 */


/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update financial record category
 *     tags: [Financial Record Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               parentCategory:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               type:
 *                 type: string
 *               parentCategory:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */


/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete financial record category
 *     tags: [Financial Record Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */