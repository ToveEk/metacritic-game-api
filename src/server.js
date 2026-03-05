import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import { typeDefs, resolvers } from "./models/schema.js";

dotenv.config();

try {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use("/graphql", expressMiddleware(server));

  const port = Number(process.env.PORT || 3700);
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
  });
} catch (err) {
  console.error("Failed to start server:", err);
  process.exit(1);
}