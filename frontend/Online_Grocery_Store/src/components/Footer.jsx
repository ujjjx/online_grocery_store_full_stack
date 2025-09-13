import { Link } from 'react-router-dom';
import { ShoppingCart, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-8 w-8 text-green-300 mr-2" />
              <span className="text-2xl text-white">GroceryMart</span>
            </div>
            <p className="text-green-100 mb-4 max-w-md">
              Your trusted partner for fresh groceries and quality products. 
              We make grocery shopping simple, convenient, and enjoyable.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-green-100">
                <Mail className="h-4 w-4 mr-2" />
                <span>ujjjwalx@gmail.com</span>
              </div>
              <div className="flex items-center text-green-100">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91-9871922407</span>
              </div>
              <div className="flex items-center text-green-100">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Assotech Windsor Court Sector-78 Noida</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/products" 
                  className="text-green-100 hover:text-white transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-green-100 hover:text-white transition-colors"
                >
                  About Me
                </Link>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-green-100 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/categories/fruits" 
                  className="text-green-100 hover:text-white transition-colors"
                >
                  Fruits
                </a>
              </li>
              <li>
                <a 
                  href="/categories/vegetables" 
                  className="text-green-100 hover:text-white transition-colors"
                >
                  Vegetables
                </a>
              </li>
              <li>
                <a 
                  href="/categories/dairy" 
                  className="text-green-100 hover:text-white transition-colors"
                >
                  Dairy
                </a>
              </li>
              <li>
                <a 
                  href="/categories/pantry" 
                  className="text-green-100 hover:text-white transition-colors"
                >
                  Pantry
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-700 mt-8 pt-8 text-center">
          <p className="text-green-100">
            © 2025 GroceryMart. All rights reserved. | Built with care for fresh food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}