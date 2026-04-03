/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: System audit trail for tracking actions performed by users
 */


/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieve system audit logs including actions performed by users on different entities.
 *     tags: [Audit Logs]
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *         description: Page number for pagination
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *         description: Number of records per page
 *
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         example: FinancialRecord
 *         description: Filter logs by entity type
 *
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *         example: UPDATE
 *         description: Filter logs by action type
 *
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         example: 64a7b8c9f0a12b3c4d5e6789
 *         description: Filter logs by user ID
 *
 *     responses:
 *       200:
 *         description: Audit logs fetched successfully
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
 *                   example: Audit logs fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       action:
 *                         type: string
 *                         example: UPDATE
 *                       entity:
 *                         type: string
 *                         example: FinancialRecord
 *                       entityId:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - missing required scope
 */