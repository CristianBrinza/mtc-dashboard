// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login, logout, updateProfile } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
 import { authorizeRoles } from '../middleware/role.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (Admin Only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               username: "cristi"
 *               email: "user@example.com"
 *               password: "Cbcb2002."
 *               roles: ["admin"]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Server error
 */
//one time use at server initiation
//router.post('/register', register);
// To enforce admin-only registration, yo
// u might use middleware like:
 router.post('/register', authenticateJWT, authorizeRoles('admin'), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user and get a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: "user@example.com"
 *               password: "Cbcb2002."
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout a user and clear authentication cookies
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized (if token is missing)
 *       500:
 *         description: Server error
 */
router.post('/logout', authenticateJWT, logout);

/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     summary: Update user profile
 *     description: >
 *       Allows authenticated users to update their profile.
 *       A user can update username, email, password, firstName, lastName, and profilePicture.
 *       Only an admin can update the roles field.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               username: "newUsername"
 *               email: "newemail@example.com"
 *               password: "newPassword123"
 *               firstName: "John"
 *               lastName: "Doe"
 *               profilePicture: "http://example.com/pic.jpg"
 *               roles: ["admin"]  # Only effective if the current user is admin
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Forbidden - Only admin can update roles
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/update', authenticateJWT, upload.single('profilePicture'), updateProfile);


export default router;
