const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  {
    name: 'Rose Romance',
    description:
      "A timeless arrangement of fresh red roses, symbolizing deep love and passion. Each stem is hand-selected for peak bloom and wrapped in soft satin ribbon. Perfect for anniversaries, Valentine's Day, or any moment when you want to say something truly meaningful.",
    price: 120,
    category: 'Romantic',
    colors: ['Red', 'Cream'],
    flowers: ['Roses', "Baby's Breath"],
    size: 'Large',
    occasion: 'Anniversary',
    imageUrl:
      'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Same-day delivery available before 2 PM. Ships in a water-sealed box.',
  },
  {
    name: 'Sunlit Garden',
    description:
      'Bright and cheerful sunflowers paired with golden daisies create an arrangement that radiates warmth and joy. This bouquet brings the energy of a sunny field right to your door, making it ideal for birthdays and thank-you gestures.',
    price: 75,
    category: 'Seasonal',
    colors: ['Yellow', 'Orange', 'White'],
    flowers: ['Sunflowers', 'Daisies', 'Marigolds'],
    size: 'Medium',
    occasion: 'Birthday',
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Next-day delivery. Arrives fresh in a gift-ready wrap.',
  },
  {
    name: 'Pastel Dreams',
    description:
      "A soft and romantic mix of blush peonies, lavender spray roses, and white ranunculus. The gentle pastel palette creates a dreamy, feminine aesthetic that is perfect for weddings, baby showers, or simply brightening someone's day.",
    price: 145,
    category: 'Classic',
    colors: ['Pink', 'Lavender', 'White'],
    flowers: ['Peonies', 'Spray Roses', 'Ranunculus'],
    size: 'Large',
    occasion: 'Wedding',
    imageUrl:
      'https://images.unsplash.com/photo-1499063078284-f78f7d89616a?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Scheduled delivery available up to 2 weeks in advance.',
  },
  {
    name: 'White Elegance',
    description:
      "Pure white calla lilies and garden roses arranged with structured grace. This bouquet embodies understated luxury and is often chosen for sympathy, funerals, or elegant dinner table centerpieces. Simple, serene, and deeply respectful.",
    price: 160,
    category: 'Classic',
    colors: ['White', 'Ivory'],
    flowers: ['Calla Lilies', 'Garden Roses', "Baby's Breath"],
    size: 'Large',
    occasion: 'Sympathy',
    imageUrl:
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Priority same-day delivery with express shipping option.',
  },
  {
    name: 'Spring Bloom',
    description:
      "Vibrant tulips in a rainbow of spring colors - coral, yellow, and soft purple - mixed with cheerful ranunculus. This arrangement captures the freshness of spring and is a wonderful gift for Easter, Mother's Day, or a new beginning.",
    price: 85,
    category: 'Seasonal',
    colors: ['Coral', 'Yellow', 'Purple'],
    flowers: ['Tulips', 'Ranunculus', 'Muscari'],
    size: 'Medium',
    occasion: "Mother's Day",
    imageUrl:
      'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Next-day delivery. Spring season bouquet - limited availability.',
  },
  {
    name: 'Lavender Serenity',
    description:
      "Fragrant lavender stems bundled with delicate white baby's breath and dried wheat stalks. This bouquet has a calming, spa-like quality and dries beautifully, making it a long-lasting gift. Ideal for housewarming or wellness-focused recipients.",
    price: 65,
    category: 'Wildflower',
    colors: ['Lavender', 'White', 'Beige'],
    flowers: ['Lavender', "Baby's Breath", 'Wheat Stalks'],
    size: 'Small',
    occasion: 'Housewarming',
    imageUrl:
      'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Ships in 1-2 business days. Dried elements remain fresh indefinitely.',
  },
  {
    name: 'Peony Paradise',
    description:
      'Lush, full-headed pink peonies in peak season are the centerpiece of this luxurious arrangement. Known for their intoxicating fragrance and cloud-like petals, peonies are a romantic favorite. Best ordered May through July for the freshest blooms.',
    price: 170,
    category: 'Romantic',
    colors: ['Blush Pink', 'Deep Pink', 'White'],
    flowers: ['Peonies', 'Garden Roses', 'Eucalyptus'],
    size: 'Large',
    occasion: 'Anniversary',
    imageUrl:
      'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Seasonal item. Same-day delivery available. Arrives boxed with care card.',
  },
  {
    name: 'Tropical Sunset',
    description:
      'Bold and exotic, this arrangement features bird of paradise, orange anthuriums, and tropical foliage. The vivid colors and dramatic shapes create a statement piece that brings a vacation feeling to any space. Perfect for corporate events and celebrations.',
    price: 190,
    category: 'Tropical',
    colors: ['Orange', 'Yellow', 'Green', 'Red'],
    flowers: ['Bird of Paradise', 'Anthurium', 'Heliconia', 'Monstera'],
    size: 'Extra Large',
    occasion: 'Corporate',
    imageUrl:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Delivery in custom tropical crate. 2-day advance notice required.',
  },
  {
    name: 'Wildflower Meadow',
    description:
      'Gathered like a walk through a summer meadow, this bouquet mixes cosmos, cornflowers, chamomile, and grasses in an effortlessly natural style. Loose, organic, and full of personality - perfect for the person who loves nature over formality.',
    price: 60,
    category: 'Wildflower',
    colors: ['Blue', 'Pink', 'White', 'Yellow'],
    flowers: ['Cornflowers', 'Cosmos', 'Chamomile', 'Grasses'],
    size: 'Small',
    occasion: 'Everyday',
    imageUrl:
      'https://images.unsplash.com/photo-1444930694458-01babf71870c?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Next-day delivery. Available year-round. Best enjoyed outdoors.',
  },
  {
    name: 'Purple Dahlia Dusk',
    description:
      'Deep purple dahlias with their intricate layered petals create an atmosphere of mystery and elegance. Arranged with smoky foliage and white accent blooms, this bouquet is a dramatic, modern choice for those who appreciate the unusual and bold.',
    price: 110,
    category: 'Modern',
    colors: ['Purple', 'Burgundy', 'White'],
    flowers: ['Dahlias', 'Scabiosa', 'Dusty Miller'],
    size: 'Medium',
    occasion: 'Birthday',
    imageUrl:
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Ships next-day in temperature-controlled packaging.',
  },
  {
    name: 'Orchid Luxe',
    description:
      'Elegant white and purple Phalaenopsis orchids arranged in a sleek, modern style. Orchids are the ultimate long-lasting luxury bloom, often flowering for 8-12 weeks. A sophisticated gift for executives, milestone celebrations, or anyone who appreciates lasting beauty.',
    price: 175,
    category: 'Modern',
    colors: ['White', 'Purple'],
    flowers: ['Phalaenopsis Orchids', 'Cymbidium Orchids'],
    size: 'Medium',
    occasion: 'Corporate',
    imageUrl:
      'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=600&q=80',
    available: false,
    deliveryInfo: 'Currently out of season. Expected back in stock in 3 weeks.',
  },
  {
    name: 'Garden Party',
    description:
      'A generous, lush arrangement bursting with garden roses, sweet peas, lisianthus, and delicate ferns in soft peach and coral tones. Romantic and abundant, this bouquet looks like it was cut fresh from a secret English garden and is ideal for summer gatherings.',
    price: 130,
    category: 'Classic',
    colors: ['Peach', 'Coral', 'Soft Green'],
    flowers: ['Garden Roses', 'Sweet Peas', 'Lisianthus', 'Ferns'],
    size: 'Large',
    occasion: 'Graduation',
    imageUrl:
      'https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=600&q=80',
    available: true,
    deliveryInfo: 'Same-day delivery before 3 PM. Includes a handwritten gift card.',
  },
];

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/floradesigner';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products successfully`);

    await mongoose.disconnect();
    console.log('Done. MongoDB connection closed.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
