const cors = require("cors");
const stripeController = require("./controllers/stripeController");
const express = require("express");
const userRouter = require("./routes/userRouters");
// const paymentRouter = require("./routes/paymentRouters");
const productRouter = require("./routes/productRouters");
const orderRouter = require("./routes/orderRouters");
const statsRouter = require("./routes/statsRouters");
const stripeRoutes = require("./routes/stripeRoutes");
const globalErrorHandling = require("./controllers/errorController");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const allowedOrigins = [
  "https://thomas-mach.github.io",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(morgan("dev"));

// ✅ Rotta webhook con raw
app.post(
  "/api/v1/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeController.handleWebhook
);

app.use(express.json()); // Parsifica il corpo della richiesta (body) in formato JSON e lo trasforma in un oggetto JavaScript

// app.use((req, res, next) => {
// console.log("🧾 Request Headers:", req.headers);
// next();
// });

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/stripe", stripeRoutes);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/stats", statsRouter);
app.use(globalErrorHandling);

app.get("/", (req, res) => {
  res.send("Vivacqua Backend è attivo ✅");
});

module.exports = app;
