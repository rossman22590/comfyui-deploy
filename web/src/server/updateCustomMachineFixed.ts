export const updateCustomMachine = withServerPromise(
  async ({
    id,
    ...formData
  }: z.infer<typeof addCustomMachineSchema> & {
    id: string;
  }) => {
    const { userId } = auth();
    if (!userId) return { error: "No user id" };

    const currentMachine = await db.query.machinesTable.findFirst({
      where: eq(machinesTable.id, id),
    });

    if (!currentMachine) return { error: "Machine not found" };

    // Check if snapshot or models have changed
    const snapshotChanged =
      JSON.stringify(formData.snapshot) !== JSON.stringify(currentMachine.snapshot);
    const modelsChanged =
      JSON.stringify(formData.models) !== JSON.stringify(currentMachine.models);
    const gpuChanged = formData.gpu !== currentMachine.gpu;

    // Convert form data to match database schema types
    const data = {
      name: formData.name,
      // Cast type to a valid enum value
      type: formData.type as "classic" | "runpod-serverless" | "modal-serverless" | "comfy-deploy-serverless",
      gpu: formData.gpu,
      snapshot: formData.snapshot,
      models: formData.models,
      // Note: secrets is handled elsewhere, not stored in the database
    };

    await db.update(machinesTable).set(data).where(eq(machinesTable.id, id));

    // If there are changes
    if (snapshotChanged || modelsChanged || gpuChanged) {
      // Update status to building
      await db
        .update(machinesTable)
        .set({
          status: "building",
          endpoint: "not-ready",
        })
        .where(eq(machinesTable.id, id));

      // Perform custom build if there are changes
      await _buildMachine(formData, currentMachine);
      redirect(`/machines/${id}`);
    } else {
      revalidatePath("/machines");
    }

    return { message: "Machine Updated" };
  }
);
