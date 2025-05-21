const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.use(authController.protect);

// router.get("/", productController.getActiveProducts);
router.post("/", orderController.createOrder);

module.exports = router;
