"use server";

import { auth } from "@clerk/nextjs";
import { withServerPromise } from "./withServerPromise";

// Schema for validating secret data
type SecretValues = Record<string, string>;

export const createMachineSecrets = withServerPromise(
  async (machineId: string, secretValues: SecretValues) => {
    const { userId } = auth();
    if (!userId) return { error: "No user id" };

    try {
      // Create a unique name for the Modal secret
      // Format: machine-{machineId}-secrets
      const secretName = `machine-${machineId}-secrets`;
      
      // Call the Modal Builder API to create the secret
      const result = await fetch(`${process.env.MODAL_BUILDER_URL!}/create-secrets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          machine_id: machineId,
          secret_name: secretName,
          secret_values: secretValues,
        }),
      });

      if (!result.ok) {
        const errorData = await result.text();
        throw new Error(`Failed to create secrets: ${errorData}`);
      }

      return { success: true, message: "Secrets created successfully" };
    } catch (error) {
      console.error("Error creating machine secrets:", error);
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: "Failed to create machine secrets" };
    }
  }
);
