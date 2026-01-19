import { prismaClient } from "../lib/db";
import { GraphQLScalarType, Kind } from "graphql";

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

export const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    // Organization Queries
    organizations: async () => {
      return await prismaClient.organization.findMany();
    },
    organization: async (_: any, { id }: { id: string }) => {
      return await prismaClient.organization.findUnique({ where: { id } });
    },

    // User Queries
    users: async () => {
      return await prismaClient.user.findMany({ where: { isDeleted: false } });
    },
    user: async (_: any, { id }: { id: string }) => {
      return await prismaClient.user.findUnique({ where: { id } });
    },
    usersByOrg: async (_: any, { orgId }: { orgId: string }) => {
      return await prismaClient.user.findMany({
        where: { orgId, isDeleted: false },
      });
    },
    usersByRole: async (_: any, { role }: { role: string }) => {
      return await prismaClient.user.findMany({
        where: { role: role as any, isDeleted: false },
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

    // Order Queries
    orders: async () => {
      return await prismaClient.order.findMany();
    },
    order: async (_: any, { id }: { id: string }) => {
      return await prismaClient.order.findUnique({ where: { id } });
    },
    ordersByUser: async (_: any, { userId }: { userId: string }) => {
      return await prismaClient.order.findMany({ where: { userId } });
    },
    ordersByOrg: async (_: any, { orgId }: { orgId: string }) => {
      return await prismaClient.order.findMany({ where: { orgId } });
    },
    ordersByStatus: async (_: any, { status }: { status: string }) => {
      return await prismaClient.order.findMany({ where: { orderStatus: status as any } });
    },

    // Ticket Queries
    tickets: async () => {
      return await prismaClient.ticket.findMany();
    },
    ticket: async (_: any, { id }: { id: string }) => {
      return await prismaClient.ticket.findUnique({ where: { id } });
    },
    ticketsByUser: async (_: any, { userId }: { userId: string }) => {
      return await prismaClient.ticket.findMany({ where: { userId } });
    },
    ticketsByOrder: async (_: any, { orderId }: { orderId: string }) => {
      return await prismaClient.ticket.findMany({ where: { orderId } });
    },

    // Transaction Queries
    transactions: async () => {
      return await prismaClient.transaction.findMany();
    },
    transaction: async (_: any, { id }: { id: string }) => {
      return await prismaClient.transaction.findUnique({ where: { id } });
    },
    transactionsByOrder: async (_: any, { orderId }: { orderId: string }) => {
      return await prismaClient.transaction.findMany({ where: { orderId } });
    },
  },

  Mutation: {
    // Organization Mutations
    createOrganization: async (_: any, { input }: any) => {
      return await prismaClient.organization.create({ data: input });
    },
    updateOrganization: async (_: any, { id, ...data }: any) => {
      return await prismaClient.organization.update({
        where: { id },
        data,
      });
    },
    deleteOrganization: async (_: any, { id }: { id: string }) => {
      await prismaClient.organization.delete({ where: { id } });
      return true;
    },

    // User Mutations
    createUser: async (_: any, { input }: any) => {
      return await prismaClient.user.create({ data: input });
    },
    updateUser: async (_: any, { id, ...data }: any) => {
      return await prismaClient.user.update({
        where: { id },
        data,
      });
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      await prismaClient.user.update({
        where: { id },
        data: { isDeleted: true },
      });
      return true;
    },

    // Product Mutations
    createProduct: async (_: any, { input }: any) => {
      return await prismaClient.product.create({ data: input });
    },
    updateProduct: async (_: any, { id, ...data }: any) => {
      return await prismaClient.product.update({
        where: { id },
        data,
      });
    },
    deleteProduct: async (_: any, { id }: { id: string }) => {
      await prismaClient.product.delete({ where: { id } });
      return true;
    },

    // Order Mutations
    createOrder: async (_: any, { input }: any) => {
      return await prismaClient.order.create({ data: input });
    },
    updateOrderStatus: async (_: any, { id, status }: any) => {
      return await prismaClient.order.update({
        where: { id },
        data: { orderStatus: status },
      });
    },
    deleteOrder: async (_: any, { id }: { id: string }) => {
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
