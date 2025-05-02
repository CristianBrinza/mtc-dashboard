import { Request, Response } from "express";
import SmmPost, { ISmmPost } from "../models/smmPost.model";

/**
 * Helper: convert empty strings to null
 */
function convertEmptyToNull(data: any) {
    const newData: any = {};
    for (const key in data) {
        if (typeof data[key] === "string" && data[key].trim() === "") {
            newData[key] = null;
        } else {
            newData[key] = data[key];
        }
    }
    return newData;
}

/**
 * Create a new SmmPost (and seed its first metricsHistory entry)
 */
export const createSmmPost = async (req: Request, res: Response) => {
    try {
        let data = convertEmptyToNull(req.body);

        // parse topcomments JSON if needed
        if (typeof data.topcomments === "string") {
            try {
                data.topcomments = JSON.parse(data.topcomments);
            } catch {
                return res.status(400).json({ error: "Invalid format for topcomments" });
            }
        }
        if (!Array.isArray(data.topcomments)) data.topcomments = [];

        // save
        const newPost = new SmmPost(data);
        await newPost.save();

        // initial metricsHistory entry
        await SmmPost.findByIdAndUpdate(newPost._id, {
            $push: {
                metricsHistory: {
                    timestamp: new Date(),
                    likes:     newPost.likes    ?? 0,
                    comments:  newPost.comments ?? 0,
                    shares:    newPost.shares   ?? 0,
                }
            }
        });

        return res.status(201).json({ message: "SmmPost created", smmPost: newPost });
    } catch (error: any) {
        console.error("Error creating smm post:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * Get all SmmPosts with advanced filtering, sorting, and pagination
 */
export const getAllSmmPosts = async (req: Request, res: Response) => {
    try {
        const queryObj: any = {};

        // … same multi‐value filtering by account, category, type, day, platform, tags, sub_category …
        if (req.query.accounts || req.query.account) {
            const accounts = req.query.accounts || req.query.account;
            queryObj.account = { $in: Array.isArray(accounts) ? accounts : [accounts] };
        }

        if (req.query.categories || req.query.category) {
            const categories = req.query.categories || req.query.category;
            queryObj.category = { $in: Array.isArray(categories) ? categories : [categories] };
        }

        if (req.query.types || req.query.type) {
            const types = req.query.types || req.query.type;
            queryObj.type = { $in: Array.isArray(types) ? types : [types] };
        }

        if (req.query.days || req.query.day_of_the_week) {
            const days = req.query.days || req.query.day_of_the_week;
            queryObj.day_of_the_week = { $in: Array.isArray(days) ? days : [days] };
        }

        if (req.query.platforms) {
            const platforms = Array.isArray(req.query.platforms)
                ? req.query.platforms
                : [req.query.platforms];
            queryObj.platform = { $in: platforms };
        }

        if (req.query.tags) {
            const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
            queryObj.tags = { $in: tags };
        }

        if (req.query.sub_categories) {
            const subCategories = Array.isArray(req.query.sub_categories)
                ? req.query.sub_categories
                : [req.query.sub_categories];
            queryObj.sub_category = { $in: subCategories };
        }

        // additional filters: description, sponsored, min/max likes
        if (req.query.description) {
            queryObj.description = req.query.description;
        }
        if (req.query.sponsored === "true") {
            queryObj.sponsored = true;
        } else if (req.query.sponsored === "false") {
            queryObj.sponsored = false;
        }
        if (req.query.min_likes || req.query.max_likes) {
            queryObj.likes = {};
            if (req.query.min_likes) queryObj.likes.$gte = Number(req.query.min_likes);
            if (req.query.max_likes) queryObj.likes.$lte = Number(req.query.max_likes);
        }

        // sorting
        let sortObj: any = {};
        if (req.query.sort) {
            (req.query.sort as string)
                .split(",")
                .forEach(field => {
                    if (field.startsWith("-")) sortObj[field.substring(1)] = -1;
                    else sortObj[field] = 1;
                });
        }

        // pagination
        const page  = Number(req.query.page)  || 1;
        const limit = Number(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const smmPosts = await SmmPost.find(queryObj)
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        const total = await SmmPost.countDocuments(queryObj);

        return res.json({ total, page, limit, smmPosts });
    } catch (error: any) {
        console.error("Error fetching smm posts:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * Update an existing SmmPost (and snapshot metricsHistory on change)
 */
export const updateSmmPost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let data = convertEmptyToNull(req.body);

        // parse topcomments JSON if needed
        if (typeof data.topcomments === "string") {
            try {
                data.topcomments = JSON.parse(data.topcomments);
            } catch {
                return res.status(400).json({ error: "Invalid format for topcomments" });
            }
        }
        if (!Array.isArray(data.topcomments)) data.topcomments = [];

        // fetch original
        const old = await SmmPost.findById(id);
        if (!old) return res.status(404).json({ error: "SmmPost not found" });

        // apply update
        const updated = await SmmPost.findByIdAndUpdate(id, data, { new: true });
        if (!updated) return res.status(404).json({ error: "SmmPost not found" });

        // if any of likes/comments/shares changed, push a history entry
        const changed = ["likes", "comments", "shares"].some(
            key => String(old[key]) !== String(updated[key])
        );
        if (changed) {
            await SmmPost.findByIdAndUpdate(id, {
                $push: {
                    metricsHistory: {
                        timestamp: new Date(),
                        likes:     updated.likes    ?? 0,
                        comments:  updated.comments ?? 0,
                        shares:    updated.shares   ?? 0,
                    }
                }
            });
        }

        return res.json({ message: "SmmPost updated", smmPost: updated });
    } catch (error: any) {
        console.error("Error updating smm post:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

/**
 * Delete a SmmPost
 */
export const deleteSmmPost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await SmmPost.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: "SmmPost not found" });
        return res.json({ message: "SmmPost deleted" });
    } catch (error: any) {
        console.error("Error deleting smm post:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
