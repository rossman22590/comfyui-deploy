"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PaymentActivationPopupProps {
  onClose?: () => void;
}

export function PaymentActivationPopup({ onClose }: PaymentActivationPopupProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // Store in localStorage that the user has seen this popup
    localStorage.setItem("paymentActivationPopupSeen", "true");
    if (onClose) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-purple-50">
        <style dangerouslySetInnerHTML={{ __html: gradientButtonStyles }} />
        <DialogHeader className="border-b pb-4 border-pink-100">
          <DialogTitle className="text-xl font-semibold text-purple-600">Welcome to Pixio API!</DialogTitle>
          <DialogDescription className="text-base mt-2 text-gray-700">
            Thank you for your interest in our creative AI platform.
          </DialogDescription>
          {/* Removed duplicate close button here */}
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-4">
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
            <h3 className="font-medium text-purple-700 mb-2">Account Activation Required</h3>
            <p className="text-sm text-gray-700">
              Full access to the platform requires an active subscription. If you've already made a payment, we're processing your account. If not, please subscribe to activate your account.
            </p>
          </div>

          <p className="text-sm text-purple-600">
            If you've already subscribed, please check your email for activation details. For assistance with your account, please contact our support team.
          </p>

          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-pink-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs text-pink-600">Subscription Required</span>
            </div>
            <Button 
              onClick={handleClose} 
              className="relative px-8 py-2.5 overflow-hidden rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-gradient-x"></span>
              <span className="relative text-white font-semibold">Continue</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Define keyframes and styles for the gradient animation
const gradientButtonStyles = `
  @keyframes gradient-x {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 3s ease infinite;
  }
`;

export function shouldShowPaymentActivationPopup(): boolean {
  // Check if running on client-side
  if (typeof window === 'undefined') return false;

  // Check if user has seen the popup before
  const hasSeenPopup = localStorage.getItem("paymentActivationPopupSeen") === "true";

  // Here you can add additional logic to determine if the popup should be shown
  // For example, check if the user has made a payment but account is not yet activated
  // This is a placeholder - you'll need to implement your actual logic here
  const hasPaid = true; // Replace with actual logic to check payment status
  const isActivated = false; // Replace with actual logic to check activation status

  return hasPaid && !isActivated && !hasSeenPopup;
}
