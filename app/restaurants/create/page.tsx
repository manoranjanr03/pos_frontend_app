"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Container, Title, Paper, Alert, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

import { RestaurantForm } from "@/components/RestaurantForm"; // Assuming this is the correct path
import { createAdminRestaurant } from "@/lib/fetchers"; // Using admin endpoint for creation
import type { components, paths } from "@/types/swagger";
import * as EP from "@/lib/endpoints"; // Import for endpoint path type

// Type for data coming from RestaurantForm
type RestaurantFormDataType =
  paths["/restaurants/my-restaurant"]["patch"]["requestBody"]["content"]["application/json"];

// Type for data expected by createAdminRestaurant
type AdminCreateRestaurantDataType =
  paths[typeof EP.ADMIN_RESTAURANTS]["post"]["requestBody"]["content"]["application/json"];

function CreateRestaurantPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formValues: RestaurantFormDataType) => {
    setIsLoading(true);
    setError(null);

    // TODO: Replace with actual owner_id from authenticated user session
    const owner_id_placeholder = "temp-owner-id-needs-replacement";
    // Determine default status, e.g., 'active' or 'pending' based on API requirements
    const default_status = "active" as AdminCreateRestaurantDataType["status"];

    const finalSubmitData: AdminCreateRestaurantDataType = {
      ...formValues,
      name: formValues.name || "Default Name", // Ensure name is provided, as it's required in AdminCreateRestaurantDataType
      owner_id: owner_id_placeholder,
      status: default_status,
      // Ensure all other required fields for AdminCreateRestaurantDataType are present
      // If formValues doesn't include them, they might need defaults or RestaurantForm needs an update
    };

    // Ensure required fields like 'name' are present and correctly typed
    if (!finalSubmitData.name) {
      setError("Restaurant name is required.");
      setIsLoading(false);
      notifications.show({
        title: "Validation Error",
        message: "Restaurant name cannot be empty.",
        color: "red",
      });
      return;
    }

    try {
      await createAdminRestaurant(finalSubmitData);
      notifications.show({
        title: "Success",
        message: "Restaurant created successfully!",
        color: "green",
      });
      // Decide where to navigate after creation, e.g., to the admin restaurants list or the new restaurant's page
      router.push("/restaurants"); // Or an admin-specific restaurant list page
    } catch (err) {
      console.error("Error creating restaurant:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: `Failed to create restaurant: ${errorMessage}`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="md" my="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} mb="lg">
          Create New Restaurant
        </Title>
        {error && (
          <Alert
            title="Creation Error"
            color="red"
            icon={<IconAlertCircle />}
            mb="md"
          >
            {error}
          </Alert>
        )}
        <RestaurantForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonLabel="Create Restaurant"
        />
      </Paper>
    </Container>
  );
}

export default function CreateRestaurantPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <CreateRestaurantPageContent />
    </Suspense>
  );
}
