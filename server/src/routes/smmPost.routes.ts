import { Router } from "express";
import multer from "multer";
import SmmPost from "../models/smmPost.model";
import {
    createSmmPost,
    getAllSmmPosts,
    updateSmmPost,
    deleteSmmPost,
} from "../controllers/smmPost.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();
const upload = multer(); // we only accept JSON, so no file fields

/**
 * @swagger
 * components:
 *   schemas:
 *     MetricsHistory:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *         likes:
 *           type: number
 *         comments:
 *           type: number
 *         shares:
 *           type: number
 *     SmmPost:
 *       type: object
 *       properties:
 *         _id:               { type: string }
 *         account:           { type: string }
 *         likes:             { type: number }
 *         shares:            { type: number }
 *         comments:          { type: number }
 *         sponsored:         { type: boolean }
 *         date:              { type: string }
 *         hour:              { type: string }
 *         type:              { type: string }
 *         tags:
 *           type: array
 *           items: { type: string }
 *         category:          { type: string }
 *         sub_category:      { type: string }
 *         link:              { type: string }
 *         day_of_the_week:   { type: string }
 *         topcomments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               created_at: { type: string }
 *               owner:      { type: string }
 *               text:       { type: string }
 *         description:       { type: string }
 *         platform:          { type: string }
 *         images:
 *           type: array
 *           items: { type: string }
 *         metricsHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MetricsHistory'
 *         createdAt:         { type: string, format: date-time }
 *         updatedAt:         { type: string, format: date-time }
 */

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
 *     summary: Get all SMM posts with filtering, sorting, pagination
 *     tags: [SmmPost]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       # (list your existing query parameters here…)
 *     responses:
 *       200:
 *         description: A paginated list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:    { type: number }
 *                 page:     { type: number }
 *                 limit:    { type: number }
 *                 smmPosts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SmmPost'
 *       500:
 *         description: Server error
 */
router.get(
    "/",
    authenticateJWT,
    authorizeRoles("admin", "smm"),
    getAllSmmPosts
);

/**
 * @swagger
 * /api/smmpost:
 *   post:
 *     summary: Create a new SMM post
 *     tags: [SmmPost]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account:         { type: string }
 *               likes:           { type: number }
 *               shares:          { type: number }
 *               comments:        { type: number }
 *               sponsored:       { type: boolean }
 *               date:            { type: string }
 *               hour:            { type: string }
 *               type:            { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               category:        { type: string }
 *               sub_category:    { type: string }
 *               link:            { type: string }
 *               day_of_the_week: { type: string }
 *               description:     { type: string }
 *               platform:        { type: string }
 *               images:
 *                 type: array
 *                 items: { type: string }
 *               topcomments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     created_at: { type: string }
 *                     owner:      { type: string }
 *                     text:       { type: string }
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 smmPost: { $ref: '#/components/schemas/SmmPost' }
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    authenticateJWT,
    authorizeRoles("admin", "smm"),
    upload.none(),
    createSmmPost
);

/**
 * @swagger
 * /api/smmpost/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [SmmPost]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Post ID
 *     responses:
 *       200:
 *         description: The requested post
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SmmPost' }
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:id",
    authenticateJWT,
    authorizeRoles("admin", "smm"),
    async (req, res) => {
        try {
            const post = await SmmPost.findById(req.params.id);
            if (!post) return res.status(404).json({ error: "Post not found" });
            return res.json(post);
        } catch (err) {
            console.error("Get by ID failed:", err);
            return res.status(500).json({ error: "Server error" });
        }
    }
);

/**
 * @swagger
 * /api/smmpost/{id}:
 *   put:
 *     summary: Update an existing post
 *     tags: [SmmPost]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account:         { type: string }
 *               likes:           { type: number }
 *               shares:          { type: number }
 *               comments:        { type: number }
 *               sponsored:       { type: boolean }
 *               date:            { type: string }
 *               hour:            { type: string }
 *               type:            { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               category:        { type: string }
 *               sub_category:    { type: string }
 *               link:            { type: string }
 *               day_of_the_week: { type: string }
 *               description:     { type: string }
 *               platform:        { type: string }
 *               images:
 *                 type: array
 *                 items: { type: string }
 *               topcomments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     created_at: { type: string }
 *                     owner:      { type: string }
 *                     text:       { type: string }
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 smmPost: { $ref: '#/components/schemas/SmmPost' }
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.put(
    "/:id",
    authenticateJWT,
    authorizeRoles("admin", "smm"),
    upload.none(),
    updateSmmPost
);

/**
 * @swagger
 * /api/smmpost/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [SmmPost]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete(
    "/:id",
    authenticateJWT,
    authorizeRoles("admin", "smm"),
    deleteSmmPost
);

export default router;
