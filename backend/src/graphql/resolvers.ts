import { prismaClient } from "../lib/db";
import { GraphQLScalarType, Kind, GraphQLError } from "graphql";
import { GraphQLContext } from "./index";

// Custom DateTime scalar
const dateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "DateTime custom scalar type",
  serialize(value: any) {
    // Send Date to client as ISO string
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value: any) {
    // Convert client input to Date
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Helper to ensure user is authenticated
function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.user;
}

export const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    // Organization Queries
    organizations: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Only return user's own organization
      return await prismaClient.organization.findMany({
        where: { id: user.orgId },
      });
    },
    organization: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Users can only view their own organization
      if (id !== user.orgId) {
        throw new GraphQLError("Access denied to this organization", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return await prismaClient.organization.findUnique({ where: { id } });
    },

    // User Queries - Scoped to organization
    users: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Only return users from same organization
      return await prismaClient.user.findMany({ 
        where: { orgId: user.orgId, isDeleted: false } 
      });
    },
    user: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Ensure user belongs to same organization
      const targetUser = await prismaClient.user.findUnique({ where: { id } });
      if (!targetUser || targetUser.orgId !== user.orgId) {
        throw new GraphQLError("User not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return targetUser;
    },
    usersByOrg: async (_: any, { orgId }: { orgId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Users can only query their own organization
      if (orgId !== user.orgId) {
        throw new GraphQLError("Access denied to this organization", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return await prismaClient.user.findMany({
        where: { orgId, isDeleted: false },
      });
    },
    usersByRole: async (_: any, { role }: { role: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Only return users from same organization with specified role
      return await prismaClient.user.findMany({
        where: { orgId: user.orgId, role: role as any, isDeleted: false },
      });
    },

    // Product Queries
    products: async () => {
      return await prismaClient.product.findMany();
    },
    product: async (_: any, { id }: { id: string }) => {
      return await prismaClient.product.findUnique({ where: { id } });
    },
    productsByMake: async (_: any, { make }: { make: string }) => {
      return await prismaClient.product.findMany({ where: { make } });
    },

    // Order Queries - Scoped to organization
    orders: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Only return orders from user's organization
      return await prismaClient.order.findMany({
        where: { orgId: user.orgId },
      });
    },
    order: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Ensure order belongs to same organization
      const order = await prismaClient.order.findUnique({ where: { id } });
      if (!order || order.orgId !== user.orgId) {
        throw new GraphQLError("Order not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return order;
    },
    ordersByUser: async (_: any, { userId }: { userId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Verify the userId belongs to same organization
      const targetUser = await prismaClient.user.findUnique({ where: { id: userId } });
      if (!targetUser || targetUser.orgId !== user.orgId) {
        throw new GraphQLError("User not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return await prismaClient.order.findMany({ 
        where: { userId, orgId: user.orgId } 
      });
    },
    ordersByOrg: async (_: any, { orgId }: { orgId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Users can only query orders from their own organization
      if (orgId !== user.orgId) {
        throw new GraphQLError("Access denied to this organization", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return await prismaClient.order.findMany({ where: { orgId } });
    },
    ordersByStatus: async (_: any, { status }: { status: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Only return orders from user's organization with specified status
      return await prismaClient.order.findMany({ 
        where: { orgId: user.orgId, orderStatus: status as any } 
      });
    },

    // Ticket Queries - Scoped to organization
    tickets: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Only return tickets from user's organization
      return await prismaClient.ticket.findMany({
        where: { orgId: user.orgId },
      });
    },
    ticket: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Ensure ticket belongs to same organization
      const ticket = await prismaClient.ticket.findUnique({ where: { id } });
      if (!ticket || ticket.orgId !== user.orgId) {
        throw new GraphQLError("Ticket not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return ticket;
    },
    ticketsByUser: async (_: any, { userId }: { userId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Verify the userId belongs to same organization
      const targetUser = await prismaClient.user.findUnique({ where: { id: userId } });
      if (!targetUser || targetUser.orgId !== user.orgId) {
        throw new GraphQLError("User not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return await prismaClient.ticket.findMany({ 
        where: { userId, orgId: user.orgId } 
      });
    },
    ticketsByOrder: async (_: any, { orderId }: { orderId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Verify the order belongs to same organization
      const order = await prismaClient.order.findUnique({ where: { id: orderId } });
      if (!order || order.orgId !== user.orgId) {
        throw new GraphQLError("Order not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return await prismaClient.ticket.findMany({ 
        where: { orderId, orgId: user.orgId } 
      });
    },

    // Transaction Queries - Scoped to organization
    transactions: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Get all transactions for orders in user's organization
      return await prismaClient.transaction.findMany({
        where: { 
          order: { orgId: user.orgId } 
        },
      });
    },
    transaction: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Ensure transaction's order belongs to same organization
      const transaction = await prismaClient.transaction.findUnique({ 
        where: { id },
        include: { order: true },
      });
      if (!transaction || transaction.order.orgId !== user.orgId) {
        throw new GraphQLError("Transaction not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return transaction;
    },
    transactionsByOrder: async (_: any, { orderId }: { orderId: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Verify the order belongs to same organization
      const order = await prismaClient.order.findUnique({ where: { id: orderId } });
      if (!order || order.orgId !== user.orgId) {
        throw new GraphQLError("Order not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return await prismaClient.transaction.findMany({ where: { orderId } });
    },
  },

  Mutation: {
    // Organization Mutations
    createOrganization: async (_: any, { input }: any, context: GraphQLContext) => {
      // Only allow admins or create without auth for initial setup
      // You might want to restrict this further based on your requirements
      return await prismaClient.organization.create({ data: input });
    },
    updateOrganization: async (_: any, { id, ...data }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Users can only update their own organization
      if (id !== user.orgId) {
        throw new GraphQLError("Access denied to this organization", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      // Only admins should update organization (add role check if needed)
      return await prismaClient.organization.update({
        where: { id },
        data,
      });
    },
    deleteOrganization: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Users can only delete their own organization (typically only admins)
      if (id !== user.orgId) {
        throw new GraphQLError("Access denied to this organization", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      await prismaClient.organization.delete({ where: { id } });
      return true;
    },

    // User Mutations - Scoped to organization
    createUser: async (_: any, { input }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // New user must be created in the same organization
      const userData = { ...input, orgId: user.orgId };
      return await prismaClient.user.create({ data: userData });
    },
    updateUser: async (_: any, { id, ...data }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Verify target user belongs to same organization
      const targetUser = await prismaClient.user.findUnique({ where: { id } });
      if (!targetUser || targetUser.orgId !== user.orgId) {
        throw new GraphQLError("User not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      // Prevent changing orgId
      delete data.orgId;
      return await prismaClient.user.update({
        where: { id },
        data,
      });
    },
    deleteUser: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Verify target user belongs to same organization
      const targetUser = await prismaClient.user.findUnique({ where: { id } });
      if (!targetUser || targetUser.orgId !== user.orgId) {
        throw new GraphQLError("User not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      await prismaClient.user.update({
        where: { id },
        data: { isDeleted: true },
      });
      return true;
    },

    // Product Mutations - Products are global, but you might want to scope them too
    createProduct: async (_: any, { input }: any, context: GraphQLContext) => {
      requireAuth(context);
      return await prismaClient.product.create({ data: input });
    },
    updateProduct: async (_: any, { id, ...data }: any, context: GraphQLContext) => {
      requireAuth(context);
      return await prismaClient.product.update({
        where: { id },
        data,
      });
    },
    deleteProduct: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      requireAuth(context);
      await prismaClient.product.delete({ where: { id } });
      return true;
    },

    // Order Mutations - Scoped to organization
    createOrder: async (_: any, { input }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // New order must be created in the same organization
      const orderData = { 
        ...input, 
        orgId: user.orgId,
        // If userId not provided, use authenticated user's ID
        userId: input.userId || user.userId,
      };
      
      // Verify userId belongs to same organization if provided
      if (input.userId) {
        const targetUser = await prismaClient.user.findUnique({ 
          where: { id: input.userId } 
        });
        if (!targetUser || targetUser.orgId !== user.orgId) {
          throw new GraphQLError("User not found or access denied", {
            extensions: { code: "FORBIDDEN" },
          });
        }
      }
      
      return await prismaClient.order.create({ data: orderData });
    },
    updateOrderStatus: async (_: any, { id, status }: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Verify order belongs to same organization
      const order = await prismaClient.order.findUnique({ where: { id } });
      if (!order || order.orgId !== user.orgId) {
        throw new GraphQLError("Order not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      return await prismaClient.order.update({
        where: { id },
        data: { orderStatus: status },
      });
    },
    deleteOrder: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // Verify order belongs to same organization
      const order = await prismaClient.order.findUnique({ where: { id } });
      if (!order || order.orgId !== user.orgId) {
        throw new GraphQLError("Order not found or access denied", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      await prismaClient.order.delete({ where: { id } });
      return true;
    },
  },

  // Field Resolvers for nested relationships
  Organization: {
    users: async (parent: any) => {
      return await prismaClient.user.findMany({
        where: { orgId: parent.id, isDeleted: false },
      });
    },
    orders: async (parent: any) => {
      return await prismaClient.order.findMany({ where: { orgId: parent.id } });
    },
    tickets: async (parent: any) => {
      return await prismaClient.ticket.findMany({ where: { orgId: parent.id } });
    },
  },

  User: {
    organization: async (parent: any) => {
      return await prismaClient.organization.findUnique({
        where: { id: parent.orgId },
      });
    },
    orders: async (parent: any) => {
      return await prismaClient.order.findMany({ where: { userId: parent.id } });
    },
    tickets: async (parent: any) => {
      return await prismaClient.ticket.findMany({ where: { userId: parent.id } });
    },
    transactions: async (parent: any) => {
      return await prismaClient.transaction.findMany({
        where: { userId: parent.id },
      });
    },
  },

  Order: {
    user: async (parent: any) => {
      return await prismaClient.user.findUnique({ where: { id: parent.userId } });
    },
    organization: async (parent: any) => {
      return await prismaClient.organization.findUnique({
        where: { id: parent.orgId },
      });
    },
    products: async (parent: any) => {
      return await prismaClient.orderProduct.findMany({
        where: { orderId: parent.id },
      });
    },
    tickets: async (parent: any) => {
      return await prismaClient.ticket.findMany({ where: { orderId: parent.id } });
    },
    transactions: async (parent: any) => {
      return await prismaClient.transaction.findMany({
        where: { orderId: parent.id },
      });
    },
  },

  OrderProduct: {
    order: async (parent: any) => {
      return await prismaClient.order.findUnique({
        where: { id: parent.orderId },
      });
    },
    product: async (parent: any) => {
      return await prismaClient.product.findUnique({
        where: { id: parent.productId },
      });
    },
  },

  Ticket: {
    organization: async (parent: any) => {
      return await prismaClient.organization.findUnique({
        where: { id: parent.orgId },
      });
    },
    user: async (parent: any) => {
      return await prismaClient.user.findUnique({ where: { id: parent.userId } });
    },
    order: async (parent: any) => {
      return await prismaClient.order.findUnique({
        where: { id: parent.orderId },
      });
    },
  },

  Transaction: {
    user: async (parent: any) => {
      return await prismaClient.user.findUnique({ where: { id: parent.userId } });
    },
    order: async (parent: any) => {
      return await prismaClient.order.findUnique({
        where: { id: parent.orderId },
      });
    },
  },
};
