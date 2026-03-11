import { gql } from "graphql-tag"

/**
 * GraphQL type definitions for the Platform type, including a query for fetching all platforms.
 */
export const platformTypeDefs = gql`
    type Query {
        platforms: [Platform]
    }

    type Platform {
        id: Int
        name: String
    }
`
