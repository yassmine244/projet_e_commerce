const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');

const SORT_MAP = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { rating: -1 },
  popular: { numReviews: -1, rating: -1 },
};

// @desc    Get all products (keyword, category, price range, sort, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    sortBy = 'newest',
    page: pageStr = '1',
    limit: limitStr = '12',
  } = req.query;

  const filter = {};

  if (keyword) {
    const re = { $regex: keyword, $options: 'i' };
    filter.$or = [{ name: re }, { description: re }];
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filter.price.$lte = Number(maxPrice);
    }
  }

  const sort = SORT_MAP[sortBy] || SORT_MAP.newest;
  const page = Math.max(parseInt(pageStr, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(limitStr, 10) || 12, 1), 60);

  const total = await Product.countDocuments(filter);
  const pages = Math.max(Math.ceil(total / limit), 1);

  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ products, page, pages, total });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'category',
    'name'
  );

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, countInStock } = req.body;

  if (!name || price === undefined || !category) {
    res.status(400);
    throw new Error('name, price and category are required');
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Invalid category');
  }

  const product = await Product.create({
    name,
    description: description || '',
    price,
    image: image || '',
    category,
    countInStock: countInStock ?? 0,
  });

  res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, countInStock } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (category && category !== String(product.category)) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(400);
      throw new Error('Invalid category');
    }
    product.category = category;
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (image !== undefined) product.image = image;
  if (countInStock !== undefined) product.countInStock = countInStock;

  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// Recompute rating + numReviews from the current reviews array.
const recomputeRating = (product) => {
  const n = product.reviews.length;
  product.numReviews = n;
  product.rating =
    n === 0 ? 0 : product.reviews.reduce((s, r) => s + r.rating, 0) / n;
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const ratingNum = Number(rating);

  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    res.status(400);
    throw new Error('Rating must be a number between 1 and 5');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.some(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: ratingNum,
    comment: (comment || '').trim(),
  });
  recomputeRating(product);

  await product.save();
  res.status(201).json({ message: 'Review added' });
});

// @desc    Delete a product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private (owner or admin)
const deleteProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  review.deleteOne();
  recomputeRating(product);
  await product.save();

  res.status(204).end();
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  deleteProductReview,
};
