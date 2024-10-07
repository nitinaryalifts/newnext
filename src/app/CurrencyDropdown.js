import React from "react";
import Select from "react-select";

const currencies = [
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'ILS', label: '₪ ILS' },
  { value: 'CAD', label: '$ CAD' },
  { value: 'ZAR', label: 'R ZAR' }
];
 // Add more currencies as needed

const CurrencyDropdown = ({ selectedCurrency, onCurrencyChange }) => {
  return (
    <Select
      value={currencies.find((option) => option.value === selectedCurrency)}
      onChange={onCurrencyChange}
      options={currencies}
      isClearable={false}
      isSearchable={false}
      className="currency-dropdown"
    />
  );
};
 
export default CurrencyDropdown;
