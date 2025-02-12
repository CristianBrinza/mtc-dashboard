import { Schema, model, Document } from 'mongoose';

interface ISubcategory {
    _id: string;
    name: string;
}

export interface ICategory extends Document {
    name: string;
    subcategories: ISubcategory[];
}

const SubcategorySchema = new Schema<ISubcategory>({
    _id: { type: Schema.Types.ObjectId, auto: true }, // Unique ID for each subcategory
    name: { type: String, required: true }
});

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true }, // Ensures no duplicate category names
    subcategories: [SubcategorySchema] // Stores multiple subcategories
});

export default model<ICategory>('Category', CategorySchema);
