const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/productModel"); // aggiorna path se serve
const { faker } = require("@faker-js/faker");

dotenv.config();

const MONGO_URI = process.env.DATABASE;

const categories = ["naturale", "frizzante", "minerale"];

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 Connesso al DB");

    // Pulisce la collezione (opzionale)
    await Product.deleteMany();

    // Genera 20 prodotti fake
    const fakeProducts = Array.from({ length: 20 }).map(() => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price(0.5, 10, 2)),
      image: faker.image.url({ width: 800, height: 800, keywords: ["drink"] }),

      //   image: `https://picsum.photos/800/800?random=${faker.number.int()}`,
      category: faker.helpers.arrayElement(categories),
      format: "1L",
      packSize: faker.number.int({ min: 6, max: 24 }),
      available: faker.datatype.boolean(),
      active: true,
    }));

    await Product.create(fakeProducts);

    console.log("✅ Prodotti seedati correttamente");
    process.exit();
  } catch (err) {
    console.error("❌ Errore nel seeding prodotti:", err.message);
    process.exit(1);
  }
};

seedProducts();
