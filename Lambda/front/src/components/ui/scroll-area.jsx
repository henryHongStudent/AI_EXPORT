import React from "react";

export const ScrollArea = ({ children, className = "", ...props }) => {
  return (
    <div className={`overflow-auto ${className}`} {...props}>
      {children}
    </div>
  );
}; 