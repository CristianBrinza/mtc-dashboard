import { Router } from 'express';
import {
    getAllTypes,
    addType,
    renameType,
    deleteType
} from '../controllers/Type.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Types
 *   description: Manage types of content (e.g., static, carousel, animation)
 */

/**
 * @swagger
 * /api/types:
 *   get:
 *     summary: Get all types (Public)
 *     tags: [Types]
 *     responses:
 *       200:
 *         description: List of all types
 */
router.get('/', getAllTypes);

/**
 * @swagger
 * /api/types/add:
 *   post:
 *     summary: Add a new type (Admin & SMM only)
 *     tags: [Types]
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
 *                 example: "carousel"
 *     responses:
 *       201:
 *         description: Type added successfully
 *       400:
 *         description: Type already exists
 *       500:
 *         description: Server error
 */
router.post('/add', authenticateJWT, authorizeRoles('admin', 'smm'), addType);

/**
 * @swagger
 * /api/types/rename:
 *   put:
 *     summary: Rename a type (Admin & SMM only)
 *     tags: [Types]
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
 *                 example: "carousel"
 *               newName:
 *                 type: string
 *                 example: "slideshow"
 *     responses:
 *       200:
 *         description: Type renamed successfully
 *       404:
 *         description: Type not found
 *       400:
 *         description: New type name already exists
 *       500:
 *         description: Server error
 */
router.put('/rename', authenticateJWT, authorizeRoles('admin', 'smm'), renameType);

/**
 * @swagger
 * /api/types/delete/{name}:
 *   delete:
 *     summary: Delete a type (Admin & SMM only)
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the type to delete
 *     responses:
 *       200:
 *         description: Type deleted successfully
 *       404:
 *         description: Type not found
 *       500:
 *         description: Server error
 */
router.delete('/delete/:name', authenticateJWT, authorizeRoles('admin', 'smm'), deleteType);

export default router;
