import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const SERVICES_URL = process.env.SERVICES_URL as string || "http://127.0.0.1:5030";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Instagram
 *   description: Retrieve Instagram post and profile data from the microservice
 */

/**
 * @swagger
 * /api/instagram/get_profile:
 *   get:
 *     summary: Retrieve Instagram profile data
 *     description: Fetches user profile details such as followers, posts, and bio from an Instagram profile.
 *     tags: [Instagram]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Instagram username
 *     responses:
 *       200:
 *         description: Instagram profile data retrieved successfully.
 *       400:
 *         description: Bad request – Missing username parameter.
 *       404:
 *         description: Profile does not exist.
 *       500:
 *         description: Server error.
 */
router.get("/get_profile", async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: "Username parameter is required" });
    }

    try {
        const response = await axios.get(`${SERVICES_URL}/get_profile`, {
            params: { username },
            timeout: 15000, // ⏳ Allow up to 15 seconds to get a response
        });
        res.json(response.data);
    } catch (error: any) {
        console.error("Error fetching profile data:", error.message);
        res.status(error.response?.status || 500).json({ error: "Error fetching profile data" });
    }
});

/**
 * @swagger
 * /api/instagram/get_insta_post:
 *   get:
 *     summary: Retrieve Instagram post details
 *     description: Fetches media, comments, and engagement metrics for a specific Instagram post.
 *     tags: [Instagram]
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         required: true
 *         description: Instagram post URL
 *       - in: query
 *         name: top_comments_count
 *         schema:
 *           type: integer
 *           default: 3
 *         required: false
 *         description: Number of top comments to fetch
 *     responses:
 *       200:
 *         description: Instagram post data retrieved successfully.
 *       400:
 *         description: Bad request – Missing URL parameter.
 *       404:
 *         description: Profile does not exist.
 *       500:
 *         description: Server error.
 */
router.get("/get_insta_post", async (req, res) => {
    const { url, top_comments_count } = req.query;
    if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
    }

    try {
        const response = await axios.get(`${SERVICES_URL}/get_insta_post`, {
            params: { url, top_comments_count },
            timeout: 15000, // ⏳ Allow up to 15 seconds to get a response
        });
        res.json(response.data);
    } catch (error: any) {
        console.error("Error fetching post data:", error.message);
        res.status(error.response?.status || 500).json({ error: "Error fetching post data" });
    }
});

/**
 * @swagger
 * /api/instagram/get_insta_post_links:
 *   get:
 *     summary: Retrieve recent Instagram post links
 *     description: Fetches a list of recent Instagram post links from a specific profile.
 *     tags: [Instagram]
 *     parameters:
 *       - in: query
 *         name: operator
 *         schema:
 *           type: string
 *         required: true
 *         description: Instagram username to fetch recent posts
 *       - in: query
 *         name: nr
 *         schema:
 *           type: integer
 *           default: 5
 *         required: false
 *         description: Number of recent post links to retrieve
 *     responses:
 *       200:
 *         description: Instagram post links retrieved successfully.
 *       400:
 *         description: Bad request – Missing username parameter.
 *       404:
 *         description: Profile does not exist.
 *       500:
 *         description: Server error.
 */
router.get("/get_insta_post_links", async (req, res) => {
    const { operator, nr } = req.query;
    if (!operator) {
        return res.status(400).json({ error: "Operator parameter is required" });
    }

    try {
        const response = await axios.get(`${SERVICES_URL}/get_insta_post_links`, {
            params: { operator, nr },
            timeout: 15000, // ⏳ Allow up to 15 seconds to get a response
        });
        res.json(response.data);
    } catch (error: any) {
        console.error("Error fetching post links:", error.message);
        res.status(error.response?.status || 500).json({ error: "Error fetching post links" });
    }
});

export default router;
