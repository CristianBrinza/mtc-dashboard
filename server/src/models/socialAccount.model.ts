import { Schema, model, Document } from 'mongoose';

export interface ISocialAccount extends Document {
    account_name: string;
    platform: string;
    link: string;
}

const SocialAccountSchema = new Schema<ISocialAccount>({
    account_name: { type: String, required: true },
    platform: { type: String, required: true },
    link: { type: String, required: true }
}, { timestamps: true });

export default model<ISocialAccount>('SocialAccount', SocialAccountSchema);
