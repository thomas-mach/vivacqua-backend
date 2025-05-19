const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const { upload, resizeImage } = require("../middleware/upload");

const router = express.Router();

router.get("/", productController.getActiveProducts);

router.use(authController.protect, authController.restrictTo("admin"));

router.get("/admin-products", productController.getAllProducts);
router.post(
  "/",
  upload.single("image"),
  resizeImage,
  productController.createProduct
);
router.delete("/:id", productController.deleteProduct);
router.patch("/:id", productController.updateProduct);

module.exports = router;
