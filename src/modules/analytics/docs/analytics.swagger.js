/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Dashboard analytics and financial insights
 */


/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get financial summary
 *     description: Returns total income, expenses, net balance, budget and runway.
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Financial summary generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Financial summary generated
 *                 data:
 *                   type: object
 *                   properties:
 *                     income:
 *                       type: number
 *                       example: 100000
 *                     expense:
 *                       type: number
 *                       example: 45000
 *                     net:
 *                       type: string
 *                       example: "55000"
 *                     budget:
 *                       type: number
 *                       example: 200000
 *                     runway:
 *                       type: number
 *                       example: 155000
 */


/**
 * @swagger
 * /analytics/category:
 *   get:
 *     summary: Get category wise totals
 *     description: Returns total financial amounts grouped by category.
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Category totals generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: Operational Cost
 *                       type:
 *                         type: string
 *                         example: EXPENSE
 *                       total:
 *                         type: number
 *                         example: 25000
 */


/**
 * @swagger
 * /analytics/mtrend:
 *   get:
 *     summary: Get monthly financial trends
 *     description: Returns financial totals grouped by month and type.
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Monthly trend generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: number
 *                             example: 2026
 *                           month:
 *                             type: number
 *                             example: 3
 *                           type:
 *                             type: string
 *                             example: EXPENSE
 *                       total:
 *                         type: number
 *                         example: 4500
 */


/**
 * @swagger
 * /analytics/activity:
 *   get:
 *     summary: Get recent financial activity
 *     description: Returns latest financial transactions for dashboard activity feed.
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Recent activity fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       category:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 */