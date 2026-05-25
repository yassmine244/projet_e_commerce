// Image URLs use the Unsplash CDN with the photo IDs supplied.
// category is the category NAME — seeder.js resolves it to an ObjectId at insert time.

const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;

const products = [
  // ───────── Electronics ─────────
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description:
      'Industry-leading noise cancellation with crystal-clear hands-free calling and 30 hours of battery life. Multipoint Bluetooth lets you pair two devices at once.',
    price: 399.99,
    image: img('1505740420928-5e560c06d30e'),
    category: 'Electronics',
    countInStock: 24,
  },
  {
    name: 'Dell XPS 13 Plus Ultrabook',
    description:
      '13.4-inch InfinityEdge display, 12th-gen Intel Core i7 and 16 GB of RAM in a sub-2.7-pound chassis. Built for travel, fast enough for serious work.',
    price: 1299.0,
    image: img('1496181133206-80ce9b88a853'),
    category: 'Electronics',
    countInStock: 12,
  },
  {
    name: 'iPhone 15 Pro 256GB',
    description:
      'Titanium body, A17 Pro chip and the new 48 MP main camera. USB-C arrives on the Pro line for the first time.',
    price: 1099.0,
    image: img('1592899677977-9c10ca588bbd'),
    category: 'Electronics',
    countInStock: 18,
  },
  {
    name: 'Apple Watch Series 9 GPS 45mm',
    description:
      'New double-tap gesture, brighter Always-On display and on-device Siri. Tracks workouts, sleep and heart health throughout the day.',
    price: 429.0,
    image: img('1546435770-a3e426bf472b'),
    category: 'Electronics',
    countInStock: 30,
  },
  {
    name: 'Canon EOS R6 Mark II Mirrorless Camera',
    description:
      '24.2 MP full-frame sensor with 40 fps burst shooting and 6K oversampled video. A workhorse for hybrid shooters.',
    price: 2499.0,
    image: img('1517336714731-489689fd1ca8'),
    category: 'Electronics',
    countInStock: 6,
  },

  // ───────── Fashion ─────────
  {
    name: "Levi's 501 Original Fit Jeans",
    description:
      'The original blue jean since 1873. Straight leg, button fly and 100% cotton denim that breaks in beautifully over time.',
    price: 89.5,
    image: img('1542272604-787c3835535d'),
    category: 'Fashion',
    countInStock: 50,
  },
  {
    name: 'Heavyweight Cotton Crewneck T-Shirt',
    description:
      '8.5 oz combed cotton in a relaxed, slightly boxy cut. Pre-shrunk and reinforced at the collar so it keeps its shape after every wash.',
    price: 19.99,
    image: img('1521572163474-6864f9cf17ab'),
    category: 'Fashion',
    countInStock: 45,
  },
  {
    name: 'Nike Air Max 90 Sneakers',
    description:
      'The icon that started it all, now with a tuned Air unit. Genuine leather and mesh upper finished with the signature Waffle outsole.',
    price: 139.99,
    image: img('1551028825-6abae29e40e3'),
    category: 'Fashion',
    countInStock: 22,
  },
  {
    name: 'Herschel Little America Backpack',
    description:
      'Daily commuter with a magnetic strap closure, padded 15-inch laptop sleeve and the brand’s signature striped cotton lining.',
    price: 110.0,
    image: img('1553062407-98eeb64c6a62'),
    category: 'Fashion',
    countInStock: 33,
  },
  {
    name: 'Daniel Wellington Classic Petite 32mm',
    description:
      'Minimalist watch with a slim 6 mm case and interchangeable NATO strap. Japanese quartz movement and 5 ATM water resistance.',
    price: 199.0,
    image: img('1591047139829-d91aecb6caea'),
    category: 'Fashion',
    countInStock: 0,
  },

  // ───────── Home & Kitchen ─────────
  {
    name: 'Mid-Century 3-Seat Velvet Sofa',
    description:
      'Tufted velvet upholstery on solid walnut legs. Hand-built kiln-dried frame and high-density foam cushions.',
    price: 899.0,
    image: img('1556909114-f6e7ad7d3136'),
    category: 'Home & Kitchen',
    countInStock: 5,
  },
  {
    name: 'Brass Pharmacy Floor Lamp',
    description:
      'Adjustable arm and pivoting head for reading or task lighting. Solid brass finish with a fabric-wrapped cord.',
    price: 159.0,
    image: img('1565538810643-b5bdb714032a'),
    category: 'Home & Kitchen',
    countInStock: 14,
  },
  {
    name: 'Breville Barista Express Espresso Machine',
    description:
      'Conical burr grinder built in, 15-bar Italian pump and PID temperature control. Café-grade espresso without leaving the kitchen.',
    price: 549.0,
    image: img('1556909195-69ce6f4f51a2'),
    category: 'Home & Kitchen',
    countInStock: 9,
  },
  {
    name: '24-Piece Stainless Steel Cutlery Set',
    description:
      'Brushed 18/10 stainless, dishwasher safe and balanced for everyday use. Service for six in a slimline gift box.',
    price: 79.0,
    image: img('1583847268964-b28dc8f51f92'),
    category: 'Home & Kitchen',
    countInStock: 27,
  },
  {
    name: 'Hand-Thrown Ceramic Olive Vase',
    description:
      'Each piece is wheel-thrown and glazed in small batches, so no two are identical. Stands 30 cm tall.',
    price: 45.0,
    image: img('1567538096630-e0c55bd6374c'),
    category: 'Home & Kitchen',
    countInStock: 19,
  },

  // ───────── Books ─────────
  {
    name: 'The Pragmatic Programmer — 20th Anniversary Edition',
    description:
      "Andy Hunt and David Thomas's classic, fully rewritten for modern teams. Practical advice on shipping software that lasts.",
    price: 39.99,
    image: img('1544947950-fa07a98d237f'),
    category: 'Books',
    countInStock: 40,
  },
  {
    name: 'Atomic Habits by James Clear',
    description:
      'A proven framework for getting 1% better every day. Bite-sized strategies for breaking bad habits and building good ones that stick.',
    price: 18.5,
    image: img('1535905557558-afc4877a26fc'),
    category: 'Books',
    countInStock: 60,
  },
  {
    name: 'The Lord of the Rings — Illustrated Hardcover',
    description:
      'All three volumes in a single cloth-bound edition with Tolkien’s own paintings and sketches reproduced throughout.',
    price: 65.0,
    image: img('1543002588-bfa74002ed7e'),
    category: 'Books',
    countInStock: 11,
  },
  {
    name: "Le Petit Prince — Collector's Hardcover Edition",
    description:
      "Saint-Exupéry's beloved tale in a clothbound collector's edition with the original watercolour illustrations and gilt edges.",
    price: 24.99,
    image: img('1589998059171-988d887df646'),
    category: 'Books',
    countInStock: 35,
  },
  {
    name: 'Calculus: Early Transcendentals (Stewart, 9th Ed.)',
    description:
      'The standard university calculus textbook. Clear explanations, rigorous proofs and thousands of worked examples and exercises.',
    price: 149.0,
    image: img('1512820790803-83ca734da794'),
    category: 'Books',
    countInStock: 8,
  },

  // ───────── Sports & Outdoors ─────────
  {
    name: 'ASICS Gel-Kayano 30 Running Shoes',
    description:
      "ASICS' flagship stability shoe, now with PureGEL technology and a softer FF Blast Plus midsole. Built for daily mileage.",
    price: 159.99,
    image: img('1517836357463-d25dfeac3438'),
    category: 'Sports & Outdoors',
    countInStock: 26,
  },
  {
    name: 'Liforme Premium Grip Yoga Mat',
    description:
      'Patented AlignForMe markers help you find proper alignment in every pose. Biodegradable natural rubber base, 4.2 mm thick.',
    price: 140.0,
    image: img('1571019613454-1cb2f99b2d8b'),
    category: 'Sports & Outdoors',
    countInStock: 17,
  },
  {
    name: 'Bowflex SelectTech 552 Adjustable Dumbbells',
    description:
      'Replace 15 pairs of dumbbells with two. Dial in any weight from 5 to 52.5 lbs in 2.5-lb increments — perfect for a home gym.',
    price: 549.0,
    image: img('1530549387789-4c1017266635'),
    category: 'Sports & Outdoors',
    countInStock: 4,
  },
  {
    name: 'Wilson Evolution Indoor Basketball',
    description:
      'The most-played indoor basketball in U.S. high schools. Premium microfiber composite for soft feel and consistent grip.',
    price: 64.99,
    image: img('1546519638-68e109498ffc'),
    category: 'Sports & Outdoors',
    countInStock: 38,
  },
  {
    name: 'Giro Synthe MIPS Cycling Helmet',
    description:
      'MIPS rotational impact protection in an aerodynamic road shell. Roc Loc Air fit system keeps it light and stable.',
    price: 89.99,
    image: img('1599058917765-a780eda07a3e'),
    category: 'Sports & Outdoors',
    countInStock: 21,
  },

  // ───────── Beauty & Health ─────────
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    description:
      'A high-strength serum that visibly reduces the look of blemishes, congestion and shine. Suitable for all skin types.',
    price: 7.2,
    image: img('1556228720-195a672e8a03'),
    category: 'Beauty & Health',
    countInStock: 80,
  },
  {
    name: 'Chanel Coco Mademoiselle Eau de Parfum 100ml',
    description:
      "Chanel's signature young, vibrant fragrance. Notes of orange, jasmine, rose and patchouli for a fresh, oriental finish.",
    price: 156.0,
    image: img('1522335789203-aaa3c2e4537a'),
    category: 'Beauty & Health',
    countInStock: 15,
  },
  {
    name: 'MAC Ruby Woo Matte Lipstick',
    description:
      "The world's most iconic red lipstick. A true, vivid blue-toned red with a velvety retro matte finish.",
    price: 24.0,
    image: img('1571781926291-c477ebfd024b'),
    category: 'Beauty & Health',
    countInStock: 42,
  },
  {
    name: 'Real Techniques Everyday Essentials Brush Set',
    description:
      'Eight cruelty-free brushes for foundation, blush, contour and eyes. Densely packed Taklon bristles for a streak-free finish.',
    price: 42.0,
    image: img('1596462502278-27bfdc403348'),
    category: 'Beauty & Health',
    countInStock: 28,
  },
  {
    name: 'CeraVe Moisturizing Facial Cream 50ml',
    description:
      'Developed with dermatologists. Hyaluronic acid plus three essential ceramides lock in moisture for 24-hour hydration.',
    price: 19.99,
    image: img('1608248543803-ba4f8c70ae0b'),
    category: 'Beauty & Health',
    countInStock: 65,
  },
];

module.exports = products;
