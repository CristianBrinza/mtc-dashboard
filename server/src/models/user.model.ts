// backend/src/models/user.model.ts
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    roles: string[];
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email:    { type: String, required: true, unique: true },
        password: { type: String, required: true },
        roles:    { type: [String], default: ['user'] },
        firstName: { type: String, default: null },
        lastName: { type: String, default: null },
        profilePicture: { type: String, default: null },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export default model<IUser>('User', UserSchema);
