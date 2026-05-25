/**
 * Database seeder.
 *
 * Usage:
 *   npm run seed             # destroy + insert sample data
 *   npm run seed:destroy     # delete all without reseeding
 */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const colors = require('colors');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');

const usersData = require('./data/users');
const categoriesData = require('./data/categories');
const productsData = require('./data/products');

dotenv.config();

const REVIEW_COMMENTS = [
  'Great quality for the price, fast shipping!',
  'Exactly as described, very happy.',
  'Good but could be better.',
  'Love it! Will buy again.',
  'Solid product, recommended.',
  'Met my expectations, no complaints.',
  'Beautiful design and works well.',
  'Worth every penny.',
  'Decent quality, average packaging.',
  'Honestly impressed by how well this works.',
  'Five stars from me — great service too!',
  'Better than I expected for the price.',
  'Does the job. Nothing fancy but reliable.',
  'Arrived quickly and was well packaged.',
];

const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return out;
};

const importData = async () => {
  console.log('\nStarting seed...'.cyan.bold);

  // 1. Wipe
  await Promise.all([
    Order.deleteMany(),
    Product.deleteMany(),
    Category.deleteMany(),
    User.deleteMany(),
  ]);
  console.log('  cleared existing collections'.gray);

  // 2. Users — use create() so the pre-save bcrypt hook fires per doc
  const createdUsers = await User.create(usersData);
  const regularUsers = createdUsers.filter((u) => !u.isAdmin);
  console.log(`  inserted ${createdUsers.length} users`.gray);

  // 3. Categories
  const createdCategories = await Category.insertMany(categoriesData);
  const categoryByName = new Map(
    createdCategories.map((c) => [c.name, c._id])
  );
  console.log(`  inserted ${createdCategories.length} categories`.gray);

  // 4. Products — resolve category name to ObjectId
  const productsToInsert = productsData.map((p) => {
    const categoryId = categoryByName.get(p.category);
    if (!categoryId) {
      throw new Error(`Unknown category "${p.category}" for product "${p.name}"`);
    }
    return {
      ...p,
      category: categoryId,
      rating: 0,
      numReviews: 0,
      reviews: [],
    };
  });
  const createdProducts = await Product.insertMany(productsToInsert);
  console.log(`  inserted ${createdProducts.length} products`.gray);

  // 5. Reviews — 2-3 per product, from random regular users
  let totalReviews = 0;
  for (const product of createdProducts) {
    const reviewCount = randInt(2, 3);
    const reviewers = pickRandom(regularUsers, reviewCount);
    product.reviews = reviewers.map((u) => ({
      user: u._id,
      name: u.name,
      rating: randInt(3, 5),
      comment: REVIEW_COMMENTS[randInt(0, REVIEW_COMMENTS.length - 1)],
    }));
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((s, r) => s + r.rating, 0) /
      product.reviews.length;
    await product.save();
    totalReviews += product.reviews.length;
  }
  console.log(`  inserted ${totalReviews} reviews`.gray);

  console.log(
    `\n✅ Data seeded: ${createdUsers.length} users, ${createdCategories.length} categories, ${createdProducts.length} products, ${totalReviews} reviews`
      .green.bold
  );
};

const destroyData = async () => {
  await Promise.all([
    Order.deleteMany(),
    Product.deleteMany(),
    Category.deleteMany(),
    User.deleteMany(),
  ]);
  console.log('\n🗑️  Data destroyed'.yellow.bold);
};

(async () => {
  try {
    await connectDB();
    const destroyFlag =
      process.argv.includes('--destroy') ||
      process.argv.includes('-d');

    if (destroyFlag) {
      await destroyData();
    } else {
      await importData();
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Seeder failed: ${err.message}`.red.bold);
    if (err.stack) console.error(err.stack.red);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
})();
