import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./typeDefs/typeDefs.js";
import { resolvers } from "./resolvers/resolvers.js";
import { AuthHelper } from "./lib/authHelper.js";

dotenv.config();

// Start the server
try {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      return {
        message: error.message,
        extensions: {
          code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
        }
      }
    }
  });

  await server.start();

  app.use("/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.split("Bearer ")[1] || null;
        const user = AuthHelper.getUserFromToken(token);
        return { user };
      }
    })
  );

  const baseUrl = process.env.BASE_URL;
  const port = Number(process.env.PORT || 3700);
  app.listen(port, () => {
    console.log(`Server is running on ${baseUrl}:${port}/graphql`);
  });
} catch (err) {
  console.error("Failed to start server:", err);
  process.exit(1);
}