import { useCart } from './CartContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { Button } from '../components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function Cart() {
    const { items, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartItemsCount } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const formatPrice = (price) => {
        return price.toFixed(2);
    };

    const handleProceedToCheckout = () => {
        if (isAuthenticated) {
            navigate('/checkout');
        } else {
            navigate('/login', { state: { from: '/checkout' } });
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="h-12 w-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
                        </p>
                        <Link to="/products">
                            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-3">
                                <ArrowLeft className="h-4 w-4" />
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
                        <p className="text-gray-600 mt-2">
                            {getCartItemsCount()} {getCartItemsCount() === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                    <Link to="/products">
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 xl:flex-grow">
                        <div className="bg-white rounded-lg shadow-sm border border-green-100 overflow-hidden">
                            {/* Cart Items Header */}
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="font-semibold text-gray-800">Cart Items</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearCart}
                                    className="text-red-600 border-red-200 hover:bg-red-50 self-start sm:self-auto"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear Cart
                                </Button>
                            </div>

                            {/* Cart Items List */}
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div key={item.id} className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                                                <ImageWithFallback
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0 text-center sm:text-left">
                                                {item.company && (
                                                    <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">
                                                        {item.company}
                                                    </p>
                                                )}
                                                <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</p>
                                                <p className="text-green-600 font-semibold">${formatPrice(item.price)} each</p>
                                            </div>

                                            {/* Quantity Controls and Actions */}
                                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        className="h-9 w-9 p-0 bg-white border-gray-200 hover:bg-gray-100 rounded-md"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-16 text-center font-semibold text-gray-800 px-3">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        className="h-9 w-9 p-0 bg-white border-gray-200 hover:bg-gray-100 rounded-md"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Item Total and Remove */}
                                                <div className="text-center sm:text-right min-w-0">
                                                    <p className="font-semibold text-gray-800 mb-2">
                                                        ${formatPrice(item.price * item.quantity)}
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full xl:w-96 xl:flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-green-100 p-6 xl:sticky xl:top-24">
                            <h2 className="font-semibold text-gray-800 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({getCartItemsCount()} items)</span>
                                    <span className="font-medium">${formatPrice(getCartTotal())}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (8%)</span>
                                    <span className="font-medium">${formatPrice(getCartTotal() * 0.08)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total</span>
                                        <span className="text-green-600">${formatPrice(getCartTotal() * 1.08)}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleProceedToCheckout}
                                className="w-full bg-green-600 hover:bg-green-700 text-white mb-4 py-3"
                            >
                                Proceed to Checkout
                            </Button>

                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 text-center">
                                    Free shipping on orders over $50
                                </p>
                                <p className="text-xs text-gray-500 text-center">
                                    Tax calculated at checkout
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}