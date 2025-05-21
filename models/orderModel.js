const Product = require("./productModel");
const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [orderProductSchema],
    totalAmount: {
      type: Number,
      min: 0,
    },
    totalQuantity: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled", "paid"],
      default: "processing",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryAddress: {
      type: Object,
      required: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  try {
    // Recupera tutti i prodotti in un'unica query
    const productIds = this.products.map((item) => item.productId);
    console.log("product ids", productIds);
    const products = await Product.find({ _id: { $in: productIds } });

    let totalAmount = 0;
    let totalQuantity = 0;

    for (let item of this.products) {
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString()
      );

      if (!product) {
        return next(new Error(`Product with ID ${item.productId} not found`));
      }

      totalAmount += item.quantity * product.price;
      totalQuantity += item.quantity;
    }

    this.totalAmount = totalAmount;
    this.totalQuantity = totalQuantity;

    next();
  } catch (error) {
    return next(error); // Gestisce errori di query
  }
});

module.exports = mongoose.model("Order", orderSchema);
