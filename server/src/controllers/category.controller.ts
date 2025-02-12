import { Request, Response } from 'express';
import Category from '../models/category.model';

/**
 * Get all categories and subcategories (Public)
 */
export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Add a new category (Admin & SMM only)
 */
export const addCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const newCategory = new Category({ name, subcategories: [] });
        await newCategory.save();
        res.status(201).json({ message: 'Category added successfully', category: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Add a new subcategory to a category (Admin & SMM only)
 */
export const addSubcategory = async (req: Request, res: Response) => {
    try {
        const { categoryName, subcategoryName } = req.body;

        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Add subcategory only if it does not exist within this category
        if (category.subcategories.some(sub => sub.name === subcategoryName)) {
            return res.status(400).json({ message: 'Subcategory already exists in this category' });
        }

        category.subcategories.push({ name: subcategoryName });
        await category.save();
        res.json({ message: 'Subcategory added successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Rename a category (Admin & SMM only)
 */
export const renameCategory = async (req: Request, res: Response) => {
    try {
        const { oldName, newName } = req.body;

        // Ensure category exists
        const category = await Category.findOne({ name: oldName });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Ensure the new category name is unique
        const existingCategory = await Category.findOne({ name: newName });
        if (existingCategory) {
            return res.status(400).json({ message: 'New category name already exists' });
        }

        category.name = newName;
        await category.save();
        res.json({ message: 'Category renamed successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Rename a subcategory (Admin & SMM only)
 */
export const renameSubcategory = async (req: Request, res: Response) => {
    try {
        const { categoryName, oldSubcategoryName, newSubcategoryName } = req.body;

        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Find the subcategory
        const subcategory = category.subcategories.find(sub => sub.name === oldSubcategoryName);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        subcategory.name = newSubcategoryName;
        await category.save();
        res.json({ message: 'Subcategory renamed successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
