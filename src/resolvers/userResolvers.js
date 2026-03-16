import { User } from '../models/userModel.js';
import { JsonWebToken } from '../lib/jsonWebToken.js';
import fs from 'fs';

export const userResolvers = {
    Mutation: {
        createUser: async (_, args) => {
            try {
                const newUser = await User.createUser(
                    args.username,
                    args.email,
                    args.password,
                    args.firstName,
                    args.lastName
                );

                const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH, 'utf8');
                const token = await JsonWebToken.generateJWT(
                    newUser,
                    privateKey,
                    process.env.JWT_EXPIRES_IN || '7d'
                );

                return {
                    user: newUser,
                    token
                };
            } catch (error) {
                throw new Error('Failed to create user: ' + error.message);
            }
        }
    }
}