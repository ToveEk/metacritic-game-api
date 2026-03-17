import { db } from "../config/db.js"
import { GraphQLError } from "graphql"

/**
 * Resolvers for the Genre type, including queries for fetching genres.
 */
export const genreResolvers = {
    Query: {
        genres: async () => {
            try {
                const [rows] = await db.query('SELECT * FROM genres');
                return rows;
            } catch (error) {
                console.error('Error fetching genre data:', error);
                throw new GraphQLError('Failed to fetch genre data', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
            }
        }
    }
}