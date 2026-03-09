import { gql } from "graphql-tag"

export const platformTypeDefs = gql`
    type Query {
        platforms: [Platform]
    }

    type Platform {
        id: Int
        name: String
    }
`
