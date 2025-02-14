import { Request, Response } from 'express';
import Type from '../models/type.model';

/**
 * Get all types (Public)
 */
export const getAllTypes = async (req: Request, res: Response) => {
    try {
        const types = await Type.find();
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Add a new type (Admin & SMM only)
 */
export const addType = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const existingType = await Type.findOne({ name });

        if (existingType) {
            return res.status(400).json({ message: 'Type already exists' });
        }

        const newType = new Type({ name });
        await newType.save();
        res.status(201).json({ message: 'Type added successfully', type: newType });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Rename a type (Admin & SMM only)
 */
export const renameType = async (req: Request, res: Response) => {
    try {
        const { oldName, newName } = req.body;
        const type = await Type.findOne({ name: oldName });

        if (!type) {
            return res.status(404).json({ message: 'Type not found' });
        }

        const existingType = await Type.findOne({ name: newName });
        if (existingType) {
            return res.status(400).json({ message: 'New type name already exists' });
        }

        type.name = newName;
        await type.save();
        res.json({ message: 'Type renamed successfully', type });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete a type (Admin & SMM only)
 */
export const deleteType = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const type = await Type.findOneAndDelete({ name });

        if (!type) {
            return res.status(404).json({ message: 'Type not found' });
        }

        res.json({ message: 'Type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
