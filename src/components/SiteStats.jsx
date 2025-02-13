import React, { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SiteStats = ({ setSelectedLayer, setCoordinates, setSelectedDateInParent }) => {
  const [selectedOption, setSelectedOption] = useState("Select data"); // Default layer
  const [selectedDate, setSelectedDate] = useState(new Date()); // Date picker state
  const [lat, setLat] = useState(""); // Latitude input
  const [lon, setLon] = useState(""); // Longitude input
  // Default dates for each dataset
  const defaultDates = {
    "Static JSON + STACOV File": new Date("2024-04-15"),
    "Over All Site Info": null, // No date filter shown for this option
    "Over All Vs MYCS2": new Date("2010-01-02"),
    "OPUSNET Data": new Date("2018-10-28"),
  };
  // Handle dropdown selection
  const handleSelect = (option) => {
    setSelectedOption(option); // Update local state
    setSelectedLayer(option); // Pass selected option to parent
    // Update the date if the option has a default date
    if (defaultDates[option]) {
      setSelectedDate(defaultDates[option]);
      setSelectedDateInParent(defaultDates[option]); // Update parent state
    }
  };

  // Handle coordinate search
  const handleCoordinateSearch = () => {
    if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
      setCoordinates({ lat: parseFloat(lat), lon: parseFloat(lon) }); // Pass coordinates to parent
    } else {
      alert("Please enter valid numeric values for latitude and longitude.");
    }
  };

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date); // Update local state
    setSelectedDateInParent(date); // Pass selected date to parent
  };
  const showDateFilter = selectedOption !== "Select data" && selectedOption !== "Over All Site Info";
  return (
    <div className="site-stats p-4 space-y-6">
      <h3 className="text-lg font-bold">Choose Dataset</h3>
      {/* Dropdown Menu */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            {selectedOption}
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" />
          </MenuButton>
        </div>
        <MenuItems className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          {["Static JSON + STACOV File", "Over All Site Info", "Over All Vs MYCS2", "OPUSNET Data"].map((option) => (
            <MenuItem key={option}>
              {({ active }) => (
                <a
                  href="#"
                  onClick={() => handleSelect(option)}
                  className={`block px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
                >
                  {option}
                </a>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>

      {/* Date Picker */}
      {showDateFilter && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            className="block w-full p-2 border rounded"
            dateFormat="yyyy/MM/dd"
          />
        </div>
      )}
      {/* Coordinate Search */}
      <div>
        <h3 className="text-lg font-bold">Coordinate Search</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Latitude:</label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Enter Latitude"
              className="block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Longitude:</label>
            <input
              type="number"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="Enter Longitude"
              className="block w-full p-2 border rounded"
            />
          </div>
          <button
            type="button"
            onClick={handleCoordinateSearch}
            className="w-full p-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white rounded-md"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteStats;
