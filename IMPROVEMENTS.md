# InfixMart — Improvements Roadmap

> Priority order: **UX-first**, then Conversion, Marketing, and Tech.
> Format: `[Effort]` S = hours | M = 1–3 days | L = 1 week+

---

## PRIORITY 1 — CRITICAL UX FIXES (Do This Week)

These directly block users from completing purchases.

### ~~1.1 Sticky "Add to Cart" on Mobile PDP~~ ✅ Already implemented
- On mobile, as user scrolls past the ATC button, a sticky bar appears at the bottom
- Contains: Product name, price, and "Add to Cart" button

### ~~1.2 Breadcrumb Navigation~~ ✅ Already implemented
- On PDP with BreadcrumbList JSON-LD schema

### ~~1.3 Bottom Navigation Bar on Mobile~~ ✅ Done
- 5-tab fixed bottom bar (Home, Shop, Search, Cart w/ badge, Account)
- Hides on product/checkout/admin/auth pages
- Active indicator + filled icon variant

### ~~1.4 Announcement Ticker on Mobile~~ ✅ Done
- Removed `hidden sm:block` — ticker now visible on all screen sizes
- Font scales: `text-[10px] sm:text-[12px]`

### ~~1.5 Show Cart Without Forcing Login~~ ✅ Done
- Guest cart stored in localStorage (`infix_guest_cart`)
- Merges into server cart automatically on login
- Cart page shows "Login to Checkout" button for guests
- Product data fetched from API when adding to guest cart

### ~~1.6 "Only X Left in Stock" Urgency Label~~ ✅ Done
- Amber warning label on product cards when stock ≤ 10
- Already present on PDP

### ~~1.7 Pincode Delivery Checker on PDP~~ ✅ Already implemented
- DeliveryChecker component already on PDP

### ~~1.8 Recently Viewed Products~~ ✅ Already implemented
- RecentlyViewedContext + strip on PDP and homepage

---

## PRIORITY 2 — HIGH-IMPACT UX IMPROVEMENTS

### 2.1 Floating WhatsApp Button `[S]`
- Fixed bottom-right button on all pages
- Opens wa.me link with pre-filled message: "Hi, I need help with my order"
- Replace the current header-only WhatsApp link
- **Impact:** Support accessibility increases buyer confidence

### 2.2 Search — "Did You Mean?" & Zero Results Page `[M]`
- When no results found, show: suggestions, popular products, categories
- Add spell-check / fuzzy matching on search
- Never show a blank "0 results" dead end
- **Impact:** Recovers users who mistype product names

### 2.3 Product Listing — Infinite Scroll or "Load More" `[S]`
- Replace hard pagination with "Load More" button or infinite scroll
- Keeps user in flow instead of navigating pages
- **Impact:** Reduces exit rate on listing pages

### 2.4 Filter Panel — Brand Filter `[M]`
- Add brand as a filterable attribute in product listing
- Multi-select checkbox with search inside filter
- **Impact:** Brand-conscious shoppers (large segment) convert better

### 2.5 Product Card — "Add to Cart" on Hover `[S]`
- Show "Add to Cart" button on card hover (desktop)
- Currently only Quick View appears
- **Impact:** Reduces clicks to purchase from listing page

### 2.6 Return Policy Visible on PDP `[S]`
- Add a small line below Add to Cart: `Free 3-day returns`
- Link to return policy page
- **Impact:** Removes purchase hesitation at decision moment

### 2.7 Trust Badges on PDP & Checkout `[S]`
- Currently trust badges only appear in footer
- Add a mini trust strip below ATC button: Secure Payment | Genuine Products | Easy Returns
- **Impact:** Reassures buyer at the exact moment of decision

### 2.8 Empty States — All Pages `[S]`
- Wishlist empty → "Your wishlist is empty. Start exploring →"
- Orders empty → "No orders yet. Shop now →"
- Search no results → Show trending / popular products
- Every dead end should have a CTA

### 2.9 Order Tracking — Courier Link `[M]`
- After "Shipped" status, show tracking number + courier name
- Link to courier tracking page
- **Impact:** Reduces "where is my order?" support queries by 60%+

