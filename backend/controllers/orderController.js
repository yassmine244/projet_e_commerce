const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Lazy Stripe init so the app boots even when keys aren't configured yet.
let _stripe = null;
const getStripe = () => {
  if (_stripe) return _stripe;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in .env');
  }
  _stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
};

const CLIENT_URL = () => process.env.CLIENT_URL || 'http://localhost:5173';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  if (!shippingAddress || !paymentMethod) {
    res.status(400);
    throw new Error('Shipping address and payment method are required');
  }

  const order = new Order({
    user: req.user._id,
    orderItems: orderItems.map((item) => ({
      product: item.product,
      name: item.name,
      qty: item.qty,
      price: item.price,
      image: item.image || '',
    })),
    shippingAddress,
    paymentMethod,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Mark order as paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (
    order.user.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error('Not authorized to update this order');
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updated = await order.save();
  res.json(updated);
});

// @desc    Mark order as delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updated = await order.save();
  res.json(updated);
});

// @desc    Create a Stripe Checkout Session for an order
// @route   POST /api/orders/:id/create-checkout-session
// @access  Private (owner)
const createCheckoutSession = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized for this order');
  }
  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  const line_items = order.orderItems.map((item) => ({
    quantity: item.qty,
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(Number(item.price) * 100),
      product_data: {
        name: item.name,
      },
    },
  }));

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    customer_email: req.user.email,
    metadata: { orderId: order._id.toString() },
    success_url: `${CLIENT_URL()}/order/${order._id}?payment=success`,
    cancel_url: `${CLIENT_URL()}/order/${order._id}?payment=cancelled`,
  });

  res.json({ url: session.url, id: session.id });
});

// @desc    Stripe webhook — handle checkout.session.completed
// @route   POST /api/orders/webhook  (mounted with raw body in server.js)
// @access  Public (verified via signature)
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    res.status(500);
    throw new Error('STRIPE_WEBHOOK_SECRET is not set in .env');
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    return res.status(400).send(`Webhook signature failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: session.id,
          status: session.payment_status,
          email_address: session.customer_details?.email || '',
          update_time: new Date().toISOString(),
        };
        await order.save();
      }
    }
  }

  res.json({ received: true });
});

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  createCheckoutSession,
  stripeWebhook,
};
