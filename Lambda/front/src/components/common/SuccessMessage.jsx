import React from "react";
import { Check } from "lucide-react";
import { iconContainerStyles, textStyles } from "../../styles";

/**
 * SuccessMessage - Reusable success message component
 * @param {string} title - Success message title
 * @param {string} message - Success message body
 * @param {string} buttonText - Text for the action button
 * @param {function} onAction - Function to call when button is clicked
 */
const SuccessMessage = ({ 
  title = "Success!", 
  message = "Your action was completed successfully.", 
  buttonText = "Continue",
  onAction 
}) => {
  return (
    <div className="text-center max-w-md mx-auto py-10">
      <div className={`${iconContainerStyles.success} mb-6`}>
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h2 className={`${textStyles.heading1} mb-2`}>{title}</h2>
      <p className="text-muted-foreground mb-6">
        {message}
      </p>
      <Button onClick={onAction}>
        {buttonText}
      </Button>
    </div>
  );
};

export default SuccessMessage; 