// Seed data for the in-browser demo backend. Product art is generated as SVG
// (see art.js) so the demo ships no third-party images.

export const DEMO_PASSWORD = "demo1234";

export const DEMO_USERS = [
  { id: 1, name: "Demo Customer", email: "customer@aizy.demo", role: "customer" },
  { id: 2, name: "Aizy Official", email: "seller@aizy.demo", role: "seller" },
  { id: 3, name: "Studio Verve", email: "verve@aizy.demo", role: "seller" },
  { id: 4, name: "Demo Admin", email: "admin@aizy.demo", role: "admin" },
];

const OFFICIAL = { sellersName: "Aizy Official", sellersEmail: "seller@aizy.demo" };
const VERVE = { sellersName: "Studio Verve", sellersEmail: "verve@aizy.demo" };

// [name, category, price(INR), stock, rating, shortDescription, seller]
const RAW = [
  ["Silk Blend Sherwani", "Ethnic Wear", 8999, 6, 4.8, "Embroidered sherwani for weddings and receptions.", OFFICIAL],
  ["Banarasi Lehenga", "Ethnic Wear", 12499, 4, 4.9, "Hand-woven Banarasi lehenga with zari border.", OFFICIAL],
  ["Cotton Kurta Set", "Ethnic Wear", 1799, 30, 4.5, "Breathable kurta and pyjama set for festive days.", OFFICIAL],
  ["Anarkali Suit", "Ethnic Wear", 3299, 12, 4.7, "Floor-length Anarkali in soft georgette.", VERVE],
  ["Pathani Suit", "Ethnic Wear", 2499, 14, 4.4, "Classic Pathani set, ideal for Eid and family functions.", OFFICIAL],
  ["Kanjivaram Saree", "Ethnic Wear", 9999, 5, 4.9, "Pure silk saree with traditional temple border.", VERVE],
  ["Nehru Jacket", "Ethnic Wear", 2199, 18, 4.3, "Textured Nehru jacket that lifts any kurta.", OFFICIAL],
  ["Printed Palazzo Set", "Ethnic Wear", 1599, 22, 4.2, "Relaxed palazzo set in a block-print cotton.", VERVE],

  ["Linen Summer Dress", "Western Wear", 2299, 16, 4.6, "Light linen dress for brunches and beach days.", VERVE],
  ["Slim Fit Blazer", "Western Wear", 4499, 9, 4.5, "Tailored blazer for meetings and evening events.", OFFICIAL],
  ["Classic Denim Jacket", "Western Wear", 2799, 20, 4.4, "Mid-wash denim jacket that works year round.", OFFICIAL],
  ["Graphic Cotton Tee", "Western Wear", 699, 60, 4.1, "Soft combed-cotton tee with a bold print.", VERVE],
  ["High-Rise Jeans", "Western Wear", 1999, 28, 4.3, "Stretch denim with a flattering high rise.", OFFICIAL],
  ["Party Sequin Dress", "Western Wear", 3499, 7, 4.7, "Sequin mini dress for birthdays and New Year's Eve.", VERVE],
  ["Formal Shirt", "Western Wear", 1299, 35, 4.2, "Wrinkle-resistant shirt for the corporate office.", OFFICIAL],
  ["Woollen Winter Coat", "Western Wear", 5999, 8, 4.8, "Warm long coat for ski trips and cold cities.", OFFICIAL],

  ["Running Shoes", "Footwear", 3299, 25, 4.6, "Cushioned everyday running shoes.", OFFICIAL],
  ["Leather Loafers", "Footwear", 2899, 15, 4.4, "Handcrafted leather loafers for formal wear.", OFFICIAL],
  ["Kolhapuri Chappals", "Footwear", 999, 40, 4.5, "Traditional hand-stitched Kolhapuri sandals.", VERVE],
  ["Block Heel Sandals", "Footwear", 1899, 14, 4.3, "Comfortable block heels for long events.", VERVE],
  ["Canvas Sneakers", "Footwear", 1499, 32, 4.2, "Everyday canvas sneakers in six colours.", OFFICIAL],

  ["Leather Tote Bag", "Accessories", 2599, 11, 4.6, "Roomy vegan-leather tote for work and travel.", VERVE],
  ["Aviator Sunglasses", "Accessories", 1199, 45, 4.1, "UV400 aviators with a metal frame.", OFFICIAL],
  ["Silver Jhumka Earrings", "Accessories", 849, 33, 4.7, "Oxidised silver jhumkas, light and festive.", VERVE],
  ["Minimal Analog Watch", "Accessories", 2199, 19, 4.5, "Slim analog watch with a leather strap.", OFFICIAL],
  ["Silk Dupatta", "Accessories", 899, 26, 4.4, "Soft silk dupatta to complete an ethnic look.", VERVE],

  ["Wireless Earbuds", "Electronics", 2499, 40, 4.3, "Bluetooth earbuds with 24-hour battery case.", OFFICIAL],
  ["Vivobook Laptop 15", "Electronics", 52999, 5, 4.5, "15-inch laptop for study and work.", OFFICIAL],
  ["Smart Fitness Band", "Electronics", 1899, 38, 4.2, "Tracks steps, sleep and heart rate.", OFFICIAL],
  ["Portable Speaker", "Electronics", 1799, 24, 4.4, "Water-resistant speaker with deep bass.", OFFICIAL],
  ["Power Bank 20000mAh", "Electronics", 1599, 50, 4.5, "Fast-charging power bank, dual USB.", OFFICIAL],
  ["Mechanical Keyboard", "Electronics", 3499, 13, 4.6, "Compact hot-swap mechanical keyboard.", OFFICIAL],

  ["Gel Pen Pack (10)", "Stationery", 120, 200, 4.4, "Smooth gel pens, ten assorted colours.", OFFICIAL],
  ["Hardbound Notebook", "Stationery", 249, 90, 4.5, "A5 dotted notebook with ribbon marker.", OFFICIAL],
  ["Desk Organiser", "Stationery", 599, 35, 4.2, "Bamboo desk organiser with five compartments.", VERVE],
  ["Sticky Notes Combo", "Stationery", 149, 120, 4.1, "Six pastel sticky-note pads.", OFFICIAL],

  ["Water Colour Set (24)", "Arts", 349, 55, 4.6, "Student-grade watercolours with a brush.", OFFICIAL],
  ["A4 Sketchbook", "Arts", 299, 70, 4.7, "120 gsm sketchbook, acid-free paper.", OFFICIAL],
  ["Acrylic Paint Starter", "Arts", 799, 28, 4.5, "12 acrylic tubes, three brushes, one palette.", VERVE],
  ["Calligraphy Pen Kit", "Arts", 699, 21, 4.3, "Beginner calligraphy kit with practice sheets.", VERVE],

  ["Cotton Bedsheet Set", "Home & Living", 1599, 17, 4.4, "Double bedsheet with two pillow covers.", VERVE],
  ["Ceramic Mug Pair", "Home & Living", 549, 44, 4.5, "Hand-glazed ceramic mugs, set of two.", VERVE],
  ["Scented Soy Candle", "Home & Living", 449, 52, 4.6, "Slow-burning soy candle in a glass jar.", VERVE],
  ["Wall Clock", "Home & Living", 899, 23, 4.2, "Silent-sweep wall clock, 30 cm.", OFFICIAL],
  ["Indoor Plant Pot", "Home & Living", 399, 41, 4.4, "Self-watering planter in matte finish.", VERVE],

  ["Yoga Mat", "Sports", 999, 36, 4.5, "6 mm anti-slip yoga mat.", OFFICIAL],
  ["Cricket Bat", "Sports", 2499, 10, 4.3, "English willow bat, short handle.", OFFICIAL],
  ["Football Size 5", "Sports", 899, 29, 4.4, "Machine-stitched match football.", OFFICIAL],
  ["Dry-Fit Track Pants", "Sports", 1099, 31, 4.2, "Quick-dry track pants with zip pockets.", OFFICIAL],
  ["Insulated Bottle 1L", "Sports", 749, 48, 4.7, "Keeps drinks cold for 24 hours.", VERVE],
];

export const CATEGORIES = [...new Set(RAW.map((r) => r[1]))];

const DAY = 86400000;

export function buildSeedProducts(now = Date.now()) {
  return RAW.map(
    ([name, category, price, count, rating, shortDescription, seller], i) => ({
      _id: `demo${String(i + 1).padStart(4, "0")}`,
      name,
      category,
      price,
      count,
      rating,
      shortDescription,
      description: `${shortDescription} Sold by ${seller.sellersName} on Aizy. This is demo catalogue data created to showcase the storefront.`,
      sellersName: seller.sellersName,
      sellersEmail: seller.sellersEmail,
      image: "",
      imageType: "image/svg+xml",
      createdAt: new Date(now - (RAW.length - i) * 2 * DAY).toISOString(),
      updatedAt: new Date(now - (RAW.length - i) * 2 * DAY).toISOString(),
    })
  );
}
