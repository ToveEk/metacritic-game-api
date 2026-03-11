import { gameResolvers } from "./gameResolvers.js"
import { genreResolvers } from "./genreResolvers.js"
import { platformResolvers } from "./platformResolvers.js"

/**
 * Combined GraphQL resolvers for the entire API, including resolvers for games, genres, and platforms.
 */
export const resolvers = {
    Query: {
        ...gameResolvers.Query,
        ...genreResolvers.Query,
        ...platformResolvers.Query
    },

    Mutation: {
        ...gameResolvers.Mutation
    },

    Game: {
        ...gameResolvers.Game
    }
}