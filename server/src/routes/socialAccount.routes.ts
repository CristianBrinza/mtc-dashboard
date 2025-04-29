import { Router } from 'express';
import {
    getAllSocialAccounts,
    addSocialAccount,
    editSocialAccount,
    deleteSocialAccount
} from '../controllers/socialAccount.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Social Accounts
 *   description: Manage social media accounts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LinkEntry:
 *       type: object
 *       required:
 *         - platform
 *         - link
 *       properties:
 *         _id:
 *           type: string
 *           example: "65dabc1234ef567890abcd12"
 *         platform:
 *           type: string
 *           example: "Twitter"
 *         link:
 *           type: string
 *           example: "https://twitter.com/company"
 *
 *     SocialAccount:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65daaa1234bb567890aaab12"
 *         account_name:
 *           type: string
 *           example: "Company Socials"
 *         links:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LinkEntry'
 */

/**
 * @swagger
 * /api/social-accounts:
 *   get:
 *     summary: Get all social accounts (Public)
 *     tags: [Social Accounts]
 *     responses:
 *       200:
 *         description: List of all social accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SocialAccount'
 */
router.get('/', getAllSocialAccounts);

/**
 * @swagger
 * /api/social-accounts/add:
 *   post:
 *     summary: Add or update social account with multiple links (Admin & SMM only)
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_name
 *               - links
 *             properties:
 *               account_name:
 *                 type: string
 *               links:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/LinkEntry'
 *     responses:
 *       201:
 *         description: Social account saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SocialAccount'
 */
router.post(
    '/add',
    authenticateJWT,
    authorizeRoles('admin', 'smm'),
    addSocialAccount
);

/**
 * @swagger
 * /api/social-accounts/edit/{id}:
 *   put:
 *     summary: Edit an existing social account (Admin & SMM only)
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_name
 *               - links
 *             properties:
 *               account_name:
 *                 type: string
 *               links:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/LinkEntry'
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SocialAccount'
 */
router.put(
    '/edit/:id',
    authenticateJWT,
    authorizeRoles('admin', 'smm'),
    editSocialAccount
);

/**
 * @swagger
 * /api/social-accounts/delete/{id}:
 *   delete:
 *     summary: Delete a social account (Admin & SMM only)
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID to delete
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/delete/:id',
    authenticateJWT,
    authorizeRoles('admin', 'smm'),
    deleteSocialAccount
);

export default router;
