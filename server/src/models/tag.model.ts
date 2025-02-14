import { Schema, model, Document } from 'mongoose';

export interface ITag extends Document {
    name: string;
}

const TagSchema = new Schema<ITag>({
    name: { type: String, required: true, unique: true },
});

export default model<ITag>('Tag', TagSchema);
