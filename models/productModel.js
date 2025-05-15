const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: false, // Una immagine principale
    },
    category: {
      type: String,
      required: true,
      enum: ["naturale", "frizzante", "minerale"], // Possiamo aggiungere categorie se necessario
    },
    format: {
      type: String,
      default: "1L",
    },
    packSize: {
      type: Number,
      default: "12",
    },
    available: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
