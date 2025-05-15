const express = require("express");
const userRouter = require("./routes/userRouters");
// const paymentRouter = require("./routes/paymentRouters");
const productRouter = require("./routes/productRouters");
// const orderRouter = require("./routes/orderRoutes");
const globalErrorHandling = require("./controllers/errorController");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));

app.use(express.json()); // Parsifica il corpo della richiesta (body) in formato JSON e lo trasforma in un oggetto JavaScript

app.use((req, res, next) => {
  //   console.log("🧾 Request Headers:\n", JSON.stringify(req.headers, null, 2));
  console.log("🧾 Request Headers:", req.headers);

  next();
});

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/products", productRouter);
// app.use("/api/v1/", orderRouter);
// app.use("/api/v1/", paymentRouter);
app.use(globalErrorHandling);

module.exports = app;
