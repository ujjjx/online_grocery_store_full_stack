import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './pages/CartContext';
import { AuthProvider } from './pages/AuthContext';
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import PlaceOrder from "./pages/PlaceOrder";
import ErrorPage from "./pages/ErrorPage";
import Checkout from './pages/CheckOut';
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
            <Header />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/place-order" element={<PlaceOrder />} />
                {/* <Route path="*" element={<ErrorPage />} /> */}
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster richColors position="bottom-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}