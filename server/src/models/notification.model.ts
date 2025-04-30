import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
    type: string;
    text: string;
    date: string; // e.g. "30.04.2025"
    hour: string; // e.g. "13:45"
    link?: string;
}

const NotificationSchema = new Schema<INotification>({
    type: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: String, required: true },
    hour: { type: String, required: true },
    link: { type: String, default: null }
}, { timestamps: true });

export default model<INotification>('Notification', NotificationSchema);
