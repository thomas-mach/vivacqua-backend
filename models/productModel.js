const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Il nome è obbligatorio"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La descrizione è obbligatoria"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Il prezzo è obbligatorio"],
      min: [0, "Il prezzo non può essere negativo"],
    },
    image: {
      type: String,
      required: [true, "La foto è obbligatoria"],
    },
    category: {
      type: String,
      required: [true, "La categoria è obbligatoria"],
      enum: ["naturale", "frizzante", "minerale"],
    },
    format: {
      type: String,
      default: "1L",
    },
    packSize: {
      type: Number,
      required: [true, "Il numero di bottiglie per cassa è obbligatorio."],
      default: 12, // Corretto: era stringa, ora numero coerente
    },
    available: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
