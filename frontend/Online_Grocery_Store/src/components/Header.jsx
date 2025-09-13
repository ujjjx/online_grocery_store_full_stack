import { Button } from "./ui/button";
import { ShoppingCart, Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../pages/CartContext";
import { useAuth } from "../pages/AuthContext";
export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleViewCartClick = () => {
    navigate("/cart");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-green-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <ShoppingCart className="h-8 w-8 text-green-600 mr-2" />
            <span className="text-xl font-bold text-green-600">GroceryApp</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/products"
              className={`transition-colors duration-200 ${
                isActive("/products")
                  ? "text-green-600 font-medium"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              Products
            </Link>
            <Link
              to="/about"
              className={`transition-colors duration-200 ${
                isActive("/about")
                  ? "text-green-600 font-medium"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              About Me
            </Link>
          </nav>

          {/* Desktop Cart and Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-2 relative"
              onClick={handleViewCartClick}
            >
              <ShoppingBag className="h-4 w-4" />
              View Cart
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {user?.name || "User"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleRegisterClick}
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-green-200 py-4">
            <div className="space-y-4">
              <Link
                to="/products"
                className={`block px-4 py-2 transition-colors duration-200 ${
                  isActive("/products")
                    ? "text-green-600 font-medium bg-green-50"
                    : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/about"
                className={`block px-4 py-2 transition-colors duration-200 ${
                  isActive("/about")
                    ? "text-green-600 font-medium bg-green-50"
                    : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Me
              </Link>
              <div className="px-4 pt-4 border-t border-gray-200 space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 flex items-center justify-center gap-2 relative"
                  onClick={() => {
                    handleViewCartClick();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <ShoppingBag className="h-4 w-4" />
                  View Cart ({getCartItemsCount()})
                </Button>

                {isAuthenticated ? (
                  <>
                    <div className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {user?.name || "User"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => {
                        handleLoginClick();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        handleRegisterClick();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
