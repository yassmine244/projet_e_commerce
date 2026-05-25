const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get current user's wishlist (populated)
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name' },
  });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.wishlist || []);
});

// @desc    Add a product to the wishlist (idempotent)
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { wishlist: product._id } }
  );

  res.status(201).json({ message: 'Added to wishlist', productId: product._id });
});

// @desc    Remove a product from the wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { wishlist: req.params.productId } }
  );
  res.status(204).end();
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
