import { useState } from 'react';
import { useCart } from './CartContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
    CreditCard,
    Smartphone,
    Building,
    ShieldCheck,
    Lock,
    CheckCircle,
    ArrowLeft,
    Wallet,
    DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function PlaceOrder() {
    const { items, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const [paymentInfo, setPaymentInfo] = useState({
        // UPI
        upiId: '',
        // Card
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        // Net Banking
        bankName: '',
        // Wallet
        walletType: ''
    });

    const formatPrice = (price) => price.toFixed(2);
    const subtotal = getCartTotal();
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const handlePaymentChange = (field, value) => {
        setPaymentInfo(prev => ({ ...prev, [field]: value }));
    };

    const validatePayment = () => {
        if (paymentMethod === 'upi' && !paymentInfo.upiId.trim()) {
            toast.error('Please enter your UPI ID');
            return false;
        }

        if (paymentMethod === 'card') {
            const requiredCard = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
            for (let field of requiredCard) {
                if (!paymentInfo[field].trim()) {
                    toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                    return false;
                }
            }
        }

        if (paymentMethod === 'netbanking' && !paymentInfo.bankName.trim()) {
            toast.error('Please select your bank');
            return false;
        }

        if (paymentMethod === 'wallet' && !paymentInfo.walletType.trim()) {
            toast.error('Please select your wallet');
            return false;
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validatePayment()) return;

        setLoading(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 3000));

            setOrderPlaced(true);
            clearCart();

            toast.success('Order placed successfully! 🎉', {
                description: `Your order of $${formatPrice(total)} has been confirmed. You'll receive a confirmation email shortly.`,
                duration: 5000,
            });

            // Redirect to home after a delay
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
                <div className="max-w-md mx-auto text-center px-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">
                        Your order has been placed and payment processed successfully. We'll send you a confirmation email shortly.
                    </p>
                    <div className="bg-white rounded-lg border border-green-100 p-4 mb-6">
                        <p className="text-sm text-gray-500 mb-2">Order Total</p>
                        <p className="text-2xl font-bold text-green-600">${formatPrice(total)}</p>
                        <p className="text-sm text-gray-500 mt-2">Payment Method: {paymentMethod.toUpperCase()}</p>
                    </div>
                    <p className="text-sm text-gray-500">Redirecting to homepage...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/checkout')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Checkout
                    </Button>
                </div>

                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Choose Payment Method
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Select your preferred payment method to complete your purchase of ${formatPrice(total)}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Payment Methods */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl text-gray-900">Payment Options</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-6">

                                    {/* UPI Payment */}
                                    <div className="border-2 rounded-lg p-6 hover:bg-green-50 transition-colors">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <RadioGroupItem value="upi" id="upi" />
                                            <Label htmlFor="upi" className="flex items-center gap-4 cursor-pointer flex-1">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                    <Smartphone className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold">UPI Payment</div>
                                                    <div className="text-gray-600">Pay instantly with your UPI ID</div>
                                                </div>
                                                <Badge variant="secondary" className="ml-auto">Most Popular</Badge>
                                            </Label>
                                        </div>

                                        {paymentMethod === 'upi' && (
                                            <div className="ml-16 space-y-4">
                                                <div>
                                                    <Label htmlFor="upiId" className="text-sm text-gray-600 font-medium">
                                                        Enter your UPI ID
                                                    </Label>
                                                    <Input
                                                        id="upiId"
                                                        value={paymentInfo.upiId}
                                                        onChange={(e) => handlePaymentChange('upiId', e.target.value)}
                                                        placeholder="yourname@paytm / yourname@googlepay"
                                                        className="mt-2 h-12"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Credit/Debit Card */}
                                    <div className="border-2 rounded-lg p-6 hover:bg-green-50 transition-colors">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <RadioGroupItem value="card" id="card" />
                                            <Label htmlFor="card" className="flex items-center gap-4 cursor-pointer flex-1">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <CreditCard className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold">Credit/Debit Card</div>
                                                    <div className="text-gray-600">Visa, Mastercard, American Express</div>
                                                </div>
                                                <div className="ml-auto flex gap-2">
                                                    <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-medium">VISA</div>
                                                    <div className="w-10 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-medium">MC</div>
                                                </div>
                                            </Label>
                                        </div>

                                        {paymentMethod === 'card' && (
                                            <div className="ml-16 space-y-4">
                                                <div>
                                                    <Label className="text-sm text-gray-600 font-medium">Card Number</Label>
                                                    <Input
                                                        value={paymentInfo.cardNumber}
                                                        onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength={19}
                                                        className="mt-2 h-12"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-sm text-gray-600 font-medium">Expiry Date</Label>
                                                        <Input
                                                            value={paymentInfo.expiryDate}
                                                            onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                                                            placeholder="MM/YY"
                                                            maxLength={5}
                                                            className="mt-2 h-12"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm text-gray-600 font-medium">CVV</Label>
                                                        <Input
                                                            value={paymentInfo.cvv}
                                                            onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                                                            placeholder="123"
                                                            maxLength={4}
                                                            className="mt-2 h-12"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-gray-600 font-medium">Cardholder Name</Label>
                                                    <Input
                                                        value={paymentInfo.cardholderName}
                                                        onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                                                        placeholder="John Doe"
                                                        className="mt-2 h-12"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Digital Wallets */}
                                    <div className="border-2 rounded-lg p-6 hover:bg-green-50 transition-colors">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <RadioGroupItem value="wallet" id="wallet" />
                                            <Label htmlFor="wallet" className="flex items-center gap-4 cursor-pointer flex-1">
                                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <Wallet className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold">Digital Wallets</div>
                                                    <div className="text-gray-600">Paytm, PhonePe, Amazon Pay & more</div>
                                                </div>
                                            </Label>
                                        </div>

                                        {paymentMethod === 'wallet' && (
                                            <div className="ml-16 space-y-4">
                                                <div>
                                                    <Label className="text-sm text-gray-600 font-medium">Select Wallet</Label>
                                                    <select
                                                        value={paymentInfo.walletType}
                                                        onChange={(e) => handlePaymentChange('walletType', e.target.value)}
                                                        className="w-full h-12 mt-2 p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    >
                                                        <option value="">Choose your wallet</option>
                                                        <option value="paytm">Paytm Wallet</option>
                                                        <option value="phonepe">PhonePe</option>
                                                        <option value="amazonpay">Amazon Pay</option>
                                                        <option value="googlepay">Google Pay Wallet</option>
                                                        <option value="mobikwik">MobiKwik</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Net Banking */}
                                    <div className="border-2 rounded-lg p-6 hover:bg-green-50 transition-colors">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <RadioGroupItem value="netbanking" id="netbanking" />
                                            <Label htmlFor="netbanking" className="flex items-center gap-4 cursor-pointer flex-1">
                                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <Building className="h-6 w-6 text-orange-600" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold">Net Banking</div>
                                                    <div className="text-gray-600">Pay directly from your bank account</div>
                                                </div>
                                            </Label>
                                        </div>

                                        {paymentMethod === 'netbanking' && (
                                            <div className="ml-16 space-y-4">
                                                <div>
                                                    <Label className="text-sm text-gray-600 font-medium">Select Your Bank</Label>
                                                    <select
                                                        value={paymentInfo.bankName}
                                                        onChange={(e) => handlePaymentChange('bankName', e.target.value)}
                                                        className="w-full h-12 mt-2 p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    >
                                                        <option value="">Choose your bank</option>
                                                        <option value="sbi">State Bank of India</option>
                                                        <option value="hdfc">HDFC Bank</option>
                                                        <option value="icici">ICICI Bank</option>
                                                        <option value="axis">Axis Bank</option>
                                                        <option value="kotak">Kotak Mahindra Bank</option>
                                                        <option value="pnb">Punjab National Bank</option>
                                                        <option value="bob">Bank of Baroda</option>
                                                        <option value="canara">Canara Bank</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cash on Delivery */}
                                    <div className="border-2 rounded-lg p-6 hover:bg-green-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <RadioGroupItem value="cod" id="cod" />
                                            <Label htmlFor="cod" className="flex items-center gap-4 cursor-pointer flex-1">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                    <DollarSign className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold">Cash on Delivery</div>
                                                    <div className="text-gray-600">Pay when your order is delivered</div>
                                                </div>
                                                <Badge variant="outline" className="ml-auto">No additional charges</Badge>
                                            </Label>
                                        </div>
                                    </div>

                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-xl">Order Total</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Items ({items.length})</span>
                                        <span className="font-medium">${formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Delivery</span>
                                        <span className="text-green-600 font-medium">FREE</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Tax (8%)</span>
                                        <span className="font-medium">${formatPrice(tax)}</span>
                                    </div>
                                    <div className="border-t-2 border-gray-800 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold">Total</span>
                                            <span className="text-2xl font-bold text-green-600">${formatPrice(total)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                                    size="lg"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing Payment...
                                        </div>
                                    ) : (
                                        <>
                                            <Lock className="h-5 w-5 mr-3" />
                                            Pay ${formatPrice(total)}
                                        </>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                    <p className="text-gray-600 text-sm">100% Secure Payment</p>
                                </div>

                                <div className="text-center pt-4">
                                    <p className="text-xs text-gray-500">
                                        By placing this order, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}