### 2.10 Image Gallery — Video Support on PDP `[L]`
- Allow admin to upload a product video (MP4 or YouTube link)
- Show as first item in gallery with play button
- **Impact:** Video increases conversion by 80%+

### 2.11 Compare Products Feature `[L]`
- Allow users to select 2–3 products and compare specs side-by-side
- Especially important for electronics/tech products
- **Impact:** Reduces decision paralysis; increases cart adds

---

## PRIORITY 3 — MEMBERSHIP FEATURE (New Feature)

### 3.1 InfixMart Membership — "InfixPass" `[L]`

**Proposed Plan (Revised from your idea):**

| Detail | Recommendation |
|---|---|
| Price | ₹49 one-time (not ₹29 — too cheap, devalues it) |
| Benefit 1 | Cart minimum reduced: ₹999 → ₹499 |
| Benefit 2 | Free delivery on all orders |
| Benefit 3 | Exclusive member-only deals/coupons |
| Validity | Lifetime (as you proposed) |

**Cancellation Logic — IMPORTANT:**

> Your original idea: cancel if any delivery is unsuccessful.
> **Problem:** Courier failures are often NOT the customer's fault.
> This will cause refund demands, chargebacks, and trust damage.

**Recommended Cancellation Triggers Instead:**
- Customer rejects delivery themselves 2+ times (RTO due to customer)
- Customer provides false/incomplete address causing 3+ failed attempts
- Account flagged for fraud/abuse
- **NOT** triggered by: courier delays, courier no-shows, lost shipments

**Implementation Checklist:**
- [ ] Membership purchase page with payment (Razorpay)
- [ ] `is_member` flag on user account in DB
- [ ] Membership benefits applied at cart/checkout logic
- [ ] Admin panel: view members, manually revoke if needed
- [ ] Member badge on user profile
- [ ] Cancellation detection logic (RTO tracking from delivery partner)
- [ ] Email on membership purchase + cancellation
- [ ] Show membership CTA on cart page when cart is between ₹499–₹999

**Where to Show Membership CTA:**
- Cart page when total is ₹499–₹999: "Unlock ₹499 cart minimum + Free Delivery for just ₹99 →"
- Checkout address page for non-members
- User profile page
- Homepage banner slot

---

## PRIORITY 4 — CONVERSION FEATURES

### 4.1 Flash Sale / Countdown Timer `[M]`
- Admin can set a sale end time on a product or category
- PDP and product card shows countdown: `Sale ends in 02:34:19`
- **Impact:** Creates urgency; proven highest single conversion lever

### 4.2 "X People Viewing This" on PDP `[M]`
- Show a live-looking indicator: "12 people are viewing this right now"
- Can be simulated (randomized within a range) or real via analytics
- **Impact:** Social proof + urgency combined

### 4.3 Frequently Bought Together — Add Bundle to Cart `[S]`
- Current "Frequently Bought Together" shows products but improve the UX
- Add "Add All to Cart" button with bundle total price shown
- **Impact:** Increases AOV (Average Order Value)

### 4.4 Size/Color Guide `[M]`
- Add a "Size Guide" modal on variant selector
- Chart with measurements
- Critical if selling apparel, footwear, or accessories

### 4.5 Reviews — Photos & Verified Purchase Badge `[M]`
- Allow customers to upload photos with reviews
- Add "Verified Purchase" badge on reviews from confirmed buyers
- **Impact:** Review images triple conversion rate

### 4.6 Q&A Section on PDP `[L]`
- Customers can ask questions on product page
- Admin or other verified buyers can answer
- **Impact:** Reduces pre-purchase support queries; builds SEO content

### 4.7 Exit-Intent Popup `[M]`
- When user moves cursor toward browser tab/close on desktop
- Show: "Wait! Here's 10% off your first order" with email capture
- **Impact:** Recovers 10–15% of abandoning visitors

---

## PRIORITY 5 — MARKETING & GROWTH

