import { Router } from 'express';
import {
    createNotification,
    getAllNotifications,
    updateNotification,
    deleteNotification
} from '../controllers/notification.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Manage system notifications (Admin only)
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get latest N notifications (filtered by date/hour)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: n
 *         schema:
 *           type: integer
 *           default: 5
 *         description: How many latest notifications to return
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "30.04.2025"
 *         description: Filter by date (optional)
 *       - in: query
 *         name: start_hour
 *         schema:
 *           type: string
 *           example: "08:00"
 *         description: Start of hour interval (optional)
 *       - in: query
 *         name: end_hour
 *         schema:
 *           type: string
 *           example: "18:00"
 *         description: End of hour interval (optional)
 *     responses:
 *       200:
 *         description: List of filtered notifications
 *       500:
 *         description: Server error
 */
router.get(
    '/',
    authenticateJWT,
    authorizeRoles('admin'),
    getAllNotifications
);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - text
 *               - date
 *               - hour
 *             properties:
 *               type:
 *                 type: string
 *                 example: "info"
 *               text:
 *                 type: string
 *                 example: "Server maintenance scheduled at midnight"
 *               date:
 *                 type: string
 *                 example: "30.04.2025"
 *               hour:
 *                 type: string
 *                 example: "13:45"
 *               link:
 *                 type: string
 *                 example: "https://example.com/details"
 *     responses:
 *       201:
 *         description: Notification created
 *       500:
 *         description: Server error
 */
router.post(
    '/',
    authenticateJWT,
    authorizeRoles('admin'),
    createNotification
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: Update a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               text:
 *                 type: string
 *               date:
 *                 type: string
 *               hour:
 *                 type: string
 *               link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification updated
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.put(
    '/:id',
    authenticateJWT,
    authorizeRoles('admin'),
    updateNotification
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to delete
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:id',
    authenticateJWT,
    authorizeRoles('admin'),
    deleteNotification
);

export default router;
