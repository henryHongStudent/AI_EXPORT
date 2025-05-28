import React, { useState } from "react";
import { DollarSign, File } from "lucide-react";
import PlanCard from "./payment/PlanCard";
import PaymentForm from "./payment/PaymentForm";
import SuccessMessage from "./common/SuccessMessage";
import { gridStyles, layoutStyles } from "../styles";

const StatCard = ({ title, value, icon, caption }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className="text-gray-500">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <p className="text-sm text-gray-500">{caption}</p>
    </div>
  );
};

const PaymentPage = () => {
  const [currentCredits, setCurrentCredits] = useState(25); // Example credits
  const [view, setView] = useState("overview"); // overview, checkout, success
  const [selectedAmount, setSelectedAmount] = useState(null);
  
  const remainingFiles = currentCredits * 10;
  
  const handleSelectPlan = (amount) => {
    setSelectedAmount(amount);
    setView("checkout");
  };
  
  const handlePaymentComplete = () => {
    // In a real app, there would be an API call here
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
    <div className={layoutStyles.contentContainer}>
      {view === "overview" && (
        <>
          <div className={layoutStyles.sectionContainer}>
            <h1 className={layoutStyles.sectionTitle}>Credits & Billing</h1>
            
            <div className={`${gridStyles.grid2} mb-8`}>
              {/* Current Credits display */}
              <StatCard
                title="Current Credits"
                value={currentCredits}
                icon={<DollarSign size={20} />}
                caption="Each credit allows you to process 10 files"
              />
              
              {/* Remaining Files display */}
              <StatCard
                title="Remaining Files"
                value={remainingFiles}
                icon={<File size={20} />}
                caption={`You can process ${remainingFiles} more files with your current credits`}
              />
            </div>
            
            <h2 className={layoutStyles.sectionSubtitle}>Add Credits</h2>
            
            <div className={gridStyles.grid3}>
              <PlanCard 
                amount={10} 
                bonus={0} 
                popular={false}
                onSelect={handleSelectPlan}
              />
              
              <PlanCard 
                amount={50} 
                bonus={5} 
                popular={true}
                onSelect={handleSelectPlan}
              />
              
              <PlanCard 
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
        <PaymentForm 
          amount={selectedAmount} 
          onBack={resetView}
          onComplete={handlePaymentComplete}
        />
      )}
      
      {view === "success" && (
        <SuccessMessage 
          title="Payment Successful!"
          message="Your credits have been added to your account."
          buttonText="Back to Dashboard"
          onAction={resetView}
        />
      )}
    </div>
  );
};

export default PaymentPage; 