import { gql } from "graphql-tag"
import { db } from "../config/db.js"

export const typeDefs = gql`
    type Query {
        hello: String!
        dbTime: String!
    }
`

export const resolvers = {
    Query: {
        hello: () => "Hello GraphQL!",
        dbTime: async () => {
            const [rows] = await db.query("SELECT NOW() AS now")
            return String(rows[0].now)
        }
    }
}