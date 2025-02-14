import { Request, Response } from 'express';
import Tag from '../models/tag.model';

/**
 * Get all tags (Public)
 */
export const getAllTags = async (req: Request, res: Response) => {
    try {
        const tags = await Tag.find();
        res.json(tags);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Add a new tag (Admin & SMM only)
 */
export const addTag = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const existingTag = await Tag.findOne({ name });

        if (existingTag) {
            return res.status(400).json({ message: 'Tag already exists' });
        }

        const newTag = new Tag({ name });
        await newTag.save();
        res.status(201).json({ message: 'Tag added successfully', tag: newTag });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Rename a tag (Admin & SMM only)
 */
export const renameTag = async (req: Request, res: Response) => {
    try {
        const { oldName, newName } = req.body;
        const tag = await Tag.findOne({ name: oldName });

        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        const existingTag = await Tag.findOne({ name: newName });
        if (existingTag) {
            return res.status(400).json({ message: 'New tag name already exists' });
        }

        tag.name = newName;
        await tag.save();
        res.json({ message: 'Tag renamed successfully', tag });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete a tag (Admin & SMM only)
 */
export const deleteTag = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const tag = await Tag.findOneAndDelete({ name });

        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
