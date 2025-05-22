const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const EmailService = require("../utils/EmailService");

const emailService = new EmailService();

exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  console.log("🔥 CHIAMATA ARRIVATA A STRIPE CONTROLLER", req.body);
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Ordine non trovato", 404));
  }

  const amountInCents = Math.round(order.totalAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "eur",
    metadata: {
      orderId: order._id.toString(),
      //   userId: order.user.toString(),
    },
  });

  order.paymentIntentId = paymentIntent.id;
  await order.save();

  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
  });
});

exports.handleWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    // Usa AppError per errore custom
    return next(
      new AppError(`Webhook signature verification failed: ${err.message}`, 400)
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      return next(
        new AppError("Metadata orderId mancante nel PaymentIntent", 400)
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError(`Ordine con id ${orderId} non trovato`, 404));
    }

    order.status = "paid";
    await order.save();

    // await emailService.messageOrderPaid(orderId, order.totalAmount);
    console.log(`Ordine ${orderId} aggiornato a pagato`);
  }

  res.status(200).json({ received: true });
});
