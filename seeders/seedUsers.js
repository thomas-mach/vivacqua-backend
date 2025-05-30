const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/userModel");
const { faker } = require("@faker-js/faker");

dotenv.config();

const MONGO_URI = process.env.DATABASE;

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 Connesso al DB");

    await User.deleteMany();

    const users = [
      {
        name: "Tomasz",
        surname: "Mach",
        email: "admin@gmail.com",
        password: "password",
        passwordConfirm: "password",
        isVerified: true,
        role: "admin",
        address: {
          street: "Via Roma",
          houseNumber: "10",
          city: "Milano",
          postalCode: 20121,
          doorbell: "Verdi G.",
        },
      },
      {
        name: "Marco",
        surname: "Bianchi",
        email: "test@gmail.com",
        password: "password",
        passwordConfirm: "password",
        isVerified: true,
        address: {
          street: "Via Torino",
          houseNumber: "5",
          city: "Roma",
          postalCode: 11100,
          doorbell: "Bianchi M.",
        },
      },
    ];

    // Genera 10 utenti fake con Faker
    const fakeUsers = Array.from({ length: 100 }).map(() => ({
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      isVerified: true,
      password: "password",
      passwordConfirm: "password",
      address: {
        street: faker.location.street(),
        houseNumber: faker.string.numeric(2),
        city: faker.location.city(),
        postalCode: parseInt(faker.location.zipCode("#####")),
        doorbell: faker.person.lastName(),
      },
    }));

    const allUsers = users.concat(fakeUsers);

    await User.create(allUsers); // il pre-save hasherà le password

    console.log("✅ Utenti seedati correttamente");
    process.exit();
  } catch (err) {
    console.error("❌ Errore nel seeding utenti:", err.message);
    process.exit(1);
  }
};

seedUsers();
