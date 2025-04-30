import { Request, Response } from 'express';
import Notification from '../models/notification.model';

/**
 * Create a new notification
 */
export const createNotification = async (req: Request, res: Response) => {
    try {
        const newNotification = new Notification(req.body);
        await newNotification.save();
        return res.status(201).json({ message: 'Notification created', notification: newNotification });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Get latest N notifications, optionally filtered by date and hour interval
 * - n: number of notifications (default 5)
 * - date: "DD.MM.YYYY" (optional)
 * - start_hour, end_hour: "HH:mm" (optional, default 00:00–23:59)
 */
export const getAllNotifications = async (req: Request, res: Response) => {
    try {
        const {
            n = 5,
            date,
            start_hour = '00:00',
            end_hour = '23:59'
        } = req.query as Record<string, string>;

        const query: any = {};

        if (date) {
            query.date = date;
        }

        query.hour = {
            $gte: start_hour,
            $lte: end_hour
        };

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(n));

        return res.json(notifications);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Update a notification by ID
 */
export const updateNotification = async (req: Request, res: Response) => {
    try {
        const updated = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Notification not found' });
        return res.json({ message: 'Notification updated', notification: updated });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a notification by ID
 */
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const deleted = await Notification.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Notification not found' });
        return res.json({ message: 'Notification deleted' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
