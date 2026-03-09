import { gql } from "graphql-tag"

export const genreTypeDefs = gql`
    type Query {
        genres: [Genre]
    }

    type Genre {
        id: Int
        name: String
    }`
