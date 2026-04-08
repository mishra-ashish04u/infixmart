// ── Tailwind MUST come first so our custom CSS can override it ──────────────
import "./tailwind.css";                                          // @tailwind base / components / utilities
import "./globals.css";                                           // minimal html/body resets
import "./_legacy/index.css";                                     // global custom styles (.container, body, etc.)

// ── Component-level CSS ──────────────────────────────────────────────────────
import "./_legacy/components/bannerBoxV2/style.css";
import "./_legacy/components/Header/Navigation/style.css";
import "./_legacy/components/HeroSlider/style.css";
import "./_legacy/components/HomeCatSlider/style.css";
import "./_legacy/components/ProductItem/style.css";
import "./_legacy/components/ProductItemListView/style.css";
import "./_legacy/components/Search/style.css";
import "./_legacy/components/sideBar/style.css";

// ── Third-party CSS ──────────────────────────────────────────────────────────
import "react-inner-image-zoom/lib/styles.min.css";
import "../node_modules/react-range-slider-input/dist/style.css";

import LegacyProviders from "./_legacy/LegacyProviders.jsx";

export const metadata = {
  title: {
    default: "InfixMart Wholesale",
    template: "%s | InfixMart Wholesale",
  },
  description:
    "InfixMart — India's wholesale marketplace. Bulk products starting at ₹29. Free shipping on orders above ₹999.",
  keywords: ["wholesale", "bulk", "India", "InfixMart", "online shopping"],
  authors: [{ name: "InfixMart" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "InfixMart Wholesale",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1565C0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {/* #page-wrapper clips horizontal overflow WITHOUT breaking position:sticky */}
        <div id="page-wrapper">
          <LegacyProviders>{children}</LegacyProviders>
        </div>
      </body>
    </html>
  );
}
