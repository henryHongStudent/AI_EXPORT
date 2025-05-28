/**
 * Shared styles for components
 * This file exports common styles used across multiple components
 */

// Card styles
export const cardStyles = {
  base: "bg-card rounded-xl shadow-sm border p-6",
  statCard: "flex justify-between items-start",
  statValue: "text-3xl font-bold mt-2",
  statIcon: "p-3 rounded-full bg-primary/10 text-primary",
  statCaption: "mt-4 text-sm text-muted-foreground",
};

// Button styles 
export const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
};

// Layout styles
export const layoutStyles = {
  pageContainer: "min-h-screen flex flex-col bg-background text-foreground",
  contentContainer: "container mx-auto p-6",
  sectionContainer: "mb-8",
  sectionTitle: "text-2xl font-bold mb-6",
  sectionSubtitle: "text-xl font-semibold mb-6",
};

// Form styles
export const formStyles = {
  formGroup: "space-y-4",
  formLabel: "text-sm font-medium block mb-1",
  formInput: "w-full px-3 py-2 border rounded-md",
  formError: "text-red-500 text-sm mt-1",
  formSuccess: "text-green-500 text-sm mt-1",
  formIconWrapper: "relative",
  formIconInput: "w-full px-3 py-2 border rounded-md pl-10",
  formIcon: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground",
};

// Grid styles
export const gridStyles = {
  grid1: "grid grid-cols-1 gap-6",
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-6",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-6",
  grid4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
};

// Text styles
export const textStyles = {
  heading1: "text-2xl font-bold",
  heading2: "text-xl font-semibold", 
  heading3: "font-bold text-lg",
  muted: "text-sm text-muted-foreground",
  error: "text-red-500",
  success: "text-green-600 font-medium",
};

// Badge styles
export const badgeStyles = {
  primary: "bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full w-fit",
  success: "bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full",
  warning: "bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full",
  error: "bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full",
};

// Animation styles
export const animationStyles = {
  fadeIn: "transition-opacity duration-300",
  scaleIn: "transition-transform duration-300",
  pulse: "animate-pulse",
};

// Icon container styles
export const iconContainerStyles = {
  success: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto",
  info: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto",
  warning: "w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto",
  error: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto",
}; 