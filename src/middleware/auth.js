import { JsonWebToken } from "../lib/jsonWebToken";
import dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';

dotenv.config();

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH, 'utf8');

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const [authenticationScheme, token] = authHeader ? authHeader.split(' ') : [undefined, undefined];

        if (authenticationScheme !== 'Bearer' || !token) {
            throw new Error('Invalid authorization header');
        }

        req.user = await JsonWebToken.verifyJWT(token, privateKey);
        next();
    } catch (error) {
        const statusCode = error.statusCode || 401;
        const err = new Error(http.STATUS_CODES[statusCode] || 'Unauthorized');
        err.statusCode = statusCode;
        next(err);
    }
}