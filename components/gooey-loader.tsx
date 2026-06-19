"use client";

import type { CSSProperties, HTMLAttributes } from "react";

// Adapted from 21st.dev "loader-10" (GooeyLoader by ravikatiyar), re-themed to
// Toolvault's design tokens (green accent) and de-shadcn'd (no `cn`).
export interface GooeyLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Primary goo color. Defaults to the accent token. */
  primaryColor?: string;
  /** Secondary goo color. Defaults to the strong accent token. */
  secondaryColor?: string;
  /** Bottom border color. Defaults to the line token. */
  borderColor?: string;
}

export function GooeyLoader({
  className = "",
  primaryColor,
  secondaryColor,
  borderColor,
  ...props
}: GooeyLoaderProps) {
  const style = {
    "--gooey-primary-color": primaryColor || "var(--color-accent)",
    "--gooey-secondary-color": secondaryColor || "var(--color-accent-strong)",
    "--gooey-border-color": borderColor || "var(--color-line)",
  } as CSSProperties;

  return (
    <div
      className={`relative flex items-center justify-center text-sm ${className}`}
      style={style}
      role="status"
      aria-label="Loading"
      {...props}
    >
      {/* SVG filter that fuses the two blobs into a gooey blob */}
      <svg className="absolute h-0 w-0">
        <defs>
          <filter id="gooey-loader-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation={12} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 48 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <style>
        {`
          .gooey-loader {
            width: 12em;
            height: 3em;
            position: relative;
            overflow: hidden;
            border-bottom: 8px solid var(--gooey-border-color);
            filter: url(#gooey-loader-filter);
          }
          .gooey-loader::before,
          .gooey-loader::after {
            content: '';
            position: absolute;
            border-radius: 50%;
          }
          .gooey-loader::before {
            width: 22em;
            height: 18em;
            background-color: var(--gooey-primary-color);
            left: -2em;
            bottom: -18em;
            animation: gooey-loader-wee1 2s linear infinite;
          }
          .gooey-loader::after {
            width: 16em;
            height: 12em;
            background-color: var(--gooey-secondary-color);
            left: -4em;
            bottom: -12em;
            animation: gooey-loader-wee2 2s linear infinite 0.75s;
          }
          @keyframes gooey-loader-wee1 {
            0% { transform: translateX(-10em) rotate(0deg); }
            100% { transform: translateX(7em) rotate(180deg); }
          }
          @keyframes gooey-loader-wee2 {
            0% { transform: translateX(-8em) rotate(0deg); }
            100% { transform: translateX(8em) rotate(180deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .gooey-loader::before,
            .gooey-loader::after { animation-duration: 6s; }
          }
        `}
      </style>

      <div className="gooey-loader" />
    </div>
  );
}
