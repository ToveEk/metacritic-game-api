import { User } from '../models/userModel.js';
import { JsonWebToken } from '../lib/jsonWebToken.js';
import { GraphQLError } from 'graphql';

export const userResolvers = {
    Query: {
        getUser: async (_, { email }) => {
            try {
                const user = await User.findUserByEmail(email);
                if (!user) {
                    throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
                }
                return user;
            } catch (error) {
                if (error instanceof GraphQLError) {
                    throw error;
                } else {
                    console.error('Error fetching user:', error);
                    throw new GraphQLError('Failed to fetch user', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
                }
            }
        }
    },

    Mutation: {
        createUser: async (_, args) => {
            try {
                const existingUser = await User.findUserByEmail(args.email);

                if (existingUser) {
                    throw new GraphQLError('Email already in use', { extensions: { code: 'BAD_USER_INPUT' } });
                }

                const newUser = await User.createUser(
                    args.username,
                    args.email,
                    args.password,
                    args.firstName,
                    args.lastName
                );

                const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf8');
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
                if (error instanceof GraphQLError) {
                    throw error;
                } else {
                    console.error('Error creating user:', error);
                    throw new GraphQLError('Failed to create user', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
                }
            }
        },

        loginUser: async (_, { email, password }) => {
            try {
                const user = await User.findUserByGitHubId(email);
                if (!user) {
                    throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
                }

                const isPasswordValid = await User.verifyPassword(password, user.password_hash);
                if (!isPasswordValid) {
                    throw new GraphQLError('Invalid password', { extensions: { code: 'UNAUTHENTICATED' } });
                }

                const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf8');
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
                if (error instanceof GraphQLError) {
                    throw error;
                } else {
                    console.error('Error logging in user:', error);
                    throw new GraphQLError('Failed to login user', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
                }
            }
        },

        loginWithGitHub: async (_, { email, gitHubId }) => {
            try {
                let user = await User.findUserByGitHubId(gitHubId);
                
                if (!user) {
                    user = await User.createUser(
                        '', // No username for GitHub users
                        email,
                        '', // No password for GitHub users
                        '', // No first name for GitHub users
                        '',  // No last name for GitHub users
                        gitHubId
                    );
                }
                const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf8');
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
                if (error instanceof GraphQLError) {
                    throw error;
                } else {
                    console.error('Error logging in with GitHub:', error);
                    throw new GraphQLError('Failed to login with GitHub', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
                }
            }
        }
    }
}