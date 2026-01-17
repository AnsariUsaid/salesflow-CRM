import express from "express";
import cors from "cors";
import { expressMiddleware } from "@as-integrations/express5";
import { prismaClient } from "./lib/db";
import createApolloGraphqlServer from "./graphql/index";

async function init() {
  const app = express();
  const PORT = process.env.PORT || 8000;

  app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ message: "SalesFlow CRM Backend API", status: "running" });
  });

  app.use("/graphql", expressMiddleware(await createApolloGraphqlServer()));

  app.listen(PORT, () => {
    console.log(`🚀 SalesFlow CRM Backend is running on port ${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

init();
