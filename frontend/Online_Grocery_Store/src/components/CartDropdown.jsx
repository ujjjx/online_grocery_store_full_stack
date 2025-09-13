import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from './contexts/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart, getTotalItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    setIsOpen(false);
    // Navigate to checkout page (you can create this later)
    console.log('Proceeding to checkout');
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative border-green-600 text-green-600 hover:bg-green-50"
        >
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-green-600 text-white text-xs">
              {totalItems}
            </Badge>
          )}
          <span className="ml-2 hidden sm:inline">Cart</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
            Shopping Cart ({totalItems} items)
          </SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg text-gray-500 mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-4">Add some items to get started</p>
            <Button
              onClick={() => {
                setIsOpen(false);
                navigate('/products');
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <ScrollArea className="flex-1 mt-6">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-white rounded-md overflow-hidden">
                      {item.image_url ? (
                        <ImageWithFallback
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {item.emoji || '📦'}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.company_name || 'GroceryMart'}
                      </p>
                      <p className="text-lg text-green-600">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            {/* Cart Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg">Total: ${totalPrice.toFixed(2)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}