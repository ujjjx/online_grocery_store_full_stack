import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Leaf } from "lucide-react";

export function MainBody() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        if (searchQuery.trim()) {
            console.log("Searching for:", searchQuery);
            // Here you would typically implement the search functionality
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <Leaf className="h-16 w-16 text-green-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl mb-4 text-gray-900">
                        Fresh Groceries at Your Fingertips
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Discover a wide variety of fresh produce, pantry essentials, and specialty items.
                        Manage your grocery shopping with ease.
                    </p>
                </div>

                {/* Search Section */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-green-100">
                        <h2 className="text-2xl mb-4 text-center text-gray-800">
                            Find Your Favorite Products
                        </h2>
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    type="text"
                                    placeholder="Search for fruits, vegetables, dairy, and more..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="pl-10 h-12 border-green-200 focus:border-green-500 focus:ring-green-500"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="h-12 px-8 bg-green-600 hover:bg-green-700"
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-16 grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-green-100">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg mb-2">Easy Search</h3>
                        <p className="text-gray-600">Find any product quickly with our smart search feature</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-green-100">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Leaf className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg mb-2">Fresh Quality</h3>
                        <p className="text-gray-600">We ensure the highest quality of fresh produce</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-green-100">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingCart className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg mb-2">Easy Management</h3>
                        <p className="text-gray-600">Manage your grocery needs with our intuitive system</p>
                    </div>
                </div>
            </div>
        </main>
    );
}

function ShoppingCart({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
            />
        </svg>
    );
}