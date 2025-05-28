import React, { useState } from "react";
import { CreditCard, ArrowLeft, Shield } from "lucide-react";
import { formStyles, cardStyles, textStyles } from "../../styles";

/**
 * PaymentForm - Reusable credit card payment form
 * @param {number} amount - The payment amount
 * @param {function} onBack - Function to go back
 * @param {function} onComplete - Function to call on successful payment
 */
const PaymentForm = ({ amount, onBack, onComplete }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete();
  };
  
  const nzd = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD'
  });
  
  return (
    <div className="w-full max-w-md mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center text-sm mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to plans
      </button>
      
      <div className={cardStyles.base + " mb-6"}>
        <h3 className={textStyles.heading3 + " mb-4"}>Payment Details</h3>
        
        <div className="flex justify-between items-center mb-4 py-3 border-b">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-bold">{nzd.format(amount)}</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGroup}>
            <div>
              <label className={formStyles.formLabel}>
                Card Number
              </label>
              <div className={formStyles.formIconWrapper}>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className={formStyles.formIconInput}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
                <CreditCard className={formStyles.formIcon} />
              </div>
            </div>
            
            <div>
              <label className={formStyles.formLabel}>
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className={formStyles.formInput}
                placeholder="Jane Smith"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={formStyles.formLabel}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  className={formStyles.formInput}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <label className={formStyles.formLabel}>
                  Security Code
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  className={formStyles.formInput}
                  placeholder="CVV"
                  maxLength={3}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 w-full h-10 px-4 py-2"
            >
              Pay {nzd.format(amount)}
            </button>
            
            <div className="text-xs text-center text-muted-foreground flex items-center justify-center mt-4">
              <Shield size={12} className="mr-1" /> 
              Secured payment process. Your card details are protected.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm; 