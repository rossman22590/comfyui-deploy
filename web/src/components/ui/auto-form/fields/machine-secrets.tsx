"use client";

import { MachineSecretsConfig } from "@/components/MachineSecretsConfig";

export default function MachineSecretsField(props: any) {
  const { field } = props;

  return (
    <MachineSecretsConfig 
      value={field.value || []} 
      onChange={(newValue) => field.onChange(newValue)}
    />
  );
}
