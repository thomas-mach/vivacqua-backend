const Order = require("../models/orderModel"); // Importa il modello di ordine
const Product = require("../models/productModel"); // Importa il modello di prodotto
const User = require("../models/userModel"); // Importa il modello di utente
const { ValidationError } = require("mongoose"); // Per gestire gli errori di validazione

// Crea un nuovo ordine
exports.createOrder = async (req, res, next) => {
  try {
    const { products, idempotencyKey } = req.body;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "No products provided for the order." });
    }

    if (!idempotencyKey) {
      return res.status(400).json({ message: "Idempotency key is required." });
    }

    // 🔍 Controlla se un ordine con questa chiave esiste già
    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder) {
      return res.status(200).json({
        message: "Order already processed.",
        order: existingOrder,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const deliveryAddress = user.address;

    const order = new Order({
      userId: req.user.id,
      idempotencyKey, // ✅ Usa la chiave inviata
      products,
      deliveryAddress,
    });

    await order.save();

    res.status(201).json({
      message: "Order successfully created!",
      order,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    // ⚠️ Se due richieste arrivano *contemporaneamente*, potrebbero causare un errore di chiave duplicata
    if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      return res.status(200).json({
        message: "Order already processed.",
        order: existingOrder,
      });
    }

    next(error);
  }
};

// Recupera tutti gli ordini di un utente
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate(
      "products.productId"
    );

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};

// Recupera un ordine specifico
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "products.productId"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
};

// Aggiorna lo stato di un ordine (solo per admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Verifica se lo stato dell'ordine è valido
    if (
      !["In elaborazione", "Spedito", "Consegnato", "Annullato"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status." });
    }

    // Controlla se l'ordine esiste
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Se l'utente non è admin, non può modificare lo stato
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this order." });
    }

    // Aggiorna lo stato dell'ordine
    order.status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Cancella un ordine (solo per admin o utente proprietario)
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Verifica che l'utente sia l'admin o il proprietario dell'ordine
    if (req.user.role !== "admin" && req.user.id !== order.userId.toString()) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this order." });
    }

    // Elimina l'ordine
    await order.remove();

    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    next(error);
  }
};
