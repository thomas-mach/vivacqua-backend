const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Order = require("../models/orderModel");
const { ValidationError } = require("mongoose");

exports.getStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$orderDate" } },
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: "Errore server" });
  }
};

exports.dailyRevenue = catchAsync(async (req, res, next) => {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7);

  const dailyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: fromDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalRevenue: { $sum: "$amount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    results: dailyRevenue.length,
    data: {
      dailyRevenue,
    },
  });
});
