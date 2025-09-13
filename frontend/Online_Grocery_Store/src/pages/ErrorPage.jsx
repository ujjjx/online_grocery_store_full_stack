import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/button";

export default function ErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <div className="text-9xl font-bold text-green-100 mb-4">404</div>
                    <div className="text-6xl mb-4">🛒</div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Oops! Page Not Found
                    </h1>
                    <p className="text-gray-600 mb-2">
                        It looks like the page you're looking for doesn't exist.
                    </p>
                    <p className="text-gray-600">
                        The page might have been moved, deleted, or you entered the wrong URL.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/">
                            <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                                <Home className="h-4 w-4 mr-2" />
                                Go to Home
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                    </div>

                    {/* Quick Links */}
                    <div className="pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-4">Or try these popular pages:</p>
                        <div className="space-y-2">
                            <Link
                                to="/products"
                                className="flex items-center justify-center text-green-600 hover:text-green-700 transition-colors"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Browse Products
                            </Link>
                            <Link
                                to="/about"
                                className="flex items-center justify-center text-green-600 hover:text-green-700 transition-colors"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                About Us
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-12 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>Need help?</strong> Contact our support team at{' '}
                        <a
                            href="mailto:support@groceryapp.com"
                            className="text-green-600 hover:text-green-700"
                        >
                            support@groceryapp.com
                        </a>{' '}
                        or call us at{' '}
                        <a
                            href="tel:5551234567"
                            className="text-green-600 hover:text-green-700"
                        >
                            (555) 123-4567
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}