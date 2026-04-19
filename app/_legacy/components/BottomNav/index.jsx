"use client";

import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiOutlineHome } from "react-icons/hi";
import { MdOutlineGridView, MdGridView, MdClose } from "react-icons/md";
import { RiSearchLine, RiSearchFill } from "react-icons/ri";
import { MdOutlineShoppingCart, MdShoppingCart, MdOutlinePersonOutline, MdPerson } from "react-icons/md";
import { useCart } from "../../context/CartContext";
import { MyContext } from "../../LegacyProviders";
import Search from "../Search";

const HIDDEN_PATHS = ["/product/", "/checkout", "/admin", "/login", "/register", "/verify", "/forgot-password", "/order-success"];

const BottomNav = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { isLogin } = useContext(MyContext);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close search on route change
  useEffect(() => { setSearchOpen(false); }, [pathname]);

  // Lock body scroll when search open
  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  const tabs = [
    {
      href: "/",
      label: "Home",
      icon: <HiOutlineHome className="text-[22px]" />,
      activeIcon: <HiHome className="text-[22px]" />,
      isActive: pathname === "/",
    },
    {
      href: "/productListing",
      label: "Shop",
      icon: <MdOutlineGridView className="text-[22px]" />,
      activeIcon: <MdGridView className="text-[22px]" />,
      isActive: pathname.startsWith("/productListing"),
    },
    {
      label: "Search",
      icon: <RiSearchLine className="text-[22px]" />,
      activeIcon: <RiSearchFill className="text-[22px]" />,
      isActive: searchOpen,
      isSearch: true,
    },
    {
      href: "/cart",
      label: "Cart",
      icon: <MdOutlineShoppingCart className="text-[22px]" />,
      activeIcon: <MdShoppingCart className="text-[22px]" />,
      isActive: pathname === "/cart",
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      href: isLogin ? "/my-account" : "/login",
      label: isLogin ? "Account" : "Login",
      icon: <MdOutlinePersonOutline className="text-[22px]" />,
      activeIcon: <MdPerson className="text-[22px]" />,
      isActive: pathname.startsWith("/my-account") || pathname.startsWith("/my-orders"),
    },
  ];

  return (
    <>
      {/* Spacer so content doesn't hide under the nav */}
      <div className="h-[60px] md:hidden" />

      {/* ── Fullscreen Search Overlay ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[999] flex flex-col md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setSearchOpen(false)} />
          {/* Search panel */}
          <div className="relative z-10 bg-white pt-4 px-4 pb-3 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[15px] font-[700] text-gray-800 flex-1">Search</span>
              <button
                onClick={() => setSearchOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <MdClose className="text-[18px]" />
              </button>
            </div>
            <Search />
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-[56px] px-1">
          {tabs.map((tab) =>
            tab.isSearch ? (
              <button
                key="search"
                onClick={() => setSearchOpen((v) => !v)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 transition-colors relative ${
                  searchOpen ? "text-[#1565C0]" : "text-gray-400"
                }`}
              >
                {searchOpen && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[24px] h-[2px] bg-[#1565C0] rounded-full" />
                )}
                {searchOpen ? tab.activeIcon : tab.icon}
                <span className="text-[10px] font-[600] leading-none">{tab.label}</span>
              </button>
            ) : (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 transition-colors relative ${
                  tab.isActive ? "text-[#1565C0]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.badge && (
                  <span className="absolute top-1.5 left-1/2 translate-x-[2px] w-[16px] h-[16px] bg-[#E53935] text-white text-[9px] font-[800] rounded-full flex items-center justify-center leading-none">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
                {tab.isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[24px] h-[2px] bg-[#1565C0] rounded-full" />
                )}
                {tab.isActive ? tab.activeIcon : tab.icon}
                <span className="text-[10px] font-[600] leading-none">{tab.label}</span>
              </Link>
            )
          )}
        </div>
        <div className="h-safe-bottom" />
      </nav>
    </>
  );
};

export default BottomNav;
