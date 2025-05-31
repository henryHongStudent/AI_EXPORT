import React from "react";

export const Label = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`label ${className}`}
      {...props}
    />
  );
}); 