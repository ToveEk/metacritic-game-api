import { gql } from "graphql-tag"

/**
 * GraphQL type definitions for the Genre type, including a query for fetching all genres.
 */
export const genreTypeDefs = gql`
    type Query {
        genres: [Genre]
    }

    type Genre {
        id: Int
        name: String
    }`
