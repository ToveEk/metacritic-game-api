import { User } from '../models/userModel.js';
import { JsonWebToken } from '../lib/jsonWebToken.js';
import fs from 'fs';

export const userResolvers = {
    Query: {
        getUser: async (_, { args }) => {
            try {
                const user = await User.findUserByEmail(args.id);
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            } catch (error) {
                throw new Error('Failed to fetch user: ' + error.message);
            }
        }
    },

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
        },

        loginUser: async (_, { email, password }) => {
            try {
                const user = await User.findUserByEmail(email);
                if (!user) {
                    throw new Error('User not found');
                }

                const isPasswordValid = await User.verifyPassword(password, user.password_hash);
                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH, 'utf8');
                const token = await JsonWebToken.generateJWT(
                    user,
                    privateKey,
                    process.env.JWT_EXPIRES_IN || '7d'
                );

                return {
                    user,
                    token
                };

            } catch (error) {
                throw new Error('Failed to login user: ' + error.message);
            }
        }
    }
}