### 5.1 Abandoned Cart Email `[L]`
- Trigger email 1 hour after cart abandoned (user logged in, no checkout)
- Email: Items in cart + total + "Complete Your Order" CTA
- Second email at 24 hours with optional small discount
- Requires: email queue system + cron job

### 5.2 WhatsApp Order Notifications `[L]`
- Send WhatsApp message on: Order Confirmed, Shipped, Delivered
- Use WhatsApp Business API or Interakt/Wati integration
- **Impact:** 90%+ open rate vs 20% email open rate in India

### 5.3 SMS Order Notifications `[M]`
- Integrate with Fast2SMS or MSG91
- Trigger on: Order placed, Shipped, Delivered, Return approved
- **Impact:** Expected by every Indian online shopper

### 5.4 Referral Program `[L]`
- "Refer a friend, both get ₹50 off"
- Unique referral link per user
- Track referral in DB, apply credit on first purchase

### 5.5 Google Analytics 4 + Meta Pixel `[M]`
- Add GA4 tracking (pageview, add_to_cart, purchase events)
- Add Meta Pixel for Facebook/Instagram retargeting
- Critical for paid advertising and understanding user behavior

### 5.6 Loyalty Points System `[L]`
- Earn points on every purchase (e.g., 1 point per ₹10 spent)
- Redeem points as discount on next order
- Show points balance on user profile and cart
- **Impact:** #1 retention mechanism for repeat purchases

### 5.7 Newsletter with Real Campaigns `[M]`
- Current system only sends OTP and order emails
- Integrate Mailchimp or Brevo (free tier available)
- Capture email on newsletter signup
- Send: New arrivals, sale announcements, blog digests

### 5.8 Blog — Internal Linking & SEO Strategy `[M]`
- Link blog posts to relevant product pages
- Add Article + Author JSON-LD schema
- Blog drives free organic traffic over time

---

## PRIORITY 6 — PERFORMANCE & TECH

### 6.1 Reduce CSS-in-JS Overlap `[L]`
- Currently using: Tailwind + Material UI (Emotion) + Styled Components = 3 CSS systems
- Standardize on Tailwind + MUI only, remove Styled Components
- **Impact:** Smaller bundle, faster LCP, better Core Web Vitals

### 6.2 Hero Image Priority Loading `[S]`
- Add `priority` prop to the first hero banner image in slider
- Prevents LCP delay on homepage
- One-line fix with significant performance impact

### 6.3 `next/font` for Font Loading `[S]`
- Replace Google Fonts `<link>` with `next/font` import
- Eliminates render-blocking font request
- Automatic font-display: swap

### 6.4 PWA — Progressive Web App `[L]`
- Add `next-pwa` package
- Service worker for offline caching
- Web App Manifest for "Add to Home Screen"
- **Impact:** App-like experience without Play Store; push notifications enabled

### 6.5 Web Push Notifications `[L]`
- After PWA setup, enable push notifications
- Notify users: Order updates, flash sales, back-in-stock alerts
- Requires user permission opt-in

### 6.6 CDN for Static Assets `[M]`
- Serve `/uploads/` folder via Cloudflare CDN or BunnyCDN
- Significantly reduces image load time globally

### 6.7 Low Stock / Out-of-Stock Admin Alerts `[S]`
- Email admin when any product stock falls below threshold (e.g., < 5 units)
- Show low-stock warning in admin product list

### 6.8 Dark Mode `[L]`
- Add dark/light mode toggle
- Persist preference in localStorage
- Tailwind `dark:` classes make this feasible

---

## PRIORITY 7 — ADMIN PANEL IMPROVEMENTS

### 7.1 Dashboard — Conversion Rate & AOV Metrics `[M]`
- Add: Conversion Rate, Average Order Value, Return Rate to KPI cards
- These are the metrics that actually drive business decisions

### 7.2 Sales Analytics — Export & Date Range `[M]`
- Export sales data as CSV/Excel
- Toggle chart: Today / This Week / This Month / Custom Range

