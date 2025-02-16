import { Schema, model, Document } from 'mongoose';

interface ITopComment {
    created_at: string | null;
    owner: string | null;
    text: string | null;
}

export interface ISmmPost extends Document {
    account: string | null;
    likes: number | null;
    shares: number | null;
    comments: number | null;
    sponsored: boolean | null;
    date: string | null; // e.g. "10.02.2025"
    hour: string | null; // e.g. "10:20"
    type: string | null;
    tags: string[] | null;
    category: string | null;
    sub_category: string | null;
    link: string | null;
    day_of_the_week: string | null;
    topcomments: ITopComment[] | null;
    platform: string | null;
    description: string | null;
    images: string[] | null;

}

const TopCommentSchema = new Schema<ITopComment>({
    created_at: { type: String, default: null },
    owner: { type: String, default: null },
    text: { type: String, default: null },
}, { _id: false }); // no separate _id for each sub-document

const SmmPostSchema = new Schema<ISmmPost>({
    account: { type: String, default: null },
    likes: { type: Number, default: null },
    shares: { type: Number, default: null },
    comments: { type: Number, default: null },
    sponsored: { type: Boolean, default: null },
    date: { type: String, default: null },
    hour: { type: String, default: null },
    type: { type: String, default: null },
    tags: { type: [String], default: null },
    category: { type: String, default: null },
    sub_category: { type: String, default: null },
    link: { type: String, default: null },
    day_of_the_week: { type: String, default: null },
    topcomments: { type: [TopCommentSchema], default: null },
    platform: { type: String, default: null },
    description: { type: String, default: null },
    images: { type: [String], default: null },
}, { timestamps: true });

export default model<ISmmPost>("SmmPost", SmmPostSchema);
