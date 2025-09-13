// src/pages/ProductPage.jsx
import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from '../components/ProductCard';

const mockProducts = [
  {
    id: 1,
    name: "Organic Mixed Vegetables",
    company: "Farm Fresh Co.",
    description: "A colorful mix of organic carrots, bell peppers, broccoli and other seasonal vegetables. Perfect for healthy meals and stir-fries.",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1657288089316-c0350003ca49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMG9yZ2FuaWMlMjB2ZWdldGFibGVzfGVufDF8fHx8MTc1NjY0NjUxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    inStock: true
  },
  {
    id: 2,
    name: "Fresh Fruit Mix",
    company: "Orchard Select",
    description: "Sweet and juicy apples and oranges handpicked from local orchards. Rich in vitamins and perfect for snacking or juice.",
    price: 6.49,
    image: "https://images.unsplash.com/photo-1624835020719-deec76c86249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0cyUyMGFwcGxlJTIwb3JhbmdlfGVufDF8fHx8MTc1NjY0OTUxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    inStock: true
  },
  {
    id: 3,
    name: "Organic Whole Milk",
    company: "Green Pastures Dairy",
    description: "Fresh organic whole milk from grass-fed cows. Rich, creamy taste with no artificial hormones or antibiotics.",
    price: 4.29,
    image: "https://images.unsplash.com/photo-1621458472871-d8b6a409aba1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxrJTIwZGFpcnklMjBwcm9kdWN0c3xlbnwxfHx8fDE3NTY1NzAxMTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    inStock: true
  },
  {
    id: 4,
    name: "Artisan Whole Grain Bread",
    company: "Bakehouse Artisan",
    description: "Handcrafted whole grain bread made with organic flour, seeds, and ancient grains. Perfect for sandwiches and toast.",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1626423642268-24cc183cbacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aG9sZSUyMGdyYWluJTIwYnJlYWR8ZW58MXx8fHwxNzU2NjU2MTM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    inStock: false
  },
  {
    id: 5,
    name: "Italian Pasta Collection",
    company: "Nonna's Kitchen",
    description: "Premium Italian pasta made from durum wheat. Includes a variety of shapes perfect for any sauce or recipe.",
    price: 3.79,
    image: "https://images.unsplash.com/photo-1749169337822-d875fd6f4c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGl0YWxpYW4lMjBmb29kfGVufDF8fHx8MTc1NjU2ODc5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    inStock: true
  },
  {
    id: 6,
    name: "Free-Range Organic Eggs",
    company: "Happy Hens Farm",
    description: "Farm-fresh eggs from free-range organic chickens. Rich in omega-3 fatty acids and perfect for breakfast or baking.",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1623428454609-8ed6a4628b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwZWdnc3xlbnwxfHx8fDE3NTY2NDk1MjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    inStock: true
  }
];

export default function ProductPage({ onAddToCart }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-green-800 mb-2">Our Fresh Products</h1>
        <p className="text-green-600">Discover our selection of fresh, organic, and locally-sourced groceries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

ProductPage.propTypes = {
  onAddToCart: PropTypes.func,
};
