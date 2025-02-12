import { Request, Response } from 'express';
import SocialAccount from '../models/socialAccount.model';

/**
 * Get all social accounts (Public)
 */
export const getAllSocialAccounts = async (req: Request, res: Response) => {
    try {
        const accounts = await SocialAccount.find();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Add a new social account (Admin & SMM only)
 */
export const addSocialAccount = async (req: Request, res: Response) => {
    try {
        const { account_name, platform, link } = req.body;

        const newAccount = new SocialAccount({ account_name, platform, link });
        await newAccount.save();
        res.status(201).json({ message: 'Social account added successfully', account: newAccount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Edit an existing social account (Admin & SMM only)
 */
export const editSocialAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { account_name, platform, link } = req.body;

        const account = await SocialAccount.findById(id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        account.account_name = account_name;
        account.platform = platform;
        account.link = link;
        await account.save();

        res.json({ message: 'Social account updated successfully', account });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete a social account (Admin & SMM only)
 */
export const deleteSocialAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if the provided ID is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid account ID format" });
        }

        // Find and delete the account
        const deletedAccount = await SocialAccount.findByIdAndDelete(id);

        if (!deletedAccount) {
            return res.status(404).json({ message: "Social account not found" });
        }

        return res.json({ message: "Social account deleted successfully", deletedAccount });

    } catch (error: any) {
        console.error("🔥 [DELETE ERROR]:", error.message);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

