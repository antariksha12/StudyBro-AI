import React from "react";

/**
 * Base glassmorphism card used throughout the app.
 * `hover` adds a lift + glow interaction for clickable cards.
 */
export default function GlassCard({ children, className = "", hover = false, as: Tag = "div", ...rest }) {
  return (
    <Tag className={`glass ${hover ? "glass-hover" : ""} p-6 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
