"use client";

import { MachineSecretsConfig } from "@/components/MachineSecretsConfig";
import { Card } from "../../card";

export default function MachineSecretsField(props: any) {
  const { field } = props;

  return (
    <Card className="mt-4">
      <MachineSecretsConfig 
        value={field.value || []} 
        onChange={(newValue) => field.onChange(newValue)}
      />
    </Card>
  );
}
