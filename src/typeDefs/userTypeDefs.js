import gql from "graphql-tag";

export const userTypeDefs = gql`
type User {
    id: ID!
    username: String!
    email: String!
    firstName: String
    lastName: String
}

type AuthPayload {
    user: User!
    token: String!
}

type Query {
    getUser(id: ID!): User
}

type Mutation {
    createUser(
        username: String!
        email: String!
        password: String!
        firstName: String
        lastName: String
    ): AuthPayload!

    loginUser(
        email: String!
        password: String!
    ): AuthPayload!
}
`
