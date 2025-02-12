import { Router } from 'express';
import {
    getAllCategories,
    addCategory,
    addSubcategory,
    renameCategory,
    renameSubcategory
} from '../controllers/category.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category and Subcategory management
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories and subcategories (Public)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all categories
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /api/categories/add:
 *   post:
 *     summary: Add a new category (Admin & SMM only)
 *     tags: [Categories]
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
 *                 example: "Finance"
 *     responses:
 *       201:
 *         description: Category added successfully
 *       400:
 *         description: Category already exists
 *       500:
 *         description: Server error
 */
router.post('/add', authenticateJWT, authorizeRoles('admin', 'smm'), addCategory);

/**
 * @swagger
 * /api/categories/add-subcategory:
 *   post:
 *     summary: Add a new subcategory to a category (Admin & SMM only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "Finance"
 *               subcategoryName:
 *                 type: string
 *                 example: "Tax Documents"
 *     responses:
 *       200:
 *         description: Subcategory added successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.post('/add-subcategory', authenticateJWT, authorizeRoles('admin', 'smm'), addSubcategory);

/**
 * @swagger
 * /api/categories/rename:
 *   put:
 *     summary: Rename a category (Admin & SMM only)
 *     tags: [Categories]
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
 *                 example: "Finance"
 *               newName:
 *                 type: string
 *                 example: "Financial Management"
 *     responses:
 *       200:
 *         description: Category renamed successfully
 *       404:
 *         description: Category not found
 *       400:
 *         description: New category name already exists
 *       500:
 *         description: Server error
 */
router.put('/rename', authenticateJWT, authorizeRoles('admin', 'smm'), renameCategory);

/**
 * @swagger
 * /api/categories/rename-subcategory:
 *   put:
 *     summary: Rename a subcategory (Admin & SMM only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "Finance"
 *               oldSubcategoryName:
 *                 type: string
 *                 example: "Tax Documents"
 *               newSubcategoryName:
 *                 type: string
 *                 example: "Financial Reports"
 *     responses:
 *       200:
 *         description: Subcategory renamed successfully
 *       404:
 *         description: Category or Subcategory not found
 *       500:
 *         description: Server error
 */
router.put('/rename-subcategory', authenticateJWT, authorizeRoles('admin', 'smm'), renameSubcategory);

export default router;
