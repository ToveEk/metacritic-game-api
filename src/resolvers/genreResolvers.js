import { db } from "../config/db.js"

export const genreResolvers = {
    Query: {
        genres: async () => {
            try {
                const [rows] = await db.query('SELECT * FROM genres');
                return rows;
            } catch (error) {
                console.error('Error fetching genre data:', error);
                throw new Error('Failed to fetch genre data');
            }
        }
    }
}