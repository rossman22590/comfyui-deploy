
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createMachineSecrets } from "@/server/machineSecrets";
import { buildMachine } from "@/server/curdMachine";
import { LoadingIcon } from "@/components/LoadingIcon";

type SecretConfig = {
  name: string;
  description?: string;
  required: boolean;
};

type MachineSecretModalProps = {
  open: boolean;
  onClose: () => void;
  machineId: string;
  secretsConfig: SecretConfig[];
};

export function MachineSecretModal({
  open,
  onClose,
  machineId,
  secretsConfig
}: MachineSecretModalProps) {
  const [secretValues, setSecretValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
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

    setIsLoading(true);

    try {
      // Create secrets in Modal
      await createMachineSecrets(machineId, secretValues);

      // Then build the machine
      await buildMachine({ id: machineId });

      onClose();
    } catch (error) {
      console.error("Error creating secrets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
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
                    const newErrors = { ...errors };
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
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <div className="mr-2"><LoadingIcon /></div>}
            Deploy Machine
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
