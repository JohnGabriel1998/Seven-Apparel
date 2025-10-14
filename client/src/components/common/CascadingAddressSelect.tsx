import React, { useState, useEffect } from "react";
import {
  getAllRegions,
  getProvincesByRegion,
  getCitiesByProvince,
  getBarangaysByCity,
  type Region,
  type Province,
  type City,
  type Barangay,
} from "../../utils/philippineLocations";

interface CascadingAddressSelectProps {
  onAddressChange: (address: {
    region: string;
    regionCode: string;
    province: string;
    city: string;
    barangay: string;
    zipCode: string;
  }) => void;
  initialValues?: {
    region?: string;
    province?: string;
    city?: string;
    barangay?: string;
  };
  className?: string;
}

export const CascadingAddressSelect: React.FC<CascadingAddressSelectProps> = ({
  onAddressChange,
  initialValues,
  className = "",
}) => {
  const [regions] = useState<Region[]>(getAllRegions());
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  const [selectedRegion, setSelectedRegion] = useState<string>(
    initialValues?.region || ""
  );
  const [selectedProvince, setSelectedProvince] = useState<string>(
    initialValues?.province || ""
  );
  const [selectedCity, setSelectedCity] = useState<string>(
    initialValues?.city || ""
  );
  const [selectedBarangay, setSelectedBarangay] = useState<string>(
    initialValues?.barangay || ""
  );

  // Handle region selection
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionCode = e.target.value;
    setSelectedRegion(regionCode);

    // Reset dependent fields
    setSelectedProvince("");
    setSelectedCity("");
    setSelectedBarangay("");
    setCities([]);
    setBarangays([]);

    // Load provinces for selected region
    if (regionCode) {
      const regionProvinces = getProvincesByRegion(regionCode);
      setProvinces(regionProvinces);
    } else {
      setProvinces([]);
    }
  };

  // Handle province selection
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);

    // Reset dependent fields
    setSelectedCity("");
    setSelectedBarangay("");
    setBarangays([]);

    // Load cities for selected province
    if (provinceName) {
      const provinceCities = getCitiesByProvince(provinceName);
      setCities(provinceCities);
    } else {
      setCities([]);
    }
  };

  // Handle city selection
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);

    // Reset barangay
    setSelectedBarangay("");

    // Load barangays for selected city
    if (cityName) {
      const cityBarangays = getBarangaysByCity(cityName);
      setBarangays(cityBarangays);
    } else {
      setBarangays([]);
    }
  };

  // Handle barangay selection
  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const barangayName = e.target.value;
    setSelectedBarangay(barangayName);
  };

  // Notify parent component of address changes
  useEffect(() => {
    if (
      selectedRegion &&
      selectedProvince &&
      selectedCity &&
      selectedBarangay
    ) {
      const region = regions.find((r) => r.code === selectedRegion);
      const city = cities.find((c) => c.name === selectedCity);
      const barangay = barangays.find((b) => b.name === selectedBarangay);

      if (region && city && barangay) {
        onAddressChange({
          region: region.name,
          regionCode: region.code,
          province: selectedProvince,
          city: selectedCity,
          barangay: selectedBarangay,
          zipCode: barangay.zipCode || city.zipCode || "",
        });
      }
    }
  }, [selectedRegion, selectedProvince, selectedCity, selectedBarangay]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Region Selection */}
      <div>
        <label
          htmlFor="region"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Region <span className="text-red-500">*</span>
        </label>
        <select
          id="region"
          value={selectedRegion}
          onChange={handleRegionChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-colors duration-200"
          required
        >
          <option value="">-- Select Region --</option>
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
        {selectedRegion && provinces.length > 0 && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            ✓ {provinces.length} province{provinces.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        )}
      </div>

      {/* Province Selection */}
      <div>
        <label
          htmlFor="province"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Province <span className="text-red-500">*</span>
        </label>
        <select
          id="province"
          value={selectedProvince}
          onChange={handleProvinceChange}
          disabled={!selectedRegion || provinces.length === 0}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                   transition-colors duration-200"
          required
        >
          <option value="">
            {selectedRegion
              ? "-- Select Province --"
              : "-- Select Region First --"}
          </option>
          {provinces.map((province) => (
            <option key={province.name} value={province.name}>
              {province.name}
            </option>
          ))}
        </select>
        {selectedProvince && cities.length > 0 && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            ✓ {cities.length}{" "}
            {cities.length === 1
              ? "city/municipality"
              : "cities/municipalities"}{" "}
            available
          </p>
        )}
      </div>

      {/* City/Municipality Selection */}
      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          City / Municipality <span className="text-red-500">*</span>
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedProvince || cities.length === 0}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                   transition-colors duration-200"
          required
        >
          <option value="">
            {selectedProvince
              ? "-- Select City/Municipality --"
              : "-- Select Province First --"}
          </option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name} ({city.type})
            </option>
          ))}
        </select>
        {selectedCity && barangays.length > 0 && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            ✓ {barangays.length} barangay{barangays.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        )}
      </div>

      {/* Barangay Selection */}
      <div>
        <label
          htmlFor="barangay"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Barangay / District <span className="text-red-500">*</span>
        </label>
        <select
          id="barangay"
          value={selectedBarangay}
          onChange={handleBarangayChange}
          disabled={!selectedCity || barangays.length === 0}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                   transition-colors duration-200"
          required
        >
          <option value="">
            {selectedCity ? "-- Select Barangay --" : "-- Select City First --"}
          </option>
          {barangays.map((barangay) => (
            <option key={barangay.name} value={barangay.name}>
              {barangay.name} {barangay.zipCode && `(${barangay.zipCode})`}
            </option>
          ))}
        </select>
        {selectedBarangay && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Complete address selected
          </p>
        )}
      </div>

      {/* Address Summary (when all fields selected) */}
      {selectedRegion &&
        selectedProvince &&
        selectedCity &&
        selectedBarangay && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              📍 Complete Address:
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Barangay {selectedBarangay}, {selectedCity}, {selectedProvince}
              <br />
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {regions.find((r) => r.code === selectedRegion)?.name}
                {barangays.find((b) => b.name === selectedBarangay)?.zipCode &&
                  ` • ZIP: ${
                    barangays.find((b) => b.name === selectedBarangay)?.zipCode
                  }`}
              </span>
            </p>
          </div>
        )}
    </div>
  );
};

export default CascadingAddressSelect;
