import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";

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
            throw new Error("Unauthorized");
        }
        return context.user;
    }
}



