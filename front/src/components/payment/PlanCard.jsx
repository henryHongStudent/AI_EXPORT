import React from "react";
import { Gift } from "lucide-react";
import { textStyles } from "../../styles";

/**
 * PlanCard - Reusable component for subscription plan options
 * @param {number} amount - Plan amount
 * @param {number} bonus - Bonus amount (if any)
 * @param {boolean} popular - Whether this is the most popular plan
 * @param {function} onSelect - Function to call when plan is selected
 */
const PlanCard = ({ amount, bonus, popular, onSelect }) => {
  const nzd = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD'
  });
  
  return (
    <div 
      className={`bg-card border rounded-xl p-6 transition-all cursor-pointer hover:shadow-md 
        ${popular ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
      onClick={() => onSelect(amount)}
    >
      {popular && (
        <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full w-fit -mt-10 mb-4">
          MOST POPULAR
        </div>
      )}
      
      <h3 className={`${textStyles.heading3} mb-2`}>{nzd.format(amount)}</h3>
      
      <div className="text-sm text-muted-foreground mb-4">
        {bonus > 0 ? (
          <div className="flex items-center gap-1 text-green-600 font-medium">
            <Gift size={14} />
            <span>+{nzd.format(bonus)} bonus</span>
          </div>
        ) : (
          <div>&nbsp;</div>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        <span className="font-medium text-foreground">
          {Math.floor((amount + bonus) / 10) * 100} files
        </span> can be processed
      </div>
      
      <button 
        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full h-10 px-4 py-2 ${
          popular 
            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        Select
      </button>
    </div>
  );
};

export default PlanCard; 