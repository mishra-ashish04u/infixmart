"use client";

import React, { useContext, useEffect, useState } from "react";
import { FaRegUser, FaRegHeart, FaMapMarkerAlt } from "react-icons/fa";
import { LuClipboardCheck } from "react-icons/lu";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { MdAccountBalanceWallet, MdPhotoCamera } from "react-icons/md";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NextImage from "next/image";
import { MyContext } from "../../LegacyProviders";
import { putDataForImage } from "../../utils/api";
import { imgUrl } from "../../utils/imageUrl";
import useLogout from "../../hooks/useLogout";

const NAV_ITEMS = [
  { href: "/my-account", icon: FaRegUser,             label: "My Profile" },
  { href: "/my-orders",  icon: LuClipboardCheck,      label: "My Orders" },
  { href: "/my-list",    icon: FaRegHeart,            label: "Wishlist" },
  { href: "/my-address", icon: FaMapMarkerAlt,        label: "Addresses" },
  { href: "/referral",   icon: MdAccountBalanceWallet, label: "Wallet & Refer" },
];

const AccountSidebar = () => {
  const [previews, setPreviews]   = useState([]);
  const [uploading, setUploading] = useState(false);
  const context = useContext(MyContext);
  const logout  = useLogout();
  const pathname = usePathname();

  useEffect(() => {
    if (context?.userData?.avatar) setPreviews([context.userData.avatar]);
  }, [context?.userData]);

  const onChangeFile = async (e) => {
    const files   = e.target.files;
    const allowed = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    const formdata = new FormData();
    setUploading(true);
    for (let file of files) {
      if (!allowed.includes(file.type)) {
        context.openAlertBox("error", "Please select a valid JPG/JPEG/PNG/WEBP image.");
        setUploading(false);
        return;
      }
      formdata.append("avatar", file);
    }
    const res = await putDataForImage("/api/user/user-avatar", formdata);
    setUploading(false);
    if (res?.avatar) setPreviews([res.avatar]);
  };

  const avatarSrc = previews[0]
    ? imgUrl(previews[0])
    : context?.userData?.avatar
      ? imgUrl(context.userData.avatar)
      : null;

  const initials = context?.userData?.name
    ? context.userData.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const memberSince = context?.userData?.createdAt
    ? new Date(context.userData.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="sticky top-[80px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Avatar / User Header ── */}
      <div className="bg-gradient-to-br from-[#1A237E] to-[#1565C0] px-5 pt-6 pb-7 text-center">
        <div className="relative w-20 h-20 mx-auto mb-3">
          <div className="w-20 h-20 rounded-2xl bg-white/20 overflow-hidden flex items-center justify-center border-2 border-white/30">
            {avatarSrc ? (
              <NextImage src={avatarSrc} alt="profile" fill className="object-cover" sizes="80px" />
            ) : (
              <span className="text-white text-[26px] font-[800] select-none">{initials}</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {/* Camera button — always visible, no hidden hover overlay */}
          <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors border border-gray-100">
            <MdPhotoCamera className="text-[#1565C0] text-[15px]" />
            <input
              type="file"
              onChange={onChangeFile}
              name="avatar"
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>
        <h3 className="text-[15px] font-[700] text-white leading-tight truncate">
          {context?.userData?.name || "User"}
        </h3>
        <p className="text-[11px] text-white/65 mt-0.5 truncate px-2">
          {context?.userData?.email}
        </p>
        {memberSince && (
          <p className="text-[10px] text-white/45 mt-1">Member since {memberSince}</p>
        )}
      </div>

      {/* ── Nav Links ── */}
      <nav className="p-2 mt-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-[600] transition-all mb-0.5 ${
                active
                  ? "bg-[#EEF4FF] text-[#1565C0]"
                  : "text-gray-600 hover:bg-[#F8FAFF] hover:text-[#1565C0]"
              }`}
            >
              <Icon className={`text-[15px] flex-shrink-0 ${active ? "text-[#1565C0]" : "text-gray-400"}`} />
              <span className="flex-1">{label}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0] flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="px-2 pb-3 pt-1 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-[600] text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <RiLogoutBoxRLine className="text-[16px]" />
          Logout
        </button>
      </div>

    </div>
  );
};

export default AccountSidebar;
