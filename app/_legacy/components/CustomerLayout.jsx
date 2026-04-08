import Header from "./Header";
import Footer from "./Footer";

export default function CustomerLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
