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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Account Activation Pending</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Thank you for your payment! Your account is currently being activated.
          </DialogDescription>
          {/* Removed duplicate close button here */}
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-2">
          <p className="text-sm text-gray-600">
            Please check your email for activation details. If you don't receive an email within 24 hours, please contact us using the email address you received from our team.
          </p>
          <p className="text-sm text-gray-600">
            We'll activate your account shortly. Thank you for your patience!
          </p>
          <div className="flex justify-end pt-4">
            <Button onClick={handleClose} className="px-4">
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
