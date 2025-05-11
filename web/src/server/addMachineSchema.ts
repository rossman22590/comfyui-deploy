import { insertMachineSchema, machinesTable } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const addMachineSchema = insertMachineSchema.pick({
  name: true,
  endpoint: true,
  type: true,
  auth_token: true,
});

// Define the schema for machine secrets
export const machineSecretConfigSchema = z.array(
  z.object({
    name: z.string(),
    description: z.string().optional(),
    required: z.boolean().default(false),
  })
);

// Create a schema for the form UI that includes a secrets field not in the database
export const insertCustomMachineUISchema = z.object({
  name: z.string().default("My Machine"),
  type: z.string().default("comfy-deploy-serverless"),
  gpu: z.string().nullable().default("T4"),
  snapshot: z.any().default({
    comfyui: "93292bc450dd291925c45adea00ebedb8a3209ef",
    git_custom_nodes: {
      "https://github.com/rossman22590/comfyui-deploy.git": {
        hash: "40fc9d2914b8f1fc68534635146241d2cebca72b",
        disabled: false,
      },
    },
    file_custom_nodes: [],
  }),
  models: z.any().default([
    {
      name: "v1-5-pruned-emaonly.safetensors",
      type: "checkpoints",
      base: "SD1.5",
      save_path: "default",
      description: "Stable Diffusion 1.5 base model",
      reference: "https://huggingface.co/runwayml/stable-diffusion-v1-5",
      filename: "v1-5-pruned-emaonly.ckpt",
      url: "https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors",
    },
  ]),
  secrets: machineSecretConfigSchema.optional(),
});

// For database operations, use the original schema
export const insertCustomMachineSchema = createInsertSchema(machinesTable, {
  name: (schema) => schema.name.default("My Machine"),
  type: (schema) => schema.type.default("comfy-deploy-serverless"),
  gpu: (schema) => schema.gpu.default("T4"),
  snapshot: (schema) =>
    schema.snapshot.default({
      comfyui: "93292bc450dd291925c45adea00ebedb8a3209ef",
      git_custom_nodes: {
        "https://github.com/rossman22590/comfyui-deploy.git": {
          hash: "40fc9d2914b8f1fc68534635146241d2cebca72b",
          disabled: false,
        },
      },
      file_custom_nodes: [],
    }),
  models: (schema) =>
    schema.models.default([
      {
        name: "v1-5-pruned-emaonly.safetensors",
        type: "checkpoints",
        base: "SD1.5",
        save_path: "default",
        description: "Stable Diffusion 1.5 base model",
        reference: "https://huggingface.co/runwayml/stable-diffusion-v1-5",
        filename: "v1-5-pruned-emaonly.ckpt",
        url: "https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors",
      },
    ]),
  // No secrets field in database schema
});

// Use the UI schema for the form
export const addCustomMachineSchema = insertCustomMachineUISchema.pick({
  name: true,
  type: true,
  snapshot: true,
  models: true,
  gpu: true,
  secrets: true, // Use 'secrets' field to match UI
});
