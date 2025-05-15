const catchAsync = require("../utils/catchAsync");
const Product = require("../models/productModel");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createProduct = catchAsync(async (req, res, next) => {
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  const {
    name,
    description,
    price,
    category,
    format,
    packSize,
    available,
    active,
  } = req.body;

  const newProduct = await Product.create({
    name,
    description,
    price,
    category,
    format,
    packSize,
    available,
    active,
    image: imagePath,
  });

  res.status(200).json({
    status: "success",
    message: "New product added",
    data: {
      newProduct,
    },
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ active: true });

  res.status(200).json({
    status: "success",
    message: "Products retrieved successfully",
    data: {
      products,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.id;

  // Verifica che l'ID sia valido
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid ID format",
    });
  }

  // Trova il prodotto esistente
  let product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  // Destructuring del body della richiesta
  const {
    name,
    description,
    price,
    image,
    category,
    format,
    available,
    active,
  } = req.body;

  // Aggiorna le proprietà del prodotto esistente
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.image = image || product.image;
  product.category = category || product.category;
  product.format = format || product.format;
  product.available = available !== undefined ? available : product.available;
  product.active = active !== undefined ? active : product.active;

  // Salva le modifiche
  await product.save();

  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid ID format",
    });
  }

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  await Product.deleteOne({ _id: productId });

  res.status(200).json({
    status: "success",
    message: "Product deleted successfully",
  });
});
