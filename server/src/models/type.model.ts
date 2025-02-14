import { Schema, model, Document } from 'mongoose';

export interface IType extends Document {
    name: string;
}

const TypeSchema = new Schema<IType>({
    name: { type: String, required: true, unique: true },
});

export default model<IType>('Type', TypeSchema);
