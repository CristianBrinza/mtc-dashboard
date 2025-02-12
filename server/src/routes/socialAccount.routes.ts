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
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65c1234567abcd890ef12345"
 *                   account_name:
 *                     type: string
 *                     example: "Company Twitter"
 *                   platform:
 *                     type: string
 *                     example: "Twitter"
 *                   link:
 *                     type: string
 *                     example: "https://twitter.com/company"
 */
router.get('/', getAllSocialAccounts);

/**
 * @swagger
 * /api/social-accounts/add:
 *   post:
 *     summary: Add a new social account (Admin & SMM only)
 *     tags: [Social Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_name:
 *                 type: string
 *                 example: "Company Twitter"
 *               platform:
 *                 type: string
 *                 example: "Twitter"
 *               link:
 *                 type: string
 *                 example: "https://twitter.com/company"
 *     responses:
 *       201:
 *         description: Social account added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65c1234567abcd890ef12345"
 *                 account_name:
 *                   type: string
 *                   example: "Company Twitter"
 *                 platform:
 *                   type: string
 *                   example: "Twitter"
 *                 link:
 *                   type: string
 *                   example: "https://twitter.com/company"
 */
router.post('/add', authenticateJWT, authorizeRoles('admin', 'smm'), addSocialAccount);

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
 *         description: The ID of the social account to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_name:
 *                 type: string
 *                 example: "Updated Twitter"
 *               platform:
 *                 type: string
 *                 example: "Twitter"
 *               link:
 *                 type: string
 *                 example: "https://twitter.com/updated_company"
 *     responses:
 *       200:
 *         description: Social account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65c1234567abcd890ef12345"
 *                 account_name:
 *                   type: string
 *                   example: "Updated Twitter"
 *                 platform:
 *                   type: string
 *                   example: "Twitter"
 *                 link:
 *                   type: string
 *                   example: "https://twitter.com/updated_company"
 */
router.put('/edit/:id', authenticateJWT, authorizeRoles('admin', 'smm'), editSocialAccount);

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
 *         description: The ID of the social account to delete
 *     responses:
 *       200:
 *         description: Social account deleted successfully
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.delete('/delete/:id', authenticateJWT, authorizeRoles('admin', 'smm'), deleteSocialAccount);

export default router;
