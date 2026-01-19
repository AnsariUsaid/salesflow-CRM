require('dotenv/config');
const { Pool } = require('pg');

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🌱 Seeding database...\n');

    // Get existing users
    const usersRes = await pool.query('SELECT * FROM users LIMIT 1');
    if (usersRes.rows.length === 0) {
      console.error('❌ No users found.');
      return;
    }
    
    const user = usersRes.rows[0];
    const orgId = user.org_id;
    const userId = user.user_id;
    
    console.log(`👤 Using: ${user.firstname} ${user.lastname}\n`);

    // 1. Products
    console.log('📦 Creating products...');
    const products = [];
    const productData = [
      { name: 'Engine Oil Filter', code: 'EOF-2024', make: 'Toyota', model: 'Camry', year: '2024', desc: 'High-quality Engine Oil Filter for Toyota Camry' },
      { name: 'Brake Pad Set', code: 'BPS-2023', make: 'Honda', model: 'Civic', year: '2023', desc: 'Premium Brake Pad Set for Honda Civic' },
      { name: 'Air Filter', code: 'AF-2024', make: 'Ford', model: 'F-150', year: '2024', desc: 'OEM Air Filter for Ford F-150' },
      { name: 'Spark Plug Set', code: 'SPS-2023', make: 'Chevrolet', model: 'Silverado', year: '2023', desc: 'Performance Spark Plug Set' },
      { name: 'Transmission Fluid', code: 'TF-2024', make: 'Nissan', model: 'Altima', year: '2024', desc: 'Synthetic Transmission Fluid' },
    ];

    for (const p of productData) {
      const res = await pool.query(
        `INSERT INTO products (product_id, product_name, product_code, description, make, model, year, isdeleted, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, false, NOW(), NOW())
         RETURNING product_id`,
        [p.name, p.code, p.desc, p.make, p.model, p.year]
      );
      products.push({ id: res.rows[0].product_id, ...p });
      console.log(`  ✅ ${p.name}`);
    }

    // 2. Orders
    console.log('\n📋 Creating orders...');
    const orders = [];
    const orderStatuses = ['created', 'paid', 'processing', 'shipped', 'delivered'];
    
    for (let i = 0; i < 5; i++) {
      const res = await pool.query(
        `INSERT INTO orders (
          order_id, org_id, user_id, customer_name, customer_email, customer_phone,
          total_amount, discounted_amount, shipping_address, sales_agent, 
          order_status, order_tracking, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        ) RETURNING order_id`,
        [
          orgId, userId, `${user.firstname} ${user.lastname}`, user.email, 
          user.phone || '555-0100', (i + 1) * 150.50, (i + 1) * 140.00,
          `${123 + i} Main St, City, State 12345`, userId, 
          orderStatuses[i], `TRK${1000 + i}`
        ]
      );
      const orderId = res.rows[0].order_id;
      orders.push(orderId);
      console.log(`  ✅ Order #${i + 1} - ${orderStatuses[i]}`);

      // Add order product
      await pool.query(
        `INSERT INTO order_products (
          orderproduct_id, order_id, product_id, product_name, product_code,
          make, model, year, quantity, price, procurement_cost, 
          procurement_source, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        )`,
        [
          orderId, products[i].id, products[i].name, products[i].code,
          products[i].make, products[i].model, products[i].year,
          i + 1, 50.50, 30.00, 'Supplier Inc.'
        ]
      );
    }

    // 3. Transactions
    console.log('\n💳 Creating transactions...');
    const txStatuses = ['completed', 'completed', 'pending', 'failed', 'completed'];
    
    for (let i = 0; i < 5; i++) {
      await pool.query(
        `INSERT INTO transactions (
          transaction_id, order_id, user_id, agent_id, amount, status,
          payment_method, auth_code, response_code, meta_data,
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )`,
        [
          orders[i], userId, userId, (i + 1) * 150.50, txStatuses[i],
          i % 2 === 0 ? 'Credit Card' : 'Debit Card',
          `AUTH${10000 + i}`, txStatuses[i] === 'completed' ? '00' : '01',
          JSON.stringify({ cardLast4: `${1000 + i}`, cardType: i % 2 === 0 ? 'Visa' : 'Mastercard' })
        ]
      );
      console.log(`  ✅ Transaction #${i + 1} - ${txStatuses[i]}`);
    }

    // 4. Tickets
    console.log('\n🎫 Creating tickets...');
    const priorities = ['low', 'medium', 'high', 'urgent', 'medium'];
    const ticketStatuses = ['open', 'in_progress', 'resolved', 'closed', 'open'];
    
    for (let i = 0; i < 5; i++) {
      await pool.query(
        `INSERT INTO tickets (
          ticket_id, org_id, order_id, user_id, title, description,
          priority, status, assigned_to, "resolvedAt", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )`,
        [
          orgId, orders[i], userId, `Issue with Order #${i + 1}`,
          `Customer reported: ${i % 2 === 0 ? 'Product not received' : 'Wrong item shipped'}`,
          priorities[i], ticketStatuses[i], userId,
          (ticketStatuses[i] === 'resolved' || ticketStatuses[i] === 'closed') ? new Date() : null
        ]
      );
      console.log(`  ✅ Ticket #${i + 1} - ${priorities[i]}`);
    }

    // 5. Cards
    console.log('\n💳 Creating card details...');
    const cards = [
      { num: '4111111111111111', type: 'Visa', cvv: '123' },
      { num: '5500000000000004', type: 'Mastercard', cvv: '456' },
      { num: '340000000000009', type: 'Amex', cvv: '7890' },
      { num: '6011000000000004', type: 'Discover', cvv: '234' },
      { num: '4111111111111112', type: 'Visa', cvv: '567' },
    ];

    for (let i = 0; i < 5; i++) {
      await pool.query(
        `INSERT INTO card_details (
          card_id, user_id, order_id, "cardNumber", "expiryMonth", "expiryYear",
          cvv, "cardholderName", "billingAddress", city, state, "zipCode",
          "isActive", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), NOW()
        )`,
        [
          userId, orders[i], cards[i].num, (i + 1).toString().padStart(2, '0'), '2026',
          cards[i].cvv, `${user.firstname} ${user.lastname}`,
          `${123 + i} Main St`, 'New York', 'NY', `1000${i}`
        ]
      );
      console.log(`  ✅ ${cards[i].type} - ****${cards[i].num.slice(-4)}`);
    }

    // Summary
    const summary = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query('SELECT COUNT(*) FROM transactions'),
      pool.query('SELECT COUNT(*) FROM tickets'),
      pool.query('SELECT COUNT(*) FROM card_details'),
    ]);

    console.log('\n✨ Seeding complete!\n');
    console.log('📊 Database Summary:');
    console.log(`  👥 Users: ${summary[0].rows[0].count}`);
    console.log(`  📦 Products: ${summary[1].rows[0].count}`);
    console.log(`  📋 Orders: ${summary[2].rows[0].count}`);
    console.log(`  💳 Transactions: ${summary[3].rows[0].count}`);
    console.log(`  🎫 Tickets: ${summary[4].rows[0].count}`);
    console.log(`  💳 Cards: ${summary[5].rows[0].count}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

seed();
