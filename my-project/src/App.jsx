import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import ProductListing from "./Pages/ProductListing";
import ProductDetails from "./Pages/ProductDetails";
import { createContext } from "react";
import toast, { Toaster } from "react-hot-toast";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useState } from "react";
import ProductZoom from "./components/ProductZoom";
import { IoClose } from "react-icons/io5";
import ProductDetailsComponent from "./components/ProductDetails";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CartPage from "./Pages/Cart";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import Checkout from "./Pages/Checkout";
import MyAccount from "./Pages/MyAccount";
import MyAddress from "./Pages/MyAddress";
import MyList from "./Pages/MyList";
import Orders from "./Pages/Orders";
import { getData } from "./utils/api";

const MyContext = createContext();

function App() {
  const [openProductDetailsModal, setOpenProductDetailsModal] = useState(false);
  const [maxWidth, setMaxWidth] = useState("lg");
  const [fullWidth, setFullWidth] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);

  const [openCartPanel, setOpenCartPanel] = useState(false);

  const handleCloseProductDetailsModal = () => {
    setOpenProductDetailsModal(false);
  };

  const toggleCartPanel = (newOpen) => () => {
    setOpenCartPanel(newOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("accesstoken");

    // 1) No token → user is NOT logged in
    if (!token) {
      setIsLogin(false);
      setUserData(null);
      return;
    }

    // 2) Token exists → validate with backend
    getData("/api/user/user-details", { withCredentials: true })
      .then((res) => {
        console.log("Auto-login:", res);

        if (res && res.error === false) {
          setUserData(res.user);  // backend sends: { user: {...} }
          setIsLogin(true);
        } else {
          localStorage.removeItem('accesstoken', res?.data?.accesstoken);
          localStorage.removeItem('refreshtoken', res?.data?.refreshtoken);
          setIsLogin(false);
        }
      })
      .catch((err) => {
        console.log("Auto-login failed:", err);
        setIsLogin(false);
        setUserData(null);
      })
  }, []);  // 🔥 run ONCE on startup

  const openAlertBox = (status, msg) => {
    if (status === "success") {
      toast.success(msg);
    }
    if (status === "error") {
      toast.error(msg);
    }
  };

  const values = {
    setOpenProductDetailsModal,
    setOpenCartPanel,
    toggleCartPanel,
    openCartPanel,
    openAlertBox,
    isLogin,
    setIsLogin,
    setUserData,
    userData,

  };

  return (
    <>
      <BrowserRouter>
        <MyContext.Provider value={values}>
          <Header />
          <Routes>
            <Route path="/" excat={true} element={<Home />} />
            <Route
              path="/productListing"
              excat={true}
              element={<ProductListing />}
            />
            <Route
              path="/product/:id"
              excat={true}
              element={<ProductDetails />}
            />
            <Route path="/login" excat={true} element={<Login />} />
            <Route path="/register" excat={true} element={<Register />} />
            <Route path="/cart" excat={true} element={<CartPage />} />
            <Route path="/verify" excat={true} element={<Verify />} />
            <Route
              path="/forgot-password"
              excat={true}
              element={<ForgotPassword />}
            />
            <Route path="/checkout" excat={true} element={<Checkout />} />
            <Route path="/my-account" excat={true} element={<MyAccount />} />
            <Route path="/my-address" excat={true} element={<MyAddress />} />
            <Route path="/my-list" excat={true} element={<MyList />} />
            <Route path="/my-orders" excat={true} element={<Orders />} />
          </Routes>
          <Footer />
        </MyContext.Provider>
      </BrowserRouter>

      <Toaster />

      <Dialog
        open={openProductDetailsModal}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        onClose={handleCloseProductDetailsModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="productDetailModal"
      >
        <DialogContent>
          <div className="relative flex items-center w-full productDetailModalContainer">
            <Button
              className="!w-[40px] !min-w-[40px] !h-[40px] !rounded-full !text-[#000] !font-bold
            !absolute top-[15px] right-[15px] !bg-[#f1f1f1]"
              onClick={handleCloseProductDetailsModal}
            >
              <IoClose className="text-[20px]" />
            </Button>
            <div className="col1 w-[40%] px-3">
              <ProductZoom />
            </div>
            <div className="col2 w-[60%] px-8 pr-16 py-8 productContent">
              <ProductDetailsComponent />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;

export { MyContext };
