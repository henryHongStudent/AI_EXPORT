import React from "react";
import Navbar from "../Navbar";
import { layoutStyles } from "../../styles";

/**
 * PageLayout - Reusable layout component for all pages
 * @param {ReactNode} children - Page content
 * @param {string} username - Current username for navbar
 * @param {function} onLogout - Logout handler function
 * @param {boolean} darkMode - Current theme mode
 * @param {function} toggleDarkMode - Theme toggle function
 * @param {boolean} fullWidth - Whether to use full width container
 */
const PageLayout = ({ 
  children, 
  username, 
  onLogout, 
  darkMode, 
  toggleDarkMode,
  fullWidth = false 
}) => {
  return (
    <div className={layoutStyles.pageContainer}>
      <Navbar 
        username={username} 
        onLogout={onLogout} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      <div className={fullWidth ? "flex-grow" : layoutStyles.contentContainer}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout; 