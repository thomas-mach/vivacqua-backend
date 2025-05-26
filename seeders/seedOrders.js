const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

dotenv.config();

const MONGO_URI = process.env.DATABASE;

const seedOrders = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 Connesso al DB");
    await Order.deleteMany();

    const users = await User.find();
    const products = await Product.find();

    if (users.length === 0 || products.length === 0) {
      throw new Error(
        "❌ Devono esserci utenti e prodotti nel DB prima del seeding ordini."
      );
    }

    const orders = [];

    for (let i = 0; i < 300; i++) {
      const randomUser = faker.helpers.arrayElement(users);
      const selectedProducts = faker.helpers.arrayElements(products, {
        min: 1,
        max: 4,
      });

      const orderProducts = selectedProducts.map((prod) => ({
        productId: prod._id,
        quantity: faker.number.int({ min: 1, max: 5 }),
      }));

      const order = {
        userId: randomUser._id,
        products: orderProducts,
        status: faker.helpers.arrayElement([
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "paid",
        ]),
        orderDate: faker.date.recent({ days: 365 }),
        userEmail: randomUser.email,
        userName: randomUser.name,
        userSurname: randomUser.surname,
        deliveryAddress: {
          street: faker.location.street(),
          houseNumber: faker.location.buildingNumber(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          doorbell: `${randomUser.surname} ${randomUser.name.charAt(0)}.`,
        },
        idempotencyKey: faker.string.uuid(),
      };

      orders.push(order);
    }

    await Order.create(orders);

    console.log("✅ Ordini seedati correttamente");
    process.exit();
  } catch (err) {
    console.error("❌ Errore nel seeding ordini:", err.message);
    process.exit(1);
  }
};

seedOrders();
