import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../pages/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isClicked, setIsClicked] = useState(false);
  const { addToCart, isInCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Add the product to cart with the selected quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    // Show success toast
    toast.success(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart!`, {
      description: `$${(product.price * quantity).toFixed(2)} - ${product.description}`,
      duration: 2000,
    });

    // Button click animation
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
  };

  const handleQuantityIncrease = () => {
    handleQuantityChange(quantity + 1);
  };

  const handleQuantityDecrease = () => {
    handleQuantityChange(quantity - 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={product.inStock ? "default" : "destructive"}
            className={`${
              product.inStock 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Company Name */}
        <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">
          {product.company}
        </p>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>

        {/* Product Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-green-600">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through ml-2">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleQuantityDecrease}
                disabled={quantity <= 1}
                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium text-gray-800">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleQuantityIncrease}
                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full bg-green-600 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            isClicked ? 'scale-95 bg-green-800' : ''
          } ${
            !product.inStock ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {!product.inStock ? 'Out of Stock' : isInCart(product.id) ? 'Add More to Cart' : 'Add to Cart'}
        </Button>

        {/* Product in Cart Indicator */}
        {isInCart(product.id) && product.inStock && (
          <p className="text-xs text-green-600 text-center mt-2 font-medium">
            ✓ Already in cart
          </p>
        )}
      </div>
    </div>
  );
}