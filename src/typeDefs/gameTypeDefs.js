import { gql } from "graphql-tag"

export const gameTypeDefs = gql`
    type Query {
        games: [Game]
        game(id: Int!): Game
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
        genres: [Genre]
        platforms: [Platform]
    }`
