import { gameTypeDefs } from "./gameTypeDefs.js"
import { genreTypeDefs } from "./genreTypeDefs.js"
import { platformTypeDefs } from "./platformTypeDefs.js"

/**
 * Combined GraphQL type definitions for the entire API, including types for games, genres, and platforms.
 */
export const typeDefs = [
    gameTypeDefs,
    genreTypeDefs,
    platformTypeDefs
]