### 7.3 Role-Based Admin Access `[L]`
- Add roles: Super Admin, Manager, Support Staff
- Support staff: view orders only, cannot edit products
- Manager: everything except settings and user deletion

### 7.4 Inventory Alerts Panel `[M]`
- Dedicated section showing all low-stock products
- Bulk restock action

### 7.5 Customer Segmentation `[L]`
- Tag customers: New, Returning, High-Value, Inactive
- Filter orders and users by segment
- Target segments with specific coupons

---

## SUMMARY TABLE

| # | Feature | Priority | Effort | Impact |
|---|---|---|---|---|
| 1.1 | Sticky Add to Cart (Mobile) | P1 | S | High |
| 1.2 | Breadcrumbs | P1 | S | High |
| 1.3 | Mobile Bottom Navigation | P1 | M | High |
| 1.4 | Announcement Bar on Mobile | P1 | S | Medium |
| 1.5 | Guest Cart (Login at Checkout) | P1 | M | High |
| 1.6 | "Only X Left" Stock Label | P1 | S | High |
| 1.7 | Pincode Delivery Checker | P1 | M | High |
| 1.8 | Recently Viewed Products | P1 | M | High |
| 2.1 | Floating WhatsApp Button | P2 | S | Medium |
| 2.2 | Zero Results / Did You Mean | P2 | M | Medium |
| 2.3 | Infinite Scroll / Load More | P2 | S | Medium |
| 2.4 | Brand Filter | P2 | M | Medium |
| 2.5 | Add to Cart on Card Hover | P2 | S | Medium |
| 2.6 | Return Policy on PDP | P2 | S | High |
| 2.7 | Trust Badges on PDP/Checkout | P2 | S | High |
| 2.8 | Empty State CTAs | P2 | S | Medium |
| 2.9 | Order Tracking with Courier Link | P2 | M | High |
| 2.10 | Product Video on PDP | P2 | L | High |
| 2.11 | Compare Products | P2 | L | Medium |
| 3.1 | InfixPass Membership | P3 | L | High |
| 4.1 | Flash Sale Countdown Timer | P4 | M | High |
| 4.2 | "X People Viewing" Indicator | P4 | M | High |
| 4.3 | FBT — Add All to Cart | P4 | S | Medium |
| 4.4 | Size/Color Guide | P4 | M | Medium |
| 4.5 | Review Photos + Verified Badge | P4 | M | High |
| 4.6 | Q&A Section on PDP | P4 | L | Medium |
| 4.7 | Exit-Intent Popup | P4 | M | High |
| 5.1 | Abandoned Cart Email | P5 | L | High |
| 5.2 | WhatsApp Order Notifications | P5 | L | High |
| 5.3 | SMS Notifications | P5 | M | High |
| 5.4 | Referral Program | P5 | L | Medium |
| 5.5 | GA4 + Meta Pixel | P5 | M | High |
| 5.6 | Loyalty Points | P5 | L | High |
| 5.7 | Newsletter Campaigns | P5 | M | Medium |
| 5.8 | Blog SEO & Internal Linking | P5 | M | Medium |
| 6.1 | Remove Styled Components | P6 | L | Medium |
| 6.2 | Hero Image Priority Prop | P6 | S | High |
| 6.3 | next/font Migration | P6 | S | Medium |
| 6.4 | PWA Setup | P6 | L | High |
| 6.5 | Web Push Notifications | P6 | L | High |
| 6.6 | CDN for Uploads | P6 | M | Medium |
| 6.7 | Low Stock Admin Alerts | P6 | S | Medium |
| 6.8 | Dark Mode | P6 | L | Low |
| 7.1 | Admin — CVR & AOV Metrics | P7 | M | Medium |
| 7.2 | Sales Export + Date Range | P7 | M | Medium |
| 7.3 | Role-Based Admin Access | P7 | L | Medium |
| 7.4 | Inventory Alerts Panel | P7 | M | Medium |
| 7.5 | Customer Segmentation | P7 | L | Medium |

---

> **Start with all P1 items — each is Small or Medium effort with High impact.**
> P1 alone will move overall UX score from 6.2 → 7.8+
