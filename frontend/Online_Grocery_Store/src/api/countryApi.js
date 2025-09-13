import axios from "axios";
import { toast } from "sonner";

// Fetch all countries with required fields
export const fetchCountries = async () => {
    try {
        const res = await axios.get(
            "https://restcountries.com/v3.1/all?fields=name,idd,postalCode,cca2"
        );

        const countryList = res.data.map((c) => {
            const root = c.idd?.root || "";
            const suffix = c.idd?.suffixes?.[0] || "";
            return {
                name: c.name.common,
                cca2: c.cca2,
                phoneCode: root + suffix,
                postalFormat: c.postalCode?.format || "",
                postalRegex: c.postalCode?.regex || "",
            };
        });

        // Sort alphabetically by name
        return countryList.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        toast.error("Failed to load countries list");
        console.error("fetchCountries error:", error);
        return [];
    }
};
