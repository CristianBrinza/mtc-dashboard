// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import User from '../models/user.model';
import { signToken } from '../utils/jwt';

/**
 * Register a new user
 * @param req
 * @param res
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, roles } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists)
            return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({ username, email, password, roles });
        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Login a user and generate a JWT token
 * @param req
 * @param res
 */
export const login = async (req: Request, res: Response) => {
    try {
        console.log(`🔐 [LOGIN ATTEMPT] Email: ${req.body.email}`);
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            console.log(`❌ [LOGIN FAILED] Invalid credentials for email: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = signToken({
            id: user._id,
            roles: user.roles,
            username: user.username,
        });

        console.log(`✅ [LOGIN SUCCESS] User: ${user.username} (ID: ${user._id}) | Roles: ${user.roles.join(", ")}`);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
        });

        return res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
                roles: user.roles,
            },
        });
    } catch (error: any) {
        console.error(`🔥 [LOGIN ERROR] ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Logout user by clearing cookies
 * @param req
 * @param res
 */
export const logout = async (req: Request, res: Response) => {
    try {
        console.log(`🔓 [LOGOUT] User ${req.user?.username} (ID: ${req.user?.id}) is logging out`);

        res.clearCookie('token');
        return res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
        console.error(`🔥 [LOGOUT ERROR] ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Update the profile of the authenticated user.
 * - A user can update: username, email, password, firstName, lastName, and profilePicture.
 * - If "roles" is provided, only an admin can update it.
 * @param req
 * @param res
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        console.log(`📝 [PROFILE UPDATE ATTEMPT] User ID: ${req.user.id}`);
        const userId = req.user.id; // set by the auth middleware
        const user = await User.findById(userId);
        if (!user){
            console.log(`❌ [PROFILE UPDATE FAILED] User not found`);
         return res.status(404).json({ message: 'User not found' });
        }
        // If roles are provided, only allow update if the current user is an admin
        if (req.body.roles && (!req.user.roles || !req.user.roles.includes('admin'))) {
            console.log(`⛔ [ROLE UPDATE DENIED] User ${req.user.username} attempted to change roles`);
            return res.status(403).json({ message: 'Forbidden: Only admin can update roles' });
        }

        console.log(`✅ [PROFILE UPDATE SUCCESS] Updated fields: ${JSON.stringify(req.body)}`);

        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`; // Save file path
        }

        // Update allowed fields if provided
        if (req.body.username !== undefined) user.username = req.body.username;
        if (req.body.email !== undefined) user.email = req.body.email;
        if (req.body.password !== undefined) user.password = req.body.password; // will be hashed by pre-save hook
        if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
        if (req.body.lastName !== undefined) user.lastName = req.body.lastName;
        if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;
        if (req.body.roles !== undefined && req.user.roles.includes('admin')) {
            user.roles = req.body.roles;
        }
        await user.save();
        const { password, ...updatedUser } = user.toObject();
        return res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error: any) {
        console.error(`🔥 [PROFILE UPDATE ERROR] ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
};
