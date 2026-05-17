'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

const SIZE_CLS = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };

export function StarRating({ value, onChange, size = 'md', ariaLabel }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  const display = hover || value;

  return (
    <div
      role={interactive ? 'radiogroup' : undefined}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-0.5 ${SIZE_CLS[size]}`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= display;
        const className = active ? 'text-amber-500' : 'text-gray-300';
        if (!interactive) {
          return (
            <span key={n} className={className} aria-hidden="true">
              ★
            </span>
          );
        }
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} estrellas`}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`${className} cursor-pointer transition-transform hover:scale-110`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
