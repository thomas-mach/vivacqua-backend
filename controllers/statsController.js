const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Order = require("../models/orderModel");
const { ValidationError } = require("mongoose");
const dayjs = require("dayjs");

exports.revenue = catchAsync(async (req, res, next) => {
  const range = req.params.range || "7d";
  console.log(range);

  let fromDate;
  let groupFormat;

  if (range === "7d") {
    fromDate = dayjs().subtract(6, "day").toDate();
    groupFormat = "%Y-%m-%d";
  } else if (range === "1m") {
    fromDate = dayjs().subtract(1, "month").toDate();
    groupFormat = "%Y-%m-%d";
  } else if (range === "1y") {
    fromDate = dayjs().subtract(1, "year").toDate();
    groupFormat = "%Y-%m"; // 👈 raggruppa per mese
  }

  const revenue = await Order.aggregate([
    { $match: { createdAt: { $gte: fromDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: groupFormat, date: "$orderDate" },
        },
        totalRevenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  console.log(revenue);
  res.status(200).json({
    status: "success",
    results: revenue.length,
    revenue,
  });
});

exports.topFive = catchAsync(async (req, res, next) => {
  const topProducts = await Order.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.productId",
        totalSold: { $sum: "$products.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products", // nome effettivo della collezione MongoDB, non il nome del modello
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: "$productDetails.name",
        totalSold: 1,
      },
    },
  ]);

  console.log("topProducts", topProducts);

  res.status(200).json({
    status: "success",
    results: 5,
    topProducts,
  });
});

exports.ordersState = catchAsync(async (req, res, next) => {
  const ordersStatus = await Order.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$status",
        totalOrders: { $addToSet: "$_id" }, // raccoglie gli ID degli ordini
      },
    },
    {
      $project: {
        _id: 1,
        totalOrdersCount: { $size: "$totalOrders" }, // conta gli ID unici
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: ordersStatus,
  });
});
