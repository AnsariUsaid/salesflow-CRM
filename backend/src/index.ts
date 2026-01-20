import "dotenv/config";
import express from "express";
import cors from "cors";
import { expressMiddleware } from "@as-integrations/express5";
import { clerkMiddleware } from "@clerk/express";
import { prismaClient } from "./lib/db";
import createApolloGraphqlServer from "./graphql/index";
import { clerkAuthMiddleware } from "./lib/auth";

async function init() {
  const app = express();
  const PORT = process.env.PORT || 8000;

  // Validate Clerk environment variables
  if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    console.error("❌ ERROR: Clerk environment variables are missing!");
    console.error("   CLERK_PUBLISHABLE_KEY:", process.env.CLERK_PUBLISHABLE_KEY ? "✅" : "❌ Missing");
    console.error("   CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "✅" : "❌ Missing");
    console.error("\nPlease add these to your backend/.env file:");
    console.error("CLERK_PUBLISHABLE_KEY=pk_test_xxxxx");
    console.error("CLERK_SECRET_KEY=sk_test_xxxxx");
    process.exit(1);
  }

  console.log("🔑 Clerk Keys: ✅ Loaded successfully");

  app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }));
  app.use(express.json());

  // Clerk middleware to verify JWT tokens
  app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  }));

  app.get("/", (req, res) => {
    res.json({ message: "SalesFlow CRM Backend API", status: "running" });
  });

  // Custom auth middleware to extract user and orgId from database
  app.use("/graphql", clerkAuthMiddleware);

  // GraphQL endpoint with context
  app.use(
    "/graphql",
    expressMiddleware(await createApolloGraphqlServer(), {
      context: async ({ req }) => {
        return { user: req.user };
      },
    })
  );

  app.listen(PORT, () => {
    console.log(`🚀 SalesFlow CRM Backend is running on port ${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

init();
