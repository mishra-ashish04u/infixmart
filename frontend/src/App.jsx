import React, { Suspense, createContext, lazy, useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import toast, { Toaster } from "react-hot-toast";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import ProductZoom from "./components/ProductZoom";
import { IoClose } from "react-icons/io5";
import ProductDetailsComponent from "./components/ProductDetails";
import { getData } from "./utils/api";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { SettingsProvider } from "./context/SettingsContext";

const NotFound = lazy(() => import("./Pages/NotFound"));
const CustomerLayout = lazy(() => import("./components/CustomerLayout"));
const Home = lazy(() => import("./Pages/Home"));
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const AdminGuard = lazy(() => import("./admin/AdminGuard"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const CategoryManagement = lazy(() => import("./admin/pages/CategoryManagement"));
const ProductManagement = lazy(() => import("./admin/pages/ProductManagement"));
const ProductForm = lazy(() => import("./admin/pages/ProductForm"));
const OrderManagement = lazy(() => import("./admin/pages/OrderManagement"));
const UserManagement = lazy(() => import("./admin/pages/UserManagement"));
const SliderManagement = lazy(() => import("./admin/pages/SliderManagement"));
const AttributeManagement = lazy(() => import("./admin/pages/AttributeManagement"));
const StoreSettingsPage = lazy(() => import("./admin/pages/StoreSettings"));
const BlogManagement = lazy(() => import("./admin/pages/BlogManagement"));
const HomePageManagement = lazy(() => import("./admin/pages/HomePageManagement"));
const ReturnManagement = lazy(() => import("./admin/pages/ReturnManagement"));
const CouponManagement = lazy(() => import("./admin/pages/CouponManagement"));
const AdminNotFound = lazy(() => import("./admin/pages/AdminNotFound"));
const ProductListing = lazy(() => import("./Pages/ProductListing"));
const ProductDetails = lazy(() => import("./Pages/ProductDetails"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));
const CartPage = lazy(() => import("./Pages/Cart"));
const Verify = lazy(() => import("./Pages/Verify"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
const Checkout = lazy(() => import("./Pages/Checkout"));
const MyAccount = lazy(() => import("./Pages/MyAccount"));
const MyAddress = lazy(() => import("./Pages/MyAddress"));
const MyList = lazy(() => import("./Pages/MyList"));
const Orders = lazy(() => import("./Pages/Orders"));
const OrderSuccess = lazy(() => import("./Pages/OrderSuccess"));
const BlogListing = lazy(() => import("./Pages/Blog"));
const BlogDetail = lazy(() => import("./Pages/Blog/BlogDetail"));
const LegalPage = lazy(() => import("./Pages/Legal"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

const MyContext = createContext();

const RouteLoader = () => (
  <div className="min-h-[40vh] flex items-center justify-center bg-[#F8FAFC]">
    <div className="w-10 h-10 rounded-full border-4 border-[#D8E6FB] border-t-[#1565C0] animate-spin" />
  </div>
);

function App() {
  const [openProductDetailsModal, setOpenProductDetailsModal] = useState(false);
  const [maxWidth] = useState("lg");
  const [fullWidth] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [openCartPanel, setOpenCartPanel] = useState(false);

  const handleCloseProductDetailsModal = () => {
    setOpenProductDetailsModal(false);
  };

  const toggleCartPanel = (newOpen) => () => {
    setOpenCartPanel(newOpen);
  };

  useEffect(() => {
    getData("/api/user/user-details")
      .then((res) => {
        if (res && res.error === false) {
          setUserData(res.user);
          setIsLogin(true);
        } else {
          setIsLogin(false);
          setUserData(null);
        }
      })
      .catch(() => {
        setIsLogin(false);
        setUserData(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const openAlertBox = (status, msg) => {
    if (status === "success") toast.success(msg);
    if (status === "error") toast.error(msg);
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
    authLoading,
  };

  return (
    <>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
        <BrowserRouter>
          <MyContext.Provider value={values}>
            <SettingsProvider>
              <CartProvider>
                <WishlistProvider>
                  <Suspense fallback={<RouteLoader />}>
                    <Routes>
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route
                        path="/admin"
                        element={
                          <AdminGuard>
                            <AdminLayout />
                          </AdminGuard>
                        }
                      >
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="products" element={<ProductManagement />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/:id/edit" element={<ProductForm />} />
                        <Route path="orders" element={<OrderManagement />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="sliders" element={<SliderManagement />} />
                        <Route path="attributes" element={<AttributeManagement />} />
                        <Route path="settings" element={<StoreSettingsPage />} />
                        <Route path="blogs" element={<BlogManagement />} />
                        <Route path="coupons" element={<CouponManagement />} />
                        <Route path="homepage" element={<HomePageManagement />} />
                        <Route path="returns" element={<ReturnManagement />} />
                        <Route path="*" element={<AdminNotFound />} />
                      </Route>

                      <Route element={<CustomerLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/productListing" element={<ProductListing />} />
                        <Route path="/product/:productParam" element={<ProductDetails />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify" element={<Verify />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
                        <Route path="/my-address" element={<ProtectedRoute><MyAddress /></ProtectedRoute>} />
                        <Route path="/my-list" element={<ProtectedRoute><MyList /></ProtectedRoute>} />
                        <Route path="/my-orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                        <Route path="/blog" element={<BlogListing />} />
                        <Route path="/blog/:slug" element={<BlogDetail />} />
                        <Route path="/terms" element={<LegalPage />} />
                        <Route path="/shipping-policy" element={<LegalPage />} />
                        <Route path="/return-policy" element={<LegalPage />} />
                        <Route path="/payment-security" element={<LegalPage />} />
                        <Route path="/privacy-policy" element={<LegalPage />} />
                        <Route path="/cancellation-policy" element={<LegalPage />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </WishlistProvider>
              </CartProvider>
            </SettingsProvider>
          </MyContext.Provider>
        </BrowserRouter>
      </GoogleOAuthProvider>

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
              className="!w-[40px] !min-w-[40px] !h-[40px] !rounded-full !text-[#000] !font-bold !absolute top-[15px] right-[15px] !bg-[#f1f1f1]"
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
