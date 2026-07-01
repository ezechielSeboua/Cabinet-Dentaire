// src/components/ui/Button.js

import React from 'react';

// A map of styles for different button variants
const variants = {
  primary: 'w-full bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'w-full bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  danger: 'w-full bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false }) {
  const baseStyle =
    'inline-block rounded px-6 py-2.5 text-xs font-medium uppercase leading-normal shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}