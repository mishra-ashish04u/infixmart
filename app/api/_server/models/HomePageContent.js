import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const HomePageContent = sequelize.define(
  "HomePageContent",
  {
    id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    section:    { type: DataTypes.STRING(64), allowNull: false },
    key:        { type: DataTypes.STRING(64), allowNull: false },
    title:      { type: DataTypes.STRING, defaultValue: null },
    subtitle:   { type: DataTypes.STRING, defaultValue: null },
    image:      { type: DataTypes.STRING, defaultValue: null },
    link:       { type: DataTypes.STRING, defaultValue: null },
    badge:      { type: DataTypes.STRING, defaultValue: null },
    badgeColor: { type: DataTypes.STRING(20), defaultValue: "#1565C0" },
    bgColor:    { type: DataTypes.STRING(60), defaultValue: "#F5F7FF" },
    textColor:  { type: DataTypes.STRING(20), defaultValue: "#111827" },
    isActive:   { type: DataTypes.BOOLEAN, defaultValue: true },
    order:      { type: DataTypes.INTEGER, defaultValue: 0 },
    // Extra JSON blob for section-specific data (icon name, min/max price, etc.)
    meta:       { type: DataTypes.TEXT, defaultValue: null },
  },
  { timestamps: true }
);

// ── Seed data ─────────────────────────────────────────────────────────────────
const DEFAULTS = [
  // ── Section: collection ───────────────────────────────────────────────────
  {
    section: "collection", key: "new_arrivals", title: "New Arrivals",
    subtitle: "Fresh stock every week",
    image: "https://serviceapi.spicezgold.com/download/1745504025727_NewProject(1).jpg",
    link: "/productListing?sort=newest", badge: "Just In", badgeColor: "#1565C0",
    bgColor: "#1565C0", textColor: "#fff", isActive: true, order: 1,
  },
  {
    section: "collection", key: "best_sellers", title: "Best Sellers",
    subtitle: "Most popular products",
    image: "https://serviceapi.spicezgold.com/download/1741660907985_NewProject.jpg",
    link: "/productListing?sort=bestseller", badge: "Top Picks", badgeColor: "#E65100",
    bgColor: "#1A237E", textColor: "#fff", isActive: true, order: 2,
  },
  {
    section: "collection", key: "on_sale", title: "On Sale",
    subtitle: "Exclusive limited-time deals",
    image: "https://serviceapi.spicezgold.com/download/1741660985477_NewProject(1).jpg",
    link: "/productListing?onSale=true", badge: "Hot Deal", badgeColor: "#E53935",
    bgColor: "#E53935", textColor: "#fff", isActive: true, order: 3,
  },
  {
    section: "collection", key: "bulk_deals", title: "Bulk Deals",
    subtitle: "Best prices for bulk orders",
    image: "https://serviceapi.spicezgold.com/download/1741661032451_NewProject(2).jpg",
    link: "/productListing?sort=popular", badge: "Wholesale", badgeColor: "#00695C",
    bgColor: "#00695C", textColor: "#fff", isActive: true, order: 4,
  },

  // ── Section: price_tiers ──────────────────────────────────────────────────
  {
    section: "price_tiers", key: "tier_99",
    title: "₹99", subtitle: "Great everyday picks",
    badge: "Under", badgeColor: "#C5D9F5",
    bgColor: "linear-gradient(135deg,#EEF4FF,#DAEAFF)", textColor: "#1565C0",
    link: "/productListing?maxPrice=99", isActive: true, order: 1,
    meta: JSON.stringify({ maxPrice: 99 }),
  },
  {
    section: "price_tiers", key: "tier_199",
    title: "₹199", subtitle: "Smart buys under budget",
    badge: "Under", badgeColor: "#A5D6A7",
    bgColor: "linear-gradient(135deg,#E8F5E9,#C8E6C9)", textColor: "#2E7D32",
    link: "/productListing?maxPrice=199", isActive: true, order: 2,
    meta: JSON.stringify({ maxPrice: 199 }),
  },
  {
    section: "price_tiers", key: "tier_499",
    title: "₹499", subtitle: "Popular wholesale picks",
    badge: "Under", badgeColor: "#FFCC80",
    bgColor: "linear-gradient(135deg,#FFF3E0,#FFE0B2)", textColor: "#E65100",
    link: "/productListing?maxPrice=499", isActive: true, order: 3,
    meta: JSON.stringify({ maxPrice: 499 }),
  },
  {
    section: "price_tiers", key: "tier_999",
    title: "₹999", subtitle: "Premium value deals",
    badge: "Under", badgeColor: "#CE93D8",
    bgColor: "linear-gradient(135deg,#F3E5F5,#E1BEE7)", textColor: "#6A1B9A",
    link: "/productListing?maxPrice=999", isActive: true, order: 4,
    meta: JSON.stringify({ maxPrice: 999 }),
  },
  {
    section: "price_tiers", key: "tier_1999",
    title: "₹1999", subtitle: "High-quality bulk items",
    badge: "Under", badgeColor: "#F48FB1",
    bgColor: "linear-gradient(135deg,#FCE4EC,#F8BBD9)", textColor: "#AD1457",
    link: "/productListing?maxPrice=1999", isActive: true, order: 5,
    meta: JSON.stringify({ maxPrice: 1999 }),
  },
  {
    section: "price_tiers", key: "tier_premium",
    title: "Premium", subtitle: "Best-in-class products",
    badge: "₹1999+", badgeColor: "#80DEEA",
    bgColor: "linear-gradient(135deg,#E0F2F1,#B2EBF2)", textColor: "#00695C",
    link: "/productListing?minPrice=1999", isActive: true, order: 6,
    meta: JSON.stringify({ minPrice: 1999 }),
  },

  // ── Section: why_choose_us ────────────────────────────────────────────────
  {
    section: "why_choose_us", key: "free_shipping",
    title: "Free Shipping", subtitle: "On all orders above ₹999",
    bgColor: "#EEF4FF", textColor: "#1565C0",
    isActive: true, order: 1, meta: JSON.stringify({ icon: "MdLocalShipping" }),
  },
  {
    section: "why_choose_us", key: "genuine",
    title: "100% Genuine", subtitle: "Quality checked & certified",
    bgColor: "#E8F5E9", textColor: "#2E7D32",
    isActive: true, order: 2, meta: JSON.stringify({ icon: "MdVerified" }),
  },
  {
    section: "why_choose_us", key: "secure_payment",
    title: "Secure Payment", subtitle: "UPI, cards, COD — fully safe",
    bgColor: "#FFF3E0", textColor: "#E65100",
    isActive: true, order: 3, meta: JSON.stringify({ icon: "FaShieldAlt" }),
  },
  {
    section: "why_choose_us", key: "easy_returns",
    title: "Easy Returns", subtitle: "3-day hassle-free policy",
    bgColor: "#F3E5F5", textColor: "#6A1B9A",
    isActive: true, order: 4, meta: JSON.stringify({ icon: "FaUndo" }),
  },

  // ── Section: stats ────────────────────────────────────────────────────────
  {
    section: "stats", key: "products",
    title: "10,000+", subtitle: "Products",
    isActive: true, order: 1, meta: JSON.stringify({ icon: "BsBoxSeam" }),
  },
  {
    section: "stats", key: "brands",
    title: "500+", subtitle: "Trusted Brands",
    isActive: true, order: 2, meta: JSON.stringify({ icon: "BsPatchCheckFill" }),
  },
  {
    section: "stats", key: "orders",
    title: "1 Lakh+", subtitle: "Orders Delivered",
    isActive: true, order: 3, meta: JSON.stringify({ icon: "TbPackage" }),
  },
  {
    section: "stats", key: "cities",
    title: "50+", subtitle: "Cities Served",
    isActive: true, order: 4, meta: JSON.stringify({ icon: "TbTruckDelivery" }),
  },

  // ── Section: newsletter ───────────────────────────────────────────────────
  {
    section: "newsletter", key: "config",
    title: "Stay Updated on Best Deals",
    subtitle: "Subscribe to get exclusive wholesale deals, new arrivals & offers straight to your inbox.",
    badge: "No spam. Unsubscribe anytime.",
    bgColor: "#F5F7FF", textColor: "#1565C0",
    isActive: true, order: 1,
  },

  // ── Section: flash_deals ──────────────────────────────────────────────────
  {
    section: "flash_deals", key: "config",
    title: "Find Deals Under ₹499",
    subtitle: "Unbeatable prices — grab them before they're gone",
    badge: "Flash Deals",
    bgColor: "#F5F7FF", textColor: "#E53935",
    link: "/productListing?maxPrice=499",
    isActive: true, order: 1,
    meta: JSON.stringify({ maxPrice: 499 }),
  },

  // ── Section: section_config (controls which home sections are shown + order)
  { section: "section_config", key: "hero",          title: "Hero Slider",        isActive: true,  order: 1  },
  { section: "section_config", key: "categories",    title: "Category Grid",      isActive: true,  order: 2  },
  { section: "section_config", key: "price_tiers",   title: "Shop by Price",      isActive: true,  order: 3  },
  { section: "section_config", key: "todays_deals",  title: "Today's Best Deals", isActive: true,  order: 4  },
  { section: "section_config", key: "flash_deals",   title: "Flash Deals",        isActive: true,  order: 5  },
  { section: "section_config", key: "collections",   title: "Shop by Collection", isActive: true,  order: 6  },
  { section: "section_config", key: "why_choose_us", title: "Why Choose Us",      isActive: true,  order: 7  },
  { section: "section_config", key: "stats",         title: "Stats Bar",          isActive: true,  order: 8  },
  { section: "section_config", key: "blog",          title: "Blog Section",       isActive: true,  order: 9  },
  { section: "section_config", key: "newsletter",    title: "Newsletter",         isActive: true,  order: 10 },
];

export const seedHomePageContent = async () => {
  for (const row of DEFAULTS) {
    const defaults = { ...row };
    await HomePageContent.findOrCreate({
      where: { section: row.section, key: row.key },
      defaults,
    });
  }
};

export default HomePageContent;
