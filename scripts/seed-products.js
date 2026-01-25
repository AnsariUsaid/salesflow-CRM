require('dotenv').config();
const { PrismaClient } = require('../src/generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const sampleProducts = [
  {
    product_name: "Toyota Camry Engine",
    product_code: "TOY-CAM-ENG-001",
    description: "Complete engine assembly for Toyota Camry 2020-2023",
    make: "Toyota",
    model: "Camry",
    year: "2020-2023",
    meta_data: { price: 4500, weight: "350kg", warranty: "12 months" }
  },
  {
    product_name: "Honda Civic Transmission",
    product_code: "HON-CIV-TRN-001",
    description: "Automatic transmission for Honda Civic 2018-2022",
    make: "Honda",
    model: "Civic",
    year: "2018-2022",
    meta_data: { price: 2800, weight: "120kg", warranty: "6 months" }
  },
  {
    product_name: "Ford F-150 Alternator",
    product_code: "FOR-F150-ALT-001",
    description: "Heavy-duty alternator for Ford F-150",
    make: "Ford",
    model: "F-150",
    year: "2019-2024",
    meta_data: { price: 350, weight: "8kg", warranty: "12 months" }
  },
  {
    product_name: "BMW 3 Series Brake Kit",
    product_code: "BMW-3SR-BRK-001",
    description: "Complete front brake kit with rotors and pads",
    make: "BMW",
    model: "3 Series",
    year: "2020-2024",
    meta_data: { price: 650, weight: "25kg", warranty: "24 months" }
  },
  {
    product_name: "Mercedes-Benz E-Class Radiator",
    product_code: "MER-ECL-RAD-001",
    description: "Aluminum radiator for Mercedes E-Class",
    make: "Mercedes-Benz",
    model: "E-Class",
    year: "2018-2023",
    meta_data: { price: 580, weight: "12kg", warranty: "18 months" }
  },
  {
    product_name: "Chevrolet Silverado Exhaust System",
    product_code: "CHV-SLV-EXH-001",
    description: "Complete exhaust system with catalytic converter",
    make: "Chevrolet",
    model: "Silverado",
    year: "2019-2024",
    meta_data: { price: 1200, weight: "45kg", warranty: "12 months" }
  },
  {
    product_name: "Tesla Model 3 Battery Module",
    product_code: "TES-M3-BAT-001",
    description: "Replacement battery module for Tesla Model 3",
    make: "Tesla",
    model: "Model 3",
    year: "2020-2024",
    meta_data: { price: 8500, weight: "180kg", warranty: "36 months" }
  },
  {
    product_name: "Nissan Altima Suspension Kit",
    product_code: "NIS-ALT-SUS-001",
    description: "Complete front suspension strut assembly",
    make: "Nissan",
    model: "Altima",
    year: "2019-2023",
    meta_data: { price: 420, weight: "28kg", warranty: "12 months" }
  }
];

async function seedProducts() {
  try {
    console.log('Starting product seeding...');
    
    for (const product of sampleProducts) {
      const created = await prisma.product.create({
        data: product
      });
      console.log(`✓ Created product: ${created.product_name} (${created.product_code})`);
    }
    
    console.log(`\n✅ Successfully added ${sampleProducts.length} products to the database!`);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
