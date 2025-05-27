const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/productModel"); // aggiorna path se serve

dotenv.config();

const MONGO_URI = process.env.DATABASE;

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 Connesso al DB");

    await Product.deleteMany();

    const products = [
      {
        name: "Goccia di carnia",
        description:
          "Goccia di Carnia è un’acqua minerale naturale oligominerale, pura e leggera, che sgorga incontaminata dalle Alpi Carniche in Friuli Venezia Giulia, a oltre 1.300 metri di altitudine. È caratterizzata da un basso contenuto di sodio e da un gusto delicato, ideale per un consumo quotidiano da tutta la famiglia. Viene imbottigliata alla fonte per preservarne freschezza e qualità.",
        price: 6.5,
        image: "/uploads/Goccia.jpg",
        category: "naturale",
        format: "1L",
        packSize: 12,
        available: true,
        active: true,
      },
      {
        name: "Panna",
        description:
          "Acqua Panna è un'acqua minerale naturale oligominerale che sgorga dalle colline toscane. Nota per il suo gusto equilibrato e la purezza, è ideale per accompagnare i pasti.",
        price: 6,
        image: "/uploads/panna.webp",
        category: "naturale",
        format: "1L",
        packSize: 12,
        available: true,
        active: true,
      },
      {
        name: "San Pellegrino",
        description:
          "San Pellegrino è un'acqua minerale frizzante, conosciuta per le sue bollicine fini e persistenti. Sgorga in Lombardia ed è apprezzata in tutto il mondo.",
        price: 6.5,
        image: "/uploads/san_pellegrino.webp",
        category: "naturale",
        format: "1L",
        packSize: 12,
        available: true,
        active: true,
      },
      {
        name: "Levico",
        description:
          "Levico è un’acqua minerale oligominerale che sgorga dalla Valsugana, in Trentino. Leggera e povera di sodio, è adatta a tutta la famiglia.",
        price: 6.5,
        image: "/uploads/levico-frizzante.jpg",
        category: "frizzante",
        format: "1L",
        packSize: 12,
        available: true,
        active: true,
      },
      {
        name: "Lauretana",
        description:
          "Lauretana sgorga nelle Alpi Biellesi ed è una delle acque più leggere in Europa. Con un residuo fisso bassissimo, è ideale per la salute e la leggerezza.",
        price: 8.5,
        image: "/uploads/lauretana-naturale.jpg",
        category: "naturale",
        format: "1L",
        packSize: 12,
        available: true,
        active: true,
      },
      {
        name: "Pejo",
        description:
          "Acqua Pejo nasce nel cuore del Parco Nazionale dello Stelvio, a 1393 m. È un'acqua pura e oligominerale, ideale per l’idratazione quotidiana.",
        price: 9.5,
        image: "/uploads/pejo.webp",
        category: "frizzante",
        format: "0.5L",
        packSize: 24,
        available: true,
        active: true,
      },
      {
        name: "Bracca",
        description:
          "Acqua Bracca sgorga in Val Brembana, in Lombardia. È un'acqua dal sapore armonico, perfetta per la tavola di ogni giorno.",
        price: 5,
        image: "/uploads/bracca75.jpg",
        category: "naturale",
        format: "0.75L",
        packSize: 12,
        available: true,
        active: true,
      },
      {
        name: "Lurisia",
        description:
          "Lurisia è un'acqua minimamente mineralizzata che nasce nelle Alpi Marittime. Leggera e purissima, è perfetta per ogni momento della giornata.",
        price: 7.5,
        image: "/uploads/lurisia.png",
        category: "naturale",
        format: "0.75L",
        packSize: 12,
        available: true,
        active: true,
      },
      {
        name: "Recoaro",
        description:
          "Recoaro sgorga dalle Piccole Dolomiti e si distingue per il gusto leggero e delicato. È una scelta apprezzata per il consumo giornaliero.",
        price: 5.8,
        image: "/uploads/recoaro.jpg",
        category: "naturale",
        format: "1L",
        packSize: 12,
        available: true,
        active: true,
      },
      {
        name: "Castello",
        description:
          "Acqua Castello proviene da Vallio Terme in Lombardia. Ha una composizione equilibrata che la rende ideale per accompagnare qualsiasi pasto.",
        price: 9,
        image: "/uploads/castello.jpg",
        category: "naturale",
        format: "0.5L",
        packSize: 24,
        available: true,
        active: true,
      },
      {
        name: "Valverde",
        description:
          "Valverde è un'acqua purissima delle Alpi piemontesi, famosa per il design raffinato della bottiglia e per la sua composizione leggera.",
        price: 7.5,
        image: "/uploads/valverde.jpg",
        category: "naturale",
        format: "0.75L",
        packSize: 12,
        available: true,
        active: true,
      },
      {
        name: "Norda",
        description:
          "Acqua Norda nasce nelle Prealpi Orobiche a 1935 metri. È un'acqua oligominerale leggera, adatta per tutta la famiglia.",
        price: 9.5,
        image: "/uploads/norda.jpg",
        category: "naturale",
        format: "1L",
        packSize: 12,
        available: true,
        active: true,
      },
    ];

    await Product.create(products);

    console.log("✅ Prodotti seedati correttamente");
    process.exit();
  } catch (err) {
    console.error("❌ Errore nel seeding prodotti:", err.message);
    process.exit(1);
  }
};

seedProducts();
