"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Container, Title, Paper, Alert, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

import { MenuItemForm } from "@/components/MenuItemForm";
import {
  getMenuCategories,
  createMenuItem,
  getMyRestaurant,
} from "@/lib/fetchers";
import type { components } from "@/types/swagger";

type MenuCategory = components["schemas"]["MenuCategory"];
type MenuItemInput = components["schemas"]["MenuItemInput"];
type Restaurant = components["schemas"]["Restaurant"];

function CreateMenuItemPageContent() {
  const router = useRouter();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsFetchingInitialData(true);
      setError(null);
      try {
        // TODO: In a real app, the restaurant ID might come from a context or a different source
        // For now, assuming the user manages one primary restaurant.
        const response = await getMyRestaurant(); // Or a specific restaurant ID
        const actualRestaurant = response?.data?.restaurant; // Extract restaurant object

        if (!actualRestaurant || !actualRestaurant._id) {
          throw new Error(
            "Restaurant not found or user is not associated with a restaurant."
          );
        }
        setRestaurant(actualRestaurant); // Store the actual restaurant object

        const fetchedCategories = await getMenuCategories({
          restaurantId: actualRestaurant._id, // Use _id
        });
        setCategories(fetchedCategories || []);

        if (!fetchedCategories || fetchedCategories.length === 0) {
          notifications.show({
            title: "No Categories Found",
            message:
              "Please create menu categories first before adding menu items.",
            color: "yellow",
          });
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load required data. Please ensure you have a restaurant and categories set up."
        );
        notifications.show({
          title: "Error",
          message: "Failed to load required data for creating a menu item.",
          color: "red",
        });
      } finally {
        setIsFetchingInitialData(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (values: MenuItemInput) => {
    if (!restaurant?._id) {
      notifications.show({
        title: "Error",
        message: "Restaurant ID is missing. Cannot create menu item.",
        color: "red",
      });
      setError("Restaurant ID is missing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // The MenuItemForm now expects restaurant_id to be part of the values passed to its onSubmit
      // but our MenuItemInput in fetchers.ts might expect it separately or as part of the object.
      // The form itself adds restaurant_id, so values should be complete.
      await createMenuItem(values);
      notifications.show({
        title: "Success",
        message: "Menu item created successfully!",
        color: "green",
      });
      router.push("/menu-items"); // Navigate to the list page
    } catch (err) {
      console.error("Error creating menu item:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      notifications.show({
        title: "Error",
        message: `Failed to create menu item: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingInitialData) {
    return <LoadingOverlay visible={true} />;
  }

  if (error && !restaurant?._id) {
    // Critical error if restaurant ID is missing
    return (
      <Container size="md">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert title="Error" color="red" icon={<IconAlertCircle />}>
            {error}
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (!restaurant?._id) {
    // This case should ideally be caught by the error above, but as a fallback:
    return (
      <Container size="md">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert
            title="Setup Required"
            color="orange"
            icon={<IconAlertCircle />}
          >
            A restaurant must be configured before menu items can be added.
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" my="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} mb="lg">
          Create New Menu Item
        </Title>
        {error && (
          <Alert
            title="Submission Error"
            color="red"
            icon={<IconAlertCircle />}
            mb="md"
          >
            {error}
          </Alert>
        )}
        <MenuItemForm
          onSubmit={handleSubmit}
          categories={categories}
          restaurantId={restaurant._id} // Pass the fetched restaurant ID
          isLoading={isLoading}
          submitButtonLabel="Create Menu Item"
        />
      </Paper>
    </Container>
  );
}

export default function CreateMenuItemPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <CreateMenuItemPageContent />
    </Suspense>
  );
}
