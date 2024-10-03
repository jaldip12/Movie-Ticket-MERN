import React from 'react';

export const Spinner = ({ size = 6, color = 'border-yellow-500' }) => {
  return (
    <div className={`inline-block w-${size} h-${size} border-4 border-t-transparent border-solid rounded-full animate-spin ${color}`}></div>
  );
};
