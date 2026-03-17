import { db } from "../config/db.js"
import { GraphQLError } from "graphql";

/**
 * Resolvers for the Platform type, including queries for fetching platforms.
 */
export const platformResolvers = {
    Query: {
        platforms: async () => {
            try {
                const [rows] = await db.query('SELECT * FROM platforms');
                return rows;
            } catch (error) {
                console.error('Error fetching platform data:', error);
                throw new GraphQLError('Failed to fetch platform data', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
            }
        }
    }
}
