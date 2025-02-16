import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
 * /api/instagram/get_insta_post:
 *   get:
 *     summary: Retrieve Instagram post details (downloading images to local /insta folder)
 *     description: "Fetches media, comments, and engagement metrics for a specific Instagram post from the microservice. Then downloads images locally."
 *     tags: [Instagram]
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         required: true
 *         description: "Instagram post shortcode or partial URL (ex: DGAagzvKDRD)"
 *       - in: query
 *         name: top_comments_count
 *         schema:
 *           type: integer
 *           default: 3
 *         required: false
 *         description: "Number of top comments to fetch"
 *     responses:
 *       200:
 *         description: "Instagram post data retrieved successfully, with local image URLs"
 *       400:
 *         description: "Bad request – Missing URL parameter"
 *       404:
 *         description: "Profile does not exist"
 *       500:
 *         description: "Server error"
 */
router.get("/get_insta_post", async (req, res) => {
    const { url, top_comments_count } = req.query;
    if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
    }

    try {
        // 1) Call your Flask microservice
        const response = await axios.get(`${SERVICES_URL}/get_insta_post`, {
            params: { url, top_comments_count },
            timeout: 15000,
        });

        const data = response.data;
        // If there's no Media array, just return
        if (!data.Media || !Array.isArray(data.Media)) {
            return res.json(data);
        }

        // 2) Prepare local /insta folder
        const instaDir = path.join(__dirname, "../../insta");
        if (!fs.existsSync(instaDir)) {
            fs.mkdirSync(instaDir, { recursive: true });
        }

        // 3) Download each image using axios (arraybuffer)
        for (const mediaItem of data.Media) {
            if (mediaItem.type === "image" && mediaItem.image_url) {
                try {
                    // Strip query params from the URL for a clean extension
                    const noQueryUrl = mediaItem.image_url.split("?")[0];
                    let extFromUrl = path.extname(noQueryUrl).toLowerCase();

                    // If no valid extension found, default to ".jpg"
                    const validExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
                    if (!validExts.includes(extFromUrl)) {
                        extFromUrl = ".jpg";
                    }

                    // Create unique local filename
                    const uniqueFilename = uuidv4() + extFromUrl;
                    const filePath = path.join(instaDir, uniqueFilename);

                    // Download the image as binary data
                    const imgResponse = await axios.get(mediaItem.image_url, {
                        responseType: "arraybuffer",
                        headers: {
                            // Provide a user-agent in case Instagram is picky
                            "User-Agent": "Mozilla/5.0 (compatible; InstaScraper/1.0)",
                        },
                    });
                    fs.writeFileSync(filePath, imgResponse.data);

                    // Replace external URL with local path
                    mediaItem.image_url = `/insta/${uniqueFilename}`;
                } catch (err) {
                    console.error("Error downloading image:", err);
                }
            } else if (mediaItem.type === "video" && mediaItem.video_url) {
                // (Optional) download the video similarly, or keep the external link
            }
        }

        // 4) Return updated data with local references
        return res.json(data);
    } catch (error: any) {
        console.error("Error fetching post data:", error.message);
        const statusCode = error.response?.status || 500;
        return res.status(statusCode).json({ error: "Error fetching post data" });
    }
});

export default router;
