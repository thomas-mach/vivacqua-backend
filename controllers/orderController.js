const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { ValidationError } = require("mongoose");

// Crea un nuovo ordine
exports.createOrder = catchAsync(async (req, res, next) => {
  const { products, idempotencyKey } = req.body;

  if (!products || products.length === 0) {
    return next(new AppError("No products provided for the order.", 400));
  }

  if (!idempotencyKey) {
    return next(new AppError("Idempotency key is required.", 400));
  }

  // Controlla se un ordine con questa chiave esiste già
  const existingOrder = await Order.findOne({ idempotencyKey });
  if (existingOrder) {
    return res.status(200).json({
      message: "Order already processed.",
      order: existingOrder,
    });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const deliveryAddress = user.address;

  const order = new Order({
    userId: req.user.id,
    userEmail: req.user.email,
    userName: req.user.name,
    userSurname: req.user.surname,
    idempotencyKey,
    products,
    deliveryAddress,
  });

  try {
    await order.save();
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(new AppError(error.message, 400));
    }
    // Gestione errore chiave duplicata (concorrenza)
    if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      return res.status(200).json({
        message: "Order already processed.",
        order: existingOrder,
      });
    }
    return next(error);
  }

  res.status(201).json({
    message: "Order successfully created!",
    order,
  });
});

// Recupera tutti gli ordini di un utente
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ userId: req.user.id }).populate(
    "products.productId"
  );

  if (!orders || orders.length === 0) {
    return next(new AppError("No orders found for this user.", 404));
  }

  res.status(200).json({ orders });
});

// Recupera un ordine specifico
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).populate(
    "products.productId"
  );

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (req.user.id !== order.userId.toString()) {
    return next(new AppError("Order non apartiene a questo utente"));
  }

  res.status(200).json({ order });
});

// Aggiorna lo stato di un ordine (solo per admin)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (
    !["In elaborazione", "Spedito", "Consegnato", "Annullato"].includes(status)
  ) {
    return next(new AppError("Invalid status.", 400));
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (req.user.role !== "admin") {
    return next(
      new AppError("You do not have permission to update this order.", 403)
    );
  }

  order.status = status;
  await order.save();

  res.status(200).json({
    message: "Order status updated successfully.",
    order,
  });
});

// Cancella un ordine (solo per admin o utente proprietario)
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (req.user.role !== "admin" && req.user.id !== order.userId.toString()) {
    return next(
      new AppError("You do not have permission to delete this order.", 403)
    );
  }

  await order.remove();

  res.status(200).json({ message: "Order deleted successfully." });
});
