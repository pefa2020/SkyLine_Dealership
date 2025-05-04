import React, { useState } from "react";
import "../styles/FilterBar.css";

function FilterBar({ setSearchQuery }) {
  const [inputValue, setInputValue] = useState("");
  const [modelValue, setModelValue] = useState("");  // State to manage the model dropdown
  const [yearValue, setYearValue] = useState("");    // State to manage the year dropdown

  const handleSearchClick = () => {
    setSearchQuery(inputValue);
    setModelValue("");  // Reset the model dropdown after search
    setYearValue("");   // Reset the year dropdown after search
  };

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const handleModelChange = (value) => {
    setInputValue(value);
    setModelValue(value);  // Set modelValue when model changes
  };

  const handleYearChange = (value) => {
    setInputValue(value);
    setYearValue(value);  // Set yearValue when year changes
  };

  const handleSortChange = (order) => {
    setInputValue(order);  // Update inputValue with 'desc' or 'asc'
  };

  return (
    <div className="filter-bar">
      {/* First row */}
      <div className="filter-row">
        {/* Text Input for Car Name */}
        <input
          type="text"
          name="carName"
          className="filter-input"
          placeholder="Car Name"
          onChange={(e) => handleInputChange(e.target.value)}
          value={inputValue}
          id="CarNameFilter"
        />
      </div>

      {/* Second row */}
      <div className="filter-row">
        {/* Model Dropdown */}
        <select 
          name="model" 
          className="filter-select" 
          value={modelValue}  // Control the select element with modelValue
          onChange={(e) => handleModelChange(e.target.value)}
        >
          <option value="">Model</option>
          <option value="Audi">Audi</option>
          <option value="BMW">BMW</option>
          <option value="Chevrolet">Chevrolet</option>
          <option value="Ford">Ford</option>
          <option value="GMC">GMC</option>
          <option value="Honda">Honda</option>
          <option value="Infiniti">Infiniti</option>
          <option value="Jaguar">Jaguar</option>
          <option value="Jeep">Jeep</option>
          <option value="Nissan">Nissan</option>
          <option value="Porsche">Porsche</option>
        </select>

        {/* Year Dropdown */}
        <select 
          name="year" 
          className="filter-select" 
          value={yearValue}  // Control the select element with yearValue
          onChange={(e) => handleYearChange(e.target.value)}
        >
          <option value="">Year</option>
          {[...Array(23)].map((_, index) => (
            <option key={index} value={2024 - index}>{2024 - index}</option>
          ))}
        </select>

        {/* Sorting Dropdown */}
        <select 
          name="price" 
          className="filter-select" 
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="desc">High to Low</option>
          <option value="asc">Low to High</option>
        </select>

        {/* Search Button */}
        <button className="search-button" onClick={handleSearchClick} id="filterBarSearchButton">
          Search
        </button>
      </div>
    </div>
  );
}

export default FilterBar;
