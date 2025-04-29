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
        const { account_name, links } = req.body as { account_name: string; links: {platform:string;link:string}[] };

        // If exists, append new links to avoid dupes
        let acct = await SocialAccount.findOne({ account_name });
        if (!acct) {
            acct = new SocialAccount({ account_name, links });
        } else {
            // merge unique links
            links.forEach(linkObj => {
                if (!acct!.links.some(l => l.platform === linkObj.platform && l.link === linkObj.link)) {
                    acct!.links.push(linkObj);
                }
            });
        }
        await acct.save();
        res.status(201).json({ message: 'Social account saved', account: acct });
    } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

/**
 * Edit an existing social account (Admin & SMM only)
 */
export const editSocialAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { account_name, links } = req.body as { account_name: string; links: {platform:string;link:string}[] };

        const acct = await SocialAccount.findById(id);
        if (!acct) return res.status(404).json({ message: 'Account not found' });

        acct.account_name = account_name;
        acct.links = links;
        await acct.save();
        res.json({ message: 'Social account updated', account: acct });
    } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
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

