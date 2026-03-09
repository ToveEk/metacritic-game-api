import { db } from "../config/db.js"

export const platformResolvers = {
    Query: {
        platforms: async () => {
            try {
                const [rows] = await db.query('SELECT * FROM platforms');
                return rows;
            } catch (error) {
                console.error('Error fetching platform data:', error);
                throw new Error('Failed to fetch platform data');
            }
        }
    }
}
