import { gql } from "graphql-tag"
import { db } from "../config/db.js"

export const typeDefs = gql`
    type Query {
        games: [Game]
        genres: [Genre]
        platforms: [Platform]
    }

    type Game {
        id: Int
        title: String
        release_date: String
        metascore: Int
        userscore: Float
        description: String
        developer: String
        publisher: String
    }

    type Genre {
        id: Int
        name: String
    }

    type Platform {
        id: Int
        name: String
    }
`

export const resolvers = {
    Query: {
        games: async () => {
            try {
                const [rows] = await db.query('SELECT * FROM games');
                return rows.map(game => ({
                    ...game,
                    release_date: game.release_date ? game.release_date.toISOString().split('T')[0] : null
                }));
            } catch (error) {
                console.error('Error fetching game data:', error);
                throw new Error('Failed to fetch game data');
            }
        },

        genres: async () => {
            try {
                const [rows] = await db.query('SELECT * FROM genres');
                return rows;
            } catch (error) {
                console.error('Error fetching genre data:', error);
                throw new Error('Failed to fetch genre data');
            }
        },

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