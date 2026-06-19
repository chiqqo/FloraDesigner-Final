const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  {
    name: 'წითელი ვარდები',
    description: 'კლასიკური წითელი ვარდების თაიგული სიყვარულისა და განსაკუთრებული დღისთვის.',
    price: 120,
    category: 'Romantic',
    colors: ['Red'],
    flowers: ['Roses'],
    size: 'Large',
    occasion: 'Anniversary',
    imageUrl: '/product-images/classic-red-roses.webp',
    available: true,
    deliveryInfo: 'Same-day delivery available before 2 PM.',
  },
  {
    name: 'პასტელური თაიგული',
    description: 'ნაზი ფერების თაიგული ვარდებით და სეზონური ყვავილებით.',
    price: 145,
    category: 'Classic',
    colors: ['Pink', 'Lavender', 'White'],
    flowers: ['Roses', 'Peonies'],
    size: 'Large',
    occasion: 'Wedding',
    imageUrl: '/product-images/pastel-harmony.jpg',
    available: true,
    deliveryInfo: 'Scheduled delivery available up to 2 weeks in advance.',
  },
  {
    name: 'თეთრი შროშანები',
    description: 'თეთრი შროშანების სუფთა და ელეგანტური თაიგული.',
    price: 150,
    category: 'Classic',
    colors: ['White', 'Green'],
    flowers: ['Lilies'],
    size: 'Large',
    occasion: 'Sympathy',
    imageUrl: '/product-images/white-lilies.jpeg',
    available: true,
    deliveryInfo: 'Priority same-day delivery available.',
  },
  {
    name: 'ვარდისფერი ტიტები',
    description: 'ვარდისფერი ტიტების მარტივი და დახვეწილი თაიგული.',
    price: 90,
    category: 'Seasonal',
    colors: ['Pink', 'Green'],
    flowers: ['Tulips'],
    size: 'Medium',
    occasion: 'Birthday',
    imageUrl: '/product-images/pink-tulips.jpg',
    available: true,
    deliveryInfo: 'Next-day delivery available.',
  },
  {
    name: 'ვარდისფერი ვარდები',
    description: 'ვარდისფერი და იასამნისფერი ვარდების ლამაზი თაიგული.',
    price: 165,
    category: 'Romantic',
    colors: ['Pink', 'Purple'],
    flowers: ['Roses'],
    size: 'Large',
    occasion: 'Anniversary',
    imageUrl: '/product-images/pink-elegance.jpeg',
    available: true,
    deliveryInfo: 'Same-day delivery available.',
  },
  {
    name: 'ვარდების ყუთი',
    description: 'ფერადი ვარდების კომპოზიცია დეკორატიულ ყუთში.',
    price: 110,
    category: 'Modern',
    colors: ['Pink', 'Purple', 'Cream'],
    flowers: ['Roses'],
    size: 'Medium',
    occasion: 'Birthday',
    imageUrl: '/product-images/rose-box.jpg',
    available: true,
    deliveryInfo: 'Ships next-day in gift-ready packaging.',
  },
  {
    name: 'სეზონური თაიგული',
    description: 'ფერადი სეზონური ყვავილების თბილი და სასაჩუქრე თაიგული.',
    price: 130,
    category: 'Seasonal',
    colors: ['Pink', 'Yellow', 'White'],
    flowers: ['Roses', 'Chrysanthemums'],
    size: 'Medium',
    occasion: 'Everyday',
    imageUrl: '/product-images/seasonal-softness.webp',
    available: true,
    deliveryInfo: 'Next-day delivery available.',
  },
  {
    name: 'შეფუთული წითელი ვარდები',
    description: 'წითელი ვარდები მუქ ვარდისფერ შეფუთვაში.',
    price: 135,
    category: 'Romantic',
    colors: ['Red', 'Pink'],
    flowers: ['Roses'],
    size: 'Large',
    occasion: 'Graduation',
    imageUrl: '/product-images/wrapped-red-roses.webp',
    available: true,
    deliveryInfo: 'Same-day delivery before 3 PM.',
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
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Done. MongoDB connection closed.');
  }
}

seed();
