import { gql } from "graphql-tag"
import { db } from "../config/db.js"

export const typeDefs = gql`
    type Query {
        Game: [Game]
    }

    type Game {
        id: Int,
        title: String,
        metascore: Int
    }
`

export const resolvers = {
    Query: {
        Game: async () => {
            try {
                const [rows] = await db.query('SELECT * FROM games');
                return rows;
            } catch (error) {
                console.error('Error fetching game data:', error);
                throw new Error('Failed to fetch game data');
            }
        }
    }
}