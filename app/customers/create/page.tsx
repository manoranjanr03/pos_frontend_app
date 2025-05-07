"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Container, Title, Paper, Alert, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

import { CustomerForm } from "@/components/CustomerForm";
import { createCustomer, getMyRestaurant } from "@/lib/fetchers";
import type { components } from "@/types/swagger";

type CustomerInput = components["schemas"]["CustomerInput"];
type Restaurant = components["schemas"]["Restaurant"];

function CreateCustomerPageContent() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For submission
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch restaurant context needed for restaurantId
    async function fetchRestaurantContext() {
      setIsFetchingInitialData(true);
      setError(null);
      try {
        const restaurantResponse = await getMyRestaurant();
        const currentRestaurant = restaurantResponse?.data?.restaurant;
        if (!currentRestaurant?._id) {
          throw new Error(
            "Restaurant context not found. Cannot create customer."
          );
        }
        setRestaurant(currentRestaurant);
      } catch (err) {
        console.error("Error fetching restaurant context:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load necessary data."
        );
        notifications.show({
          title: "Error",
          message: "Could not load restaurant context.",
          color: "red",
        });
      } finally {
        setIsFetchingInitialData(false);
      }
    }
    fetchRestaurantContext();
  }, []);

  const handleSubmit = async (values: CustomerInput) => {
    // restaurantId is added within the CustomerForm's handleSubmit logic
    // So 'values' here should already include it if CustomerForm was modified,
    // OR CustomerForm's onSubmit needs the raw form data and we add restaurantId here.
    // Based on CustomerForm's current implementation, it expects onSubmit to handle the full CustomerInput.
    // Let's ensure the restaurantId from state is used if needed.

    if (!restaurant?._id) {
      setError("Restaurant ID is missing. Cannot create customer.");
      notifications.show({
        title: "Error",
        message: "Restaurant context is missing.",
        color: "red",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    // Ensure the payload has the correct restaurant_id from the fetched context
    const submitPayload: CustomerInput = {
      ...values,
      restaurant_id: restaurant._id,
    };

    try {
      await createCustomer(submitPayload);
      notifications.show({
        title: "Success",
        message: "Customer created successfully!",
        color: "green",
      });
      router.push("/customers"); // Navigate to the list page
    } catch (err) {
      console.error("Error creating customer:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: `Failed to create customer: ${errorMessage}`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingInitialData) {
    return <LoadingOverlay visible={true} />;
  }

  if (error && !restaurant) {
    // Critical error if restaurant context failed
    return (
      <Container size="md">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert
            title="Error Loading Context"
            color="red"
            icon={<IconAlertCircle />}
          >
            {error || "Could not load necessary restaurant data."}
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (!restaurant?._id) {
    return (
      <Container size="md">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert
            title="Missing Context"
            color="orange"
            icon={<IconAlertCircle />}
          >
            Restaurant context is not available. Cannot create customer.
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md" my="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} mb="lg">
          Add New Customer
        </Title>
        {error &&
          !isLoading && ( // Show submission error
            <Alert
              title="Creation Error"
              color="red"
              icon={<IconAlertCircle />}
              mb="md"
            >
              {error}
            </Alert>
          )}
        <CustomerForm
          onSubmit={handleSubmit}
          restaurantId={restaurant._id} // Pass restaurantId to the form
          isLoading={isLoading}
          submitButtonLabel="Create Customer"
        />
      </Paper>
    </Container>
  );
}

export default function CreateCustomerPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <CreateCustomerPageContent />
    </Suspense>
  );
}
