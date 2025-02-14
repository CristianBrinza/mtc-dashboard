import { Router } from 'express';
import {
    getAllTags,
    addTag,
    renameTag,
    deleteTag
} from '../controllers/Tag.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Manage tags for categorizing content
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags (Public)
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of all tags
 */
router.get('/', getAllTags);

/**
 * @swagger
 * /api/tags/add:
 *   post:
 *     summary: Add a new tag (Admin & SMM only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "marketing"
 *     responses:
 *       201:
 *         description: Tag added successfully
 *       400:
 *         description: Tag already exists
 *       500:
 *         description: Server error
 */
router.post('/add', authenticateJWT, authorizeRoles('admin', 'smm'), addTag);

/**
 * @swagger
 * /api/tags/rename:
 *   put:
 *     summary: Rename a tag (Admin & SMM only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldName:
 *                 type: string
 *                 example: "marketing"
 *               newName:
 *                 type: string
 *                 example: "advertising"
 *     responses:
 *       200:
 *         description: Tag renamed successfully
 *       404:
 *         description: Tag not found
 *       400:
 *         description: New tag name already exists
 *       500:
 *         description: Server error
 */
router.put('/rename', authenticateJWT, authorizeRoles('admin', 'smm'), renameTag);

/**
 * @swagger
 * /api/tags/delete/{name}:
 *   delete:
 *     summary: Delete a tag (Admin & SMM only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the tag to delete
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
router.delete('/delete/:name', authenticateJWT, authorizeRoles('admin', 'smm'), deleteTag);

export default router;
