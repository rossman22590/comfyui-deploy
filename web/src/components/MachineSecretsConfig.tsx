"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

type SecretConfig = {
  name: string;
  description?: string;
  required: boolean;
};

export function MachineSecretsConfig({ 
  value = [], 
  onChange 
}: { 
  value: SecretConfig[],
  onChange: (value: SecretConfig[]) => void
}) {
  const addSecret = () => {
    onChange([...value, { name: "", description: "", required: false }]);
  };

  const removeSecret = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const updateSecret = (index: number, field: keyof SecretConfig, newValue: any) => {
    const updatedSecrets = [...value];
    updatedSecrets[index] = { ...updatedSecrets[index], [field]: newValue };
    onChange(updatedSecrets);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Machine Secrets</CardTitle>
        <CardDescription>
          Configure secrets that your machine needs (API keys, tokens, etc). These values will be available as environment variables in your ComfyUI instance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {value.length === 0 ? (
          <div className="text-sm text-muted-foreground mb-4">
            No secrets configured. Add secrets if your machine needs access to API keys or other credentials.
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            {value.map((secret, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-md">
                <div className="col-span-4">
                  <Label htmlFor={`secret-name-${idx}`} className="text-xs">Name</Label>
                  <Input 
                    id={`secret-name-${idx}`}
                    placeholder="SECRET_NAME" 
                    value={secret.name}
                    onChange={(e) => updateSecret(idx, "name", e.target.value)}
                  />
                </div>
                <div className="col-span-6">
                  <Label htmlFor={`secret-desc-${idx}`} className="text-xs">Description</Label>
                  <Input 
                    id={`secret-desc-${idx}`}
                    placeholder="What is this secret for?" 
                    value={secret.description}
                    onChange={(e) => updateSecret(idx, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <div className="flex items-center space-x-2 mt-5">
                    <Checkbox 
                      id={`secret-required-${idx}`}
                      checked={secret.required} 
                      onCheckedChange={(checked) => 
                        updateSecret(idx, "required", checked === true)
                      }
                    />
                    <Label htmlFor={`secret-required-${idx}`} className="text-xs">Required</Label>
                  </div>
                </div>
                <div className="col-span-1">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeSecret(idx)}
                    className="mt-5"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button type="button" onClick={addSecret} variant="outline" size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Secret
        </Button>
      </CardContent>
    </Card>
  );
}
