import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { RiFolderUploadFill } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { LuClipboardCheck } from "react-icons/lu";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FaRegHeart, FaMapMarkerAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { MyContext } from "../../App";
import CircularProgress from "@mui/material/CircularProgress";
import { putDataForImage } from "../../utils/api";

const AccountSidebar = () => {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const context = useContext(MyContext);

  useEffect(() => {
    const userAvatar = [];
    userAvatar.push(context?.userData?.avatar);
    setPreviews(userAvatar);
  }, [context?.userData]);

  let img_arr = [];
  let uniqueArray = [];
  let selectedImages = [];

  const formdata = new FormData();

  const onChangeFile = async (e, apiEndPoint) => {
    try {
      setPreviews([]);

      const files = e.target.files;
      const allowedTypes = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      setUploading(true);

      for (let file of files) {
        if (allowedTypes.includes(file.type)) {
          selectedImages.push(file);
          formdata.append(`avatar`, file);

          putDataForImage("/api/user/user-avatar", formdata, {
            withCredentials: true,
          }).then((res) => {
            setUploading(false);
            let avatar = [];
            avatar.push(res?.avatar);
            setPreviews(avatar);
          });
        } else {
          context.openAlertBox(
            "error",
            "Please select a valid JPG/JPEG/PNG/WEBP image file."
          );
          setUploading(false);
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="sticky bg-white rounded-md shadow-md card top-[10px]">
      <div className="flex flex-col items-center justify-center w-full p-5">
        <div className="w-[110px] h-[110px] mb-4 rounded-full relative overflow-hidden group flex items-center justify-center bg-gray-200">
          {uploading === true ? (
            <CircularProgress color="inherit" />
          ) : (
            <>
              {previews && previews.length > 0 && previews[0] ? (
                previews.map((img, index) => (
                  <img
                    src={img}
                    key={index}
                    alt="profile"
                    className="object-cover w-full h-full"
                  />
                ))
              ) : context.userData?.avatar ? (
                <img
                  src={context.userData.avatar}
                  alt="profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt="default"
                  className="object-cover w-full h-full"
                />
              )}
            </>
          )}

          <div className="absolute flex items-center justify-center cursor-pointer top-0 left-0 z-50 w-full h-full overlay opacity-0 transition-all bg-[rgba(0,0,0,0.7)] group-hover:opacity-100">
            <RiFolderUploadFill className="text-[#fff] text-[22px]" />
            <input
              type="file"
              onChange={(e) => onChangeFile(e, "/api/user/user-avatar")}
              name="avatar"
              accept="image/*"
              className="absolute top-0 left-0 w-full h-full opacity-0"
            />
          </div>
        </div>

        <h3>{context?.userData?.name}</h3>
        <h6 className="text-[13px] font-500">{context?.userData?.email}</h6>
      </div>

      <ul className="list-none bg-[#f1f1f1] myAccountTabs">
        <li className="w-full pb-5">
          <NavLink to="/my-account" exact={true} activeClassName="isActive">
            <Button className="flex !py-2 !capitalize !px-5 !text-left !justify-start !text-[rgba(0,0,0,0.8)] items-center w-full gap-2 !rounded-none">
              <FaRegUser className="text-[20px]" />
              My Profile
            </Button>
          </NavLink>
        </li>
        <li className="w-full pb-5">
          <NavLink to="/my-list" exact={true} activeClassName="isActive">
            <Button className="flex !py-2 !capitalize !px-5 !text-left !justify-start !text-[rgba(0,0,0,0.8)] items-center w-full gap-2 !rounded-none">
              <FaRegHeart className="text-[20px]" />
              My List
            </Button>
          </NavLink>
        </li>
        <li className="w-full pb-5">
          <NavLink to="/my-orders" exact={true} activeClassName="isActive">
            <Button className="flex !py-2 !capitalize !px-5 !text-left !justify-start !text-[rgba(0,0,0,0.8)] items-center w-full gap-2 !rounded-none">
              <LuClipboardCheck className="text-[20px]" />
              My Orders
            </Button>
          </NavLink>
        </li>
        <li className="w-full pb-5">
          <NavLink to="/my-address" exact={true} activeClassName="isActive">
            <Button className="flex !py-2 !capitalize !px-5 !text-left !justify-start !text-[rgba(0,0,0,0.8)] items-center w-full gap-2 !rounded-none">
              <FaMapMarkerAlt className="text-[20px]" />
              My Addresses
            </Button>
          </NavLink>
        </li>
        <li className="w-full pb-5">
          <Button className="flex !py-2 !capitalize !px-5 !text-left !justify-start !text-[rgba(0,0,0,0.8)] items-center w-full gap-2 !rounded-none">
            <RiLogoutBoxRLine className="text-[20px]" />
            Logout
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default AccountSidebar;
