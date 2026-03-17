import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";
import { GraphQLError } from "graphql";

dotenv.config()

export class AuthHelper {
    static getUserFromToken = (token) => {
        if (!token) return null;

        try {
            const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH, "utf8");
            const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
            return decoded
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    }

    static requireAuth = (context) => {
        if (!context.user) {
            throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
        }
        return context.user;
    }
}



