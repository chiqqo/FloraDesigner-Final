const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  {
    name: 'წითელი ვარდების კლასიკა',
    description:
      'წითელი ვარდების კლასიკური თაიგული, რომელიც სიყვარულის, პატივისცემისა და განსაკუთრებული ემოციის გამოსახატად საუკეთესო არჩევანია.',
    price: 120,
    category: 'Romantic',
    colors: ['Red', 'Cream'],
    flowers: ['Roses', "Baby's Breath"],
    size: 'Large',
    occasion: 'Anniversary',
    imageUrl: '/product-images/classic-red-roses.webp',
    available: true,
    deliveryInfo: 'Same-day delivery available before 2 PM. Ships in a water-sealed box.',
  },
  {
    name: 'მზიანი ბაღი',
    description:
      'მზესუმზირებისა და ოქროსფერი გვირილების ნათელი თაიგული, რომელიც სითბოს, სიხარულსა და დადებით განწყობას ქმნის. იდეალურია დაბადების დღისთვის, მადლობის სათქმელად ან სივრცის გასახალისებლად.',
    price: 75,
    category: 'Seasonal',
    colors: ['Yellow', 'Orange', 'White'],
    flowers: ['Sunflowers', 'Daisies', 'Marigolds'],
    size: 'Medium',
    occasion: 'Birthday',
    imageUrl: '/product-images/seasonal-softness.webp',
    available: true,
    deliveryInfo: 'Next-day delivery. Arrives fresh in a gift-ready wrap.',
  },
  {
    name: 'პასტელური ჰარმონია',
    description:
      'ნაზი ვარდების, ეუსტომებისა და ფერადი სეზონური ყვავილების მდიდრული კომპოზიცია პასტელურ ტონებში. თაიგული იდეალურია დაბადების დღისთვის, რომანტიკული საჩუქრისთვის ან განსაკუთრებული დღის გასალამაზებლად.',
    price: 145,
    category: 'Classic',
    colors: ['Pink', 'Lavender', 'White'],
    flowers: ['Peonies', 'Spray Roses', 'Ranunculus'],
    size: 'Large',
    occasion: 'Wedding',
    imageUrl: '/product-images/pastel-harmony.jpg',
    available: true,
    deliveryInfo: 'Scheduled delivery available up to 2 weeks in advance.',
  },
  {
    name: 'თეთრი შროშანები',
    description:
      'თეთრი შროშანების ელეგანტური თაიგული ცისფერ შეფუთვაში. მისი სუფთა ფერები და დახვეწილი ფორმა იდეალურია ოფიციალური საჩუქრისთვის, მადლიერების გამოსახატად ან მშვიდი, გემოვნებიანი კომპოზიციისთვის.',
    price: 160,
    category: 'Classic',
    colors: ['White', 'Ivory'],
    flowers: ['Calla Lilies', 'Garden Roses', "Baby's Breath"],
    size: 'Large',
    occasion: 'Sympathy',
    imageUrl: '/product-images/white-lilies.jpeg',
    available: true,
    deliveryInfo: 'Priority same-day delivery with express shipping option.',
  },
  {
    name: 'ვარდისფერი ტიტები',
    description:
      'ვარდისფერი ტიტების დახვეწილი თაიგული თეთრ შეფუთვაში. კომპოზიცია გამოირჩევა სიმარტივით, სისუფთავით და ელეგანტური იერით, რაც მას შესანიშნავ არჩევანად აქცევს გაზაფხულის საჩუქრისთვის.',
    price: 85,
    category: 'Seasonal',
    colors: ['Coral', 'Yellow', 'Purple'],
    flowers: ['Tulips', 'Ranunculus', 'Muscari'],
    size: 'Medium',
    occasion: "Mother's Day",
    imageUrl: '/product-images/pink-tulips.jpg',
    available: true,
    deliveryInfo: 'Next-day delivery. Spring season bouquet - limited availability.',
  },
  {
    name: 'ლავანდის სიმშვიდე',
    description:
      'ლავანდის არომატული ღერები, თეთრი გიფსოფილა და ბუნებრივი გამხმარი აქცენტები ქმნის მშვიდ, დახვეწილ და ხანგრძლივ კომპოზიციას. თაიგული შესანიშნავია სახლის გასალამაზებლად ან მშვიდი, გემოვნებიანი საჩუქრისთვის.',
    price: 65,
    category: 'Wildflower',
    colors: ['Lavender', 'White', 'Beige'],
    flowers: ['Lavender', "Baby's Breath", 'Wheat Stalks'],
    size: 'Small',
    occasion: 'Housewarming',
    imageUrl: '/product-images/pastel-harmony.jpg',
    available: true,
    deliveryInfo: 'Ships in 1-2 business days. Dried elements remain fresh indefinitely.',
  },
  {
    name: 'ვარდისფერი ელეგანტურობა',
    description:
      'ვარდისფერი და იასამნისფერი ვარდების მდიდრული თაიგული ევკალიპტის მსუბუქი აქცენტებით. კომპოზიცია ნაზი, თანამედროვე და ძალიან ემოციურია.',
    price: 170,
    category: 'Romantic',
    colors: ['Blush Pink', 'Deep Pink', 'White'],
    flowers: ['Peonies', 'Garden Roses', 'Eucalyptus'],
    size: 'Large',
    occasion: 'Anniversary',
    imageUrl: '/product-images/pink-elegance.jpeg',
    available: true,
    deliveryInfo: 'Seasonal item. Same-day delivery available. Arrives boxed with care card.',
  },
  {
    name: 'ტროპიკული მზის ჩასვლა',
    description:
      'გამოკვეთილი და ეგზოტიკური თაიგული ნარინჯისფერი, ყვითელი და მწვანე ტონებით. ტროპიკული ყვავილებისა და ფოთლების კომბინაცია ქმნის ენერგიულ კომპოზიციას, რომელიც იდეალურია დღესასწაულისთვის ან განსაკუთრებული სივრცის გასაფორმებლად.',
    price: 190,
    category: 'Tropical',
    colors: ['Orange', 'Yellow', 'Green', 'Red'],
    flowers: ['Bird of Paradise', 'Anthurium', 'Heliconia', 'Monstera'],
    size: 'Extra Large',
    occasion: 'Corporate',
    imageUrl: '/product-images/pink-elegance.jpeg',
    available: true,
    deliveryInfo: 'Delivery in custom tropical crate. 2-day advance notice required.',
  },
  {
    name: 'ველური ყვავილების მდელო',
    description:
      'ბუნებრივი სტილის თაიგული ველური ყვავილებით, გვირილებითა და მსუბუქი ბალახოვანი აქცენტებით. კომპოზიცია თავისუფალი, ნაზი და ბუნებასთან ახლოს მდგომი არჩევანია ყოველდღიური საჩუქრისთვის.',
    price: 60,
    category: 'Wildflower',
    colors: ['Blue', 'Pink', 'White', 'Yellow'],
    flowers: ['Cornflowers', 'Cosmos', 'Chamomile', 'Grasses'],
    size: 'Small',
    occasion: 'Everyday',
    imageUrl: '/product-images/rose-box.jpg',
    available: true,
    deliveryInfo: 'Next-day delivery. Available year-round. Best enjoyed outdoors.',
  },
  {
    name: 'ფერადი ვარდების ყუთი',
    description:
      'ვარდისფერი, კრემისფერი, იასამნისფერი და მუქი ვარდების ნაზი კომბინაცია დეკორატიულ ყუთში. თაიგული ქმნის რომანტიკულ და სადღესასწაულო განწყობას.',
    price: 110,
    category: 'Modern',
    colors: ['Purple', 'Burgundy', 'White'],
    flowers: ['Dahlias', 'Scabiosa', 'Dusty Miller'],
    size: 'Medium',
    occasion: 'Birthday',
    imageUrl: '/product-images/rose-box.jpg',
    available: true,
    deliveryInfo: 'Ships next-day in temperature-controlled packaging.',
  },
  {
    name: 'სეზონური სინაზე',
    description:
      'ვარდების, ქრიზანთემების, მატიოლებისა და სეზონური ყვავილების ფერადი თაიგული ვარდისფერ შეფუთვაში. კომპოზიცია თბილი, მხიარული და ძალიან სასაჩუქრეა.',
    price: 175,
    category: 'Modern',
    colors: ['White', 'Purple'],
    flowers: ['Phalaenopsis Orchids', 'Cymbidium Orchids'],
    size: 'Medium',
    occasion: 'Corporate',
    imageUrl: '/product-images/seasonal-softness.webp',
    available: false,
    deliveryInfo: 'Currently out of season. Expected back in stock in 3 weeks.',
  },
  {
    name: 'წითელი ვარდები შეფუთვაში',
    description:
      'წითელი ვარდების ელეგანტური თაიგული მუქ ვარდისფერ შეფუთვაში. კლასიკური, ძლიერი და რომანტიკული არჩევანი განსაკუთრებული ადამიანისთვის.',
    price: 130,
    category: 'Classic',
    colors: ['Peach', 'Coral', 'Soft Green'],
    flowers: ['Garden Roses', 'Sweet Peas', 'Lisianthus', 'Ferns'],
    size: 'Large',
    occasion: 'Graduation',
    imageUrl: '/product-images/wrapped-red-roses.webp',
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
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Done. MongoDB connection closed.');
  }
}

seed();
