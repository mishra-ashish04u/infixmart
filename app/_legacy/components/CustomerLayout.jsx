import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

export default function CustomerLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <BottomNav />
    </>
  );
}
