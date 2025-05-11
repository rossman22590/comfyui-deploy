"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

type SecretConfig = {
  name: string;
  description?: string;
  required: boolean;
};

type SecretValues = Record<string, string>;

export function MachineSecretEntryModal({
  open,
  secretsConfig,
  onSubmit,
  onCancel
}: {
  open: boolean;
  secretsConfig: SecretConfig[];
  onSubmit: (secretValues: SecretValues) => void;
  onCancel: () => void;
}) {
  const [secretValues, setSecretValues] = useState<SecretValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    // Validate required secrets
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    secretsConfig.forEach(secret => {
      if (secret.required && !secretValues[secret.name]) {
        newErrors[secret.name] = 'This secret is required';
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(secretValues);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enter Machine Secrets</DialogTitle>
          <DialogDescription>
            These secrets will be securely stored in Modal.com and made available 
            to your machine at runtime as environment variables.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {secretsConfig.map((secret, idx) => (
            <div key={idx} className="mb-4">
              <Label htmlFor={`secret-value-${idx}`}>
                {secret.name} {secret.required && <span className="text-red-500">*</span>}
              </Label>
              {secret.description && (
                <p className="text-xs text-muted-foreground">{secret.description}</p>
              )}
              <Input 
                id={`secret-value-${idx}`}
                type="password"
                className="mt-1"
                placeholder={`Enter value for ${secret.name}`}
                value={secretValues[secret.name] || ''}
                onChange={(e) => {
                  setSecretValues({
                    ...secretValues,
                    [secret.name]: e.target.value
                  });
                  if (errors[secret.name]) {
                    const newErrors = {...errors};
                    delete newErrors[secret.name];
                    setErrors(newErrors);
                  }
                }}
              />
              {errors[secret.name] && (
                <p className="text-xs text-red-500 mt-1">{errors[secret.name]}</p>
              )}
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit}>Deploy Machine</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
