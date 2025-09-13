import { useState, useEffect } from "react";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
import { fetchCountries } from "../api/countryApi.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.js";
import { Separator } from "../components/ui/separator.js";
import { MapPin, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AsYouType, getExampleNumber, isValidNumber } from "libphonenumber-js";

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [countries, setCountries] = useState([]);
  const [countryCode, setCountryCode] = useState("+91");
  const [postalRegex, setPostalRegex] = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    country: "India",
    countryCode: "IN",
    phone: "",
    address: "",
    pin: "",
  });

  const [placeholders, setPlaceholders] = useState({
    phone: "+91 123456789",
    address: "Street, City",
    pin: "######",
  });

  const [pinError, setPinError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleShippingChange = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch countries
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countryList = await fetchCountries();
        setCountries(countryList);
      } catch {
        toast.error("Failed to load countries list");
      }
    };
    loadCountries();
  }, []);

  // Update placeholders and reset phone/pin when country changes
  useEffect(() => {
    const country = countries.find(
      (c) => c.cca2 === shippingInfo.countryCode
    );
    if (!country) return;

    setCountryCode(country.phoneCode);

    // Phone placeholder
    let phonePlaceholder = country.phoneCode + " 123456789";
    try {
      const example = getExampleNumber(country.cca2);
      if (example) phonePlaceholder = new AsYouType(country.cca2).input(example.number);
    } catch {}

    const pinPlaceholder = country.postalFormat || "";

    setPlaceholders((prev) => ({
      ...prev,
      phone: phonePlaceholder,
      pin: pinPlaceholder,
    }));

    setPostalRegex(country.postalRegex || "");

    // Reset fields
    handleShippingChange("phone", "");
    handleShippingChange("pin", "");

    // Clear errors
    setPhoneError("");
    setPinError("");
  }, [shippingInfo.countryCode, countries]);

  const generateRegexFromFormat = (format) => {
    const regexStr =
      "^" +
      format
        .split("")
        .map((c) => {
          if (c === "@") return "[A-Za-z]";
          if (c === "#") return "\\d";
          return c.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        })
        .join("") +
      "$";
    return new RegExp(regexStr, "i");
  };

  const handlePinChange = (input) => {
    handleShippingChange("pin", input);

    if (!placeholders.pin) return; // skip validation if country has no PIN

    const expectedLength = placeholders.pin.length;
    if (input.length === expectedLength) {
      const regex = postalRegex
        ? new RegExp(postalRegex, "i")
        : generateRegexFromFormat(placeholders.pin);
      setPinError(regex.test(input) ? "" : "Invalid postal code format");
    } else {
      setPinError("");
    }
  };

  const handlePlaceOrder = async () => {
    if (
      !shippingInfo.fullName ||
      !shippingInfo.email ||
      !shippingInfo.address ||
      (placeholders.pin && !shippingInfo.pin)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (pinError) {
      toast.error("Please enter a valid postal code");
      return;
    }
    if (phoneError) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOrderPlaced(true);
      clearCart();
      toast.success("Order placed successfully!");
      setTimeout(() => navigate("/"), 2500);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed</h1>
          <p className="text-gray-600">Your items will be delivered soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="text-center mb-12">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
          <Lock className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-xl font-semibold">Complete Your Order</h1>
        <p className="text-gray-600 mt-2">
          Fill in your shipping details and review your order. We’ll get your
          items delivered safely to your doorstep.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-green-600" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={shippingInfo.fullName}
                onChange={(e) =>
                  handleShippingChange("fullName", e.target.value)
                }
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={shippingInfo.email}
                onChange={(e) =>
                  handleShippingChange("email", e.target.value)
                }
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label>Country</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={shippingInfo.countryCode}
                onChange={(e) =>
                  handleShippingChange("countryCode", e.target.value)
                }
              >
                {countries.map((c) => (
                  <option key={c.cca2} value={c.cca2}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={shippingInfo.phone}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith(countryCode))
                    val = countryCode + " " + val.replace(/^\+?\d*\s*/, "");
                  const formatted = new AsYouType().input(val);
                  handleShippingChange("phone", formatted);
                  setPhoneError(
                    isValidNumber(formatted, shippingInfo.countryCode)
                      ? ""
                      : "Invalid phone number format"
                  );
                }}
                placeholder={placeholders.phone}
                autoComplete="off"
                className={
                  phoneError ? "border-red-500 focus:ring-red-500" : ""
                }
              />
              {phoneError && (
                <div className="mt-1 text-sm text-red-600">{phoneError}</div>
              )}
            </div>

            <div>
              <Label>Street Address</Label>
              <Input
                value={shippingInfo.address}
                onChange={(e) =>
                  handleShippingChange("address", e.target.value)
                }
                placeholder={placeholders.address}
              />
            </div>

            {/* Conditionally render PIN/ZIP field */}
            {placeholders.pin && (
              <div>
                <Label>PIN / ZIP Code</Label>
                <Input
                  value={shippingInfo.pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder={placeholders.pin}
                  autoComplete="off"
                  className={
                    pinError ? "border-red-500 focus:ring-red-500" : ""
                  }
                />
                {pinError && (
                  <div className="mt-1 text-sm">
                    <p className="text-red-600">{pinError}</p>
                    <p className="text-gray-500">
                      Expected format: {placeholders.pin}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-4"
            >
              {loading ? "Processing..." : `Place Order - $${total.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
