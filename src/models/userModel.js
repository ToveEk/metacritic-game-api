import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
import { GraphQLError } from 'graphql';

/**
 * User model for handling user-related database operations.
 */
export class User {

    /**
     * Creates a new user in the database with the provided details. The password is hashed before being stored.
     * 
     * @param {string} username - The unique username for the user.
     * @param {string} email - The unique email address of the user.
     * @param {string} password - The plain text password to be hashed and stored in the database.
     * @param {string} firstName - The first name of the user.
     * @param {string} lastName - The last name of the user.
     * @returns {Object} - The created user object without the password hash.
     */
    static async createUser(username, email, password, firstName, lastName) {
        try {
            const passwordHash = await bcrypt.hash(password, 10);

            const [result] = await db.query(
                'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
                [username, email, passwordHash, firstName, lastName]
            );

            return {
                id: result.insertId,
                username,
                email,
                first_name: firstName,
                last_name: lastName
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw new GraphQLError('Failed to create user', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
    }

    /**
     * Finds a user by their email address.
     *
     * @param {string} email - The email address of the user to find.
     * @returns {Object|null} - The user object if found, otherwise null.
     */
    static async findUserByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    }

    /**
     * Verifies if the provided password matches the stored password hash.
     *
     * @param {string} password - The plain text password to verify.
     * @param {string} passwordHash - The hashed password stored in the database.
     * @returns {boolean} - True if the password is correct, otherwise false.
     */
    static async verifyPassword(password, passwordHash) {
        return bcrypt.compare(password, passwordHash);
    }
}