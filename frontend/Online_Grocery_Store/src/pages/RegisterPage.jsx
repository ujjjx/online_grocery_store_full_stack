import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Eye, EyeOff, ShoppingCart, Check } from "lucide-react";
import { useAuth } from "./AuthContext.jsx";
import { toast } from 'sonner';
import { fetchCountries } from "../api/countryApi"; // make sure you have this
import { AsYouType, getExampleNumber, isValidNumber } from "libphonenumber-js";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "IN",
    contact: "", // Changed from phone to contact
    address: "",
    pin: "",
    agreeToTerms: false,
  });

  const [countries, setCountries] = useState([]);
  const [placeholders, setPlaceholders] = useState({
    contact: "+91 1234567890", // Updated placeholder to reflect contact
    pin: "######",
    address: "Street, City",
  });

  const [phoneError, setPhoneError] = useState(""); // Updated error state for contact
  const [pinError, setPinError] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch countries
  useEffect(() => {
    const loadCountries = async () => {
      const countryList = await fetchCountries();
      setCountries(countryList);
    };
    loadCountries();
  }, []);

  // Update placeholders when country changes
  useEffect(() => {
    const country = countries.find((c) => c.cca2 === formData.countryCode);
    if (!country) return;

    // Contact placeholder
    let contactPlaceholder = country.phoneCode + " 1234567890";
    try {
      const example = getExampleNumber(country.cca2);
      if (example)
        contactPlaceholder = new AsYouType(country.cca2).input(example.number);
    } catch {}

    const pinPlaceholder = country.postalFormat || "";

    setPlaceholders({
      contact: contactPlaceholder, // Updated to reflect contact placeholder
      pin: pinPlaceholder,
      address: "Street, City",
    });

    // Reset contact and pin fields
    setFormData((prev) => ({ ...prev, contact: "", pin: "" }));
    setPhoneError(""); // Reset contact error
    setPinError("");
  }, [formData.countryCode, countries]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Contact input with automatic country code
  const handleContactChange = (e) => {
    const country = countries.find((c) => c.cca2 === formData.countryCode);
    if (!country) return;

    let inputVal = e.target.value.replace(/\s+/g, "");
    if (!inputVal.startsWith(country.phoneCode)) {
      inputVal = country.phoneCode + inputVal.replace(/^\+?\d*/, "");
    }

    const formatted = new AsYouType(country.cca2).input(inputVal);
    setFormData((prev) => ({ ...prev, contact: formatted }));

    if (isValidNumber(formatted, country.cca2)) {
      setPhoneError(""); // Reset error if valid
    } else {
      setPhoneError("Invalid contact number for selected country");
    }
  };

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

  const handlePinChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, pin: value }));

    const expectedLength = placeholders.pin.length;
    if (value.length === expectedLength && placeholders.pin) {
      const regex = generateRegexFromFormat(placeholders.pin);
      setPinError(regex.test(value) ? "" : "Invalid postal code format");
    } else {
      setPinError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.address.trim())
      newErrors.address = "Street address is required";
    if (placeholders.pin && !formData.pin) newErrors.pin = "PIN is required";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      // Get country details
      const country = countries.find((c) => c.cca2 === formData.countryCode);
      const countryName = country ? country.name : formData.countryCode;
      // ✅ Build address (skip pin if not required or empty)
      let addressParts = [formData.address];
      if (formData.pin && placeholders.pin) {
        addressParts.push(formData.pin);
      }
      addressParts.push(countryName);
      // addressParts.push(formData.)
      const address = addressParts.join(", ");
      const success = await register(
        fullName,
        formData.email,
        formData.password,
        address,
        formData.contact // Updated to use contact instead of phone
      );
      if (success) {
        console.log("Registration successful!");
        navigate("/");
      } else {
        console.log("Registration failed!");
      }
    } catch (err) {
      toast("Registration failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = ["", "red", "orange", "yellow", "lime", "green"];
    return { strength, label: labels[strength], color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength();
  const selectedCountry = countries.find(
    (c) => c.cca2 === formData.countryCode
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center mb-6">
            <ShoppingCart className="h-12 w-12 text-green-600 mr-3" />
            <span className="text-2xl font-bold text-green-600">
              GroceryApp
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="mt-2 text-gray-600">
            Join GroceryApp and start shopping today
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Country Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {countries.map((c) => (
                  <option key={c.cca2} value={c.cca2}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <Input
                value={formData.contact}  // Changed from phone to contact
                onChange={handleContactChange}  // Updated function
                placeholder={placeholders.contact}  // Updated placeholder
              />
              {phoneError && (
                <p className="text-red-600 text-sm">{phoneError}</p>  // Updated error handling
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder={placeholders.address}
              />
              {errors.address && (
                <p className="text-red-600 text-sm">{errors.address}</p>
              )}
            </div>

            {/* PIN code */}
            {placeholders.pin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN / ZIP Code
                </label>
                <Input
                  value={formData.pin}
                  onChange={handlePinChange}
                  placeholder={placeholders.pin}
                />
                {pinError && <p className="text-red-600 text-sm">{pinError}</p>}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="text-sm mt-1">
                  Password strength:{" "}
                  <span className={`text-${passwordStrength.color}-600`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <div className="text-green-600 text-sm flex items-center">
                    <Check className="h-4 w-4 mr-1" /> Passwords match
                  </div>
                )}
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                I agree to the{" "}
                <Link to="/terms" className="text-green-600">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-green-600">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-600 text-sm">{errors.agreeToTerms}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-sm text-center text-gray-600 mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
