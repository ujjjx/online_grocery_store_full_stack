import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Find Your Favorite Groceries
        </h1>
        <p className="text-lg text-gray-600">
          Search through thousands of fresh products and everyday essentials
        </p>
      </div>
      
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Search for fruits, vegetables, dairy, and more..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pr-12 h-14 text-lg border-2 border-green-200 focus:border-green-500 focus:ring-green-500"
        />
        <Button
          onClick={handleSearch}
          className="absolute right-2 h-10 bg-green-600 hover:bg-green-700 text-white"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}