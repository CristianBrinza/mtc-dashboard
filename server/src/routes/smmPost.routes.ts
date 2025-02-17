import { Router } from "express";
import multer from "multer";
import {
    createSmmPost,
    getAllSmmPosts,
    updateSmmPost,
    deleteSmmPost,
} from "../controllers/smmPost.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: SmmPost
 *   description: Manage SMM posts (Admin & SMM only)
 */

/**
 * @swagger
 * /api/smmpost:
 *   get:
 *     summary: Get all SMM posts with advanced filtering, sorting, and pagination
 *     tags: [SmmPost]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accounts
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by one or more account names
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by one or more categories
 *       - in: query
 *         name: types
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by one or more types
 *       - in: query
 *         name: days
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by one or more days (day_of_the_week)
 *       - in: query
 *         name: platforms
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by one or more platforms
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by one or more tags
 *       - in: query
 *         name: sub_categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by one or more sub-categories
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filter by description text
 *       - in: query
 *         name: sponsored
 *         schema:
 *           type: boolean
 *         description: Filter by sponsored posts (true/false)
 *       - in: query
 *         name: min_likes
 *         schema:
 *           type: number
 *         description: Minimum number of likes
 *       - in: query
 *         name: max_likes
 *         schema:
 *           type: number
 *         description: Maximum number of likes
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sorting fields (e.g. "comments,-likes"; multiple fields comma separated)
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful response with filtered data
 *       500:
 *         description: Server error
 */
router.get("/", authenticateJWT, authorizeRoles("admin", "smm"), getAllSmmPosts);

/**
 * @swagger
 * /api/smmpost:
 *   post:
 *     summary: Create a new SmmPost
 *     tags: [SmmPost]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               account:
 *                 type: string
 *                 example: "Orange"
 *               likes:
 *                 type: number
 *                 example: 150
 *               shares:
 *                 type: number
 *                 example: 10
 *               comments:
 *                 type: number
 *                 example: 25
 *               sponsored:
 *                 type: boolean
 *                 example: true
 *               date:
 *                 type: string
 *                 example: "10.02.2025"
 *               hour:
 *                 type: string
 *                 example: "10:20"
 *               type:
 *                 type: string
 *                 example: "carousel"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["funny", "promo"]
 *               category:
 *                 type: string
 *                 example: "commercial"
 *               sub_category:
 *                 type: string
 *                 example: "production"
 *               description:
 *                 type: string
 *                 example: "Description of post"
 *               link:
 *                 type: string
 *                 example: "https://www.instagram.com/p/ABC123/"
 *               day_of_the_week:
 *                 type: string
 *                 example: "monday"
 *               topcomments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     created_at:
 *                       type: string
 *                     owner:
 *                       type: string
 *                     text:
 *                       type: string
 *                 example:
 *                   - created_at: "2025-02-11T21:21:43"
 *                     owner: "satoshifamily_cahul"
 *                     text: "❤️"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["image1.jpg", "image2.jpg"]
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload images/videos
 *     responses:
 *       201:
 *         description: SmmPost created
 *       500:
 *         description: Server error
 */
router.post("/", authenticateJWT, authorizeRoles("admin", "smm"), upload.array("files"), createSmmPost);

/**
 * @swagger
 * /api/smmpost/{id}:
 *   put:
 *     summary: Update an existing SmmPost
 *     tags: [SmmPost]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the SmmPost to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["image1.jpg", "image2.jpg"]
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload images/videos
 *     responses:
 *       200:
 *         description: SmmPost updated
 *       404:
 *         description: SmmPost not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticateJWT, authorizeRoles("admin", "smm"), upload.array("files"), updateSmmPost);

/**
 * @swagger
 * /api/smmpost/{id}:
 *   delete:
 *     summary: Delete a SmmPost
 *     tags: [SmmPost]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the SmmPost to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SmmPost deleted
 *       404:
 *         description: SmmPost not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticateJWT, authorizeRoles("admin", "smm"), deleteSmmPost);

export default router;
