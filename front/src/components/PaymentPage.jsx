import React, { useState } from "react";
import { 
  CreditCard, 
  DollarSign, 
  File, 
  ArrowLeft, 
  Check, 
  Gift, 
  Shield 
} from "lucide-react";
import { Button } from "./ui/button";

const PaymentCard = ({ amount, bonus, popular, onSelect }) => {
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
      
      <h3 className="font-bold text-xl mb-2">{nzd.format(amount)}</h3>
      
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
      
      <Button 
        className="w-full"
        variant={popular ? "default" : "outline"}
      >
        Select
      </Button>
    </div>
  );
};

const CreditCardForm = ({ amount, onBack, onComplete }) => {
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
      
      <div className="bg-card border rounded-xl p-6 mb-6">
        <h3 className="font-bold text-xl mb-4">Payment Details</h3>
        
        <div className="flex justify-between items-center mb-4 py-3 border-b">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-bold">{nzd.format(amount)}</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md pl-10"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Jane Smith"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Security Code
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="CVV"
                  maxLength={3}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Pay {nzd.format(amount)}
            </Button>
            
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

const SuccessMessage = ({ onClose }) => {
  return (
    <div className="text-center max-w-md mx-auto py-10">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
      <p className="text-muted-foreground mb-6">
        Your credits have been added to your account.
      </p>
      <Button onClick={onClose}>
        Back to Dashboard
      </Button>
    </div>
  );
};

const PaymentPage = () => {
  const [currentCredits, setCurrentCredits] = useState(25); // 예시 크레딧
  const [view, setView] = useState("overview"); // overview, checkout, success
  const [selectedAmount, setSelectedAmount] = useState(null);
  
  const remainingFiles = currentCredits * 10;
  
  const handleSelectPlan = (amount) => {
    setSelectedAmount(amount);
    setView("checkout");
  };
  
  const handlePaymentComplete = () => {
    // 실제로는 API 호출이 있겠지만, 여기서는 간단히 처리
    let bonusAmount = 0;
    if (selectedAmount === 50) bonusAmount = 5;
    if (selectedAmount === 100) bonusAmount = 10;
    
    const newCredits = currentCredits + selectedAmount + bonusAmount;
    setCurrentCredits(newCredits);
    setView("success");
  };
  
  const resetView = () => {
    setView("overview");
    setSelectedAmount(null);
  };
  
  return (
    <div className="container mx-auto p-6">
      {view === "overview" && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-6">Credits & Billing</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* 현재 크레딧 표시 */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground text-sm">Current Credits</p>
                    <h3 className="text-3xl font-bold mt-2">{currentCredits}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Each credit allows you to process 10 files
                </div>
              </div>
              
              {/* 남은 파일 수 표시 */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground text-sm">Remaining Files</p>
                    <h3 className="text-3xl font-bold mt-2">{remainingFiles}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <File size={20} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  You can process {remainingFiles} more files with your current credits
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-6">Add Credits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PaymentCard 
                amount={10} 
                bonus={0} 
                popular={false}
                onSelect={handleSelectPlan}
              />
              
              <PaymentCard 
                amount={50} 
                bonus={5} 
                popular={true}
                onSelect={handleSelectPlan}
              />
              
              <PaymentCard 
                amount={100} 
                bonus={10} 
                popular={false}
                onSelect={handleSelectPlan}
              />
            </div>
          </div>
        </>
      )}
      
      {view === "checkout" && (
        <CreditCardForm 
          amount={selectedAmount} 
          onBack={resetView}
          onComplete={handlePaymentComplete}
        />
      )}
      
      {view === "success" && (
        <SuccessMessage onClose={resetView} />
      )}
    </div>
  );
};

export default PaymentPage; 