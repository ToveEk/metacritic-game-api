import { gql } from "graphql-tag"

/**
 * GraphQL type definitions for the Game type, including queries for fetching games and mutations for creating, updating, and deleting games. Also includes a connection type for paginated results and a result type for delete operations.
 */
export const gameTypeDefs = gql`
    type GameConnection {
        games: [Game]
        totalCount: Int
        hasNextPage: Boolean
    }

    type Query {
        games(title: String, minMetascore: Int,limit: Int, offset: Int): GameConnection
        game(id: Int!): Game
        releasesPerYear: [ReleasePerYear]
    }
    
    type DeleteResult {
        success: Boolean!
        message: String!
    }

    type Mutation {
        createGame(
            title: String!
            release_date: String
            metascore: Int
            userscore: Float
            description: String
            developer: String
            publisher: String
            genreIds: [Int]
            platformIds: [Int]
        ): Game

        updateGame(
            id: Int!
            title: String
            release_date: String
            metascore: Int
            userscore: Float
            description: String
            developer: String
            publisher: String
            genreIds: [Int]
            platformIds: [Int]
        ): Game

        deleteGame(id: Int!): DeleteResult
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
    }
        
    type ReleasePerYear {
        year: Int
        count: Int
    }
`    