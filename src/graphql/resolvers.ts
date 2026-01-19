import { prisma } from '../lib/prisma';
import { GraphQLError } from 'graphql';

export const resolvers = {
  Query: {
    // User queries
    me: async (_: any, __: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');
      return context.user;
    },

    users: async (_: any, __: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');
      
      // Only admins can see all users
      if (context.user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }

      return prisma.user.findMany({
        where: {
          org_id: context.user.org_id,
          isdeleted: false,
        },
      });
    },

    user: async (_: any, { user_id }: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const user = await prisma.user.findUnique({
        where: { user_id },
      });

      if (!user || user.org_id !== context.user.org_id) {
        throw new GraphQLError('User not found');
      }

      return user;
    },

    // Organization queries
    myOrganization: async (_: any, __: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      return prisma.organization.findUnique({
        where: { org_id: context.user.org_id },
      });
    },

    // Product queries
    products: async (_: any, __: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      return prisma.product.findMany({
        where: { isdeleted: false },
        orderBy: { createdAt: 'desc' },
      });
    },

    product: async (_: any, { product_id }: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      return prisma.product.findUnique({
        where: { product_id },
      });
    },

    // Order queries
    orders: async (_: any, __: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      return prisma.order.findMany({
        where: { org_id: context.user.org_id },
        orderBy: { createdAt: 'desc' },
      });
    },

    order: async (_: any, { order_id }: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const order = await prisma.order.findUnique({
        where: { order_id },
      });

      if (!order || order.org_id !== context.user.org_id) {
        throw new GraphQLError('Order not found');
      }

      return order;
    },

    myOrders: async (_: any, __: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      return prisma.order.findMany({
        where: {
          org_id: context.user.org_id,
          user_id: context.user.user_id,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    // Transaction queries
    transactions: async (_: any, __: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      // Get orders for org first
      const orders = await prisma.order.findMany({
        where: { org_id: context.user.org_id },
        select: { order_id: true },
      });

      const orderIds = orders.map((o) => o.order_id);

      return prisma.transaction.findMany({
        where: { order_id: { in: orderIds } },
        orderBy: { createdAt: 'desc' },
      });
    },

    transaction: async (_: any, { transaction_id }: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const transaction = await prisma.transaction.findUnique({
        where: { transaction_id },
        include: { order: true },
      });

      if (!transaction || transaction.order.org_id !== context.user.org_id) {
        throw new GraphQLError('Transaction not found');
      }

      return transaction;
    },

    // Ticket queries
    tickets: async (_: any, __: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      return prisma.ticket.findMany({
        where: { org_id: context.user.org_id },
        orderBy: { createdAt: 'desc' },
      });
    },

    ticket: async (_: any, { ticket_id }: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const ticket = await prisma.ticket.findUnique({
        where: { ticket_id },
      });

      if (!ticket || ticket.org_id !== context.user.org_id) {
        throw new GraphQLError('Ticket not found');
      }

      return ticket;
    },

    myTickets: async (_: any, __: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      return prisma.ticket.findMany({
        where: {
          org_id: context.user.org_id,
          user_id: context.user.user_id,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    // User mutations
    updateUser: async (_: any, args: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const { user_id, ...updates } = args;

      // Can only update own profile or if admin
      if (user_id !== context.user.user_id && context.user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }

      const user = await prisma.user.findUnique({ where: { user_id } });
      if (!user || user.org_id !== context.user.org_id) {
        throw new GraphQLError('User not found');
      }

      return prisma.user.update({
        where: { user_id },
        data: updates,
      });
    },

    // Product mutations
    createProduct: async (_: any, args: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      // Only admins can create products
      if (context.user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }

      return prisma.product.create({
        data: args,
      });
    },

    updateProduct: async (_: any, args: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      if (context.user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }

      const { product_id, ...updates } = args;

      return prisma.product.update({
        where: { product_id },
        data: updates,
      });
    },

    deleteProduct: async (_: any, { product_id }: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      if (context.user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }

      await prisma.product.update({
        where: { product_id },
        data: { isdeleted: true },
      });

      return true;
    },

    // Order mutations
    createOrder: async (_: any, args: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const { products, ...orderData } = args;

      // Create order
      const order = await prisma.order.create({
        data: {
          ...orderData,
          org_id: context.user.org_id,
          user_id: context.user.user_id,
          sales_agent: context.user.user_id,
          order_status: 'created',
        },
      });

      // Create order products
      for (const product of products) {
        await prisma.orderProduct.create({
          data: {
            order_id: order.order_id,
            ...product,
          },
        });
      }

      return prisma.order.findUnique({
        where: { order_id: order.order_id },
        include: { orderProducts: true },
      });
    },

    updateOrderStatus: async (_: any, { order_id, order_status }: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const order = await prisma.order.findUnique({ where: { order_id } });
      if (!order || order.org_id !== context.user.org_id) {
        throw new GraphQLError('Order not found');
      }

      return prisma.order.update({
        where: { order_id },
        data: { order_status },
      });
    },

    assignOrderAgent: async (_: any, { order_id, agent_type, agent_id }: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      // Only admins can assign agents
      if (context.user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }

      const order = await prisma.order.findUnique({ where: { order_id } });
      if (!order || order.org_id !== context.user.org_id) {
        throw new GraphQLError('Order not found');
      }

      const updateData: any = {};
      if (agent_type === 'sales') updateData.sales_agent = agent_id;
      if (agent_type === 'processing') updateData.processing_agent = agent_id;
      if (agent_type === 'followup') updateData.followup_agent = agent_id;

      return prisma.order.update({
        where: { order_id },
        data: updateData,
      });
    },

    // Transaction mutations
    createTransaction: async (_: any, args: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const { order_id, ...transactionData } = args;

      const order = await prisma.order.findUnique({ where: { order_id } });
      if (!order || order.org_id !== context.user.org_id) {
        throw new GraphQLError('Order not found');
      }

      return prisma.transaction.create({
        data: {
          ...transactionData,
          order_id,
          user_id: context.user.user_id,
          agent_id: context.user.user_id,
          status: 'completed',
        },
      });
    },

    // Ticket mutations
    createTicket: async (_: any, args: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      return prisma.ticket.create({
        data: {
          ...args,
          org_id: context.user.org_id,
          user_id: context.user.user_id,
          status: 'open',
        },
      });
    },

    updateTicket: async (_: any, args: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const { ticket_id, ...updates } = args;

      const ticket = await prisma.ticket.findUnique({ where: { ticket_id } });
      if (!ticket || ticket.org_id !== context.user.org_id) {
        throw new GraphQLError('Ticket not found');
      }

      return prisma.ticket.update({
        where: { ticket_id },
        data: updates,
      });
    },

    resolveTicket: async (_: any, { ticket_id }: any, context: any) => {
      if (!context.user) throw new GraphQLError('Not authenticated');

      const ticket = await prisma.ticket.findUnique({ where: { ticket_id } });
      if (!ticket || ticket.org_id !== context.user.org_id) {
        throw new GraphQLError('Ticket not found');
      }

      return prisma.ticket.update({
        where: { ticket_id },
        data: {
          status: 'resolved',
          resolvedAt: new Date(),
        },
      });
    },
  },

  // Field resolvers
  User: {
    organization: (parent: any) => {
      return prisma.organization.findUnique({
        where: { org_id: parent.org_id },
      });
    },
    orders: (parent: any) => {
      return prisma.order.findMany({
        where: { user_id: parent.user_id },
      });
    },
  },

  Organization: {
    users: (parent: any) => {
      return prisma.user.findMany({
        where: { org_id: parent.org_id, isdeleted: false },
      });
    },
    orders: (parent: any) => {
      return prisma.order.findMany({
        where: { org_id: parent.org_id },
      });
    },
  },

  Order: {
    customer: (parent: any) => {
      return prisma.user.findUnique({
        where: { user_id: parent.user_id },
      });
    },
    orderProducts: (parent: any) => {
      return prisma.orderProduct.findMany({
        where: { order_id: parent.order_id },
      });
    },
    transactions: (parent: any) => {
      return prisma.transaction.findMany({
        where: { order_id: parent.order_id },
      });
    },
  },

  Transaction: {
    order: (parent: any) => {
      return prisma.order.findUnique({
        where: { order_id: parent.order_id },
      });
    },
    user: (parent: any) => {
      return prisma.user.findUnique({
        where: { user_id: parent.user_id },
      });
    },
  },

  Ticket: {
    order: (parent: any) => {
      if (!parent.order_id) return null;
      return prisma.order.findUnique({
        where: { order_id: parent.order_id },
      });
    },
    user: (parent: any) => {
      return prisma.user.findUnique({
        where: { user_id: parent.user_id },
      });
    },
  },
};
