"use client";

import { MachineSecretsConfig } from "@/components/MachineSecretsConfig";
import { FormControl, FormItem, FormLabel } from "../../form";
import { cn } from "@/lib/utils";

export default function SecretsConfigField(props: any) {
  const { field, fieldConfigItem } = props;
  const { label, description } = fieldConfigItem;

  return (
    <FormItem className="space-y-1">
      <FormLabel>
        {label}
        {field.required && <span className="text-destructive"> *</span>}
      </FormLabel>
      <FormControl>
        <MachineSecretsConfig 
          value={field.value || []} 
          onChange={(newValue) => field.onChange(newValue)}
        />
      </FormControl>
    </FormItem>
  );
}
