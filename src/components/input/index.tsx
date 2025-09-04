import React from 'react';

export default function InputNumber(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="number"
      onKeyDown={(e) => {
        // Cho phép các phím số, backspace, delete, arrow
        if (
          !/[0-9]/.test(e.key) &&
          e.key !== 'Backspace' &&
          e.key !== 'Delete' &&
          e.key !== 'ArrowLeft' &&
          e.key !== 'ArrowRight' &&
          e.key !== '-' &&
          e.key !== '.'
        ) {
          e.preventDefault();
        }
      }}
    />
  );
}
