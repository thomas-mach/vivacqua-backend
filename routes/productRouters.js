const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");

const router = express.Router();

router.get("/products", productController.getAllProducts);

router.use(authController.protect, authController.restricTo("admin"));

router.post("/product", productController.createProduct);
router.delete("/product/:id", productController.deleteProduct);
router.patch("/product/:id", productController.updateProduct);
module.exports = router;
