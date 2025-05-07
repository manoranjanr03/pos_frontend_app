"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Title, Paper, LoadingOverlay, Alert } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

import { MenuItemForm } from "@/components/MenuItemForm";
import {
  getMenuItemById,
  updateMenuItem,
  getMenuCategories,
  getMyRestaurant,
} from "@/lib/fetchers";
import type { components } from "@/types/swagger";

type MenuItem = components["schemas"]["MenuItem"];
type MenuItemInput = components["schemas"]["MenuItemInput"];
type MenuCategory = components["schemas"]["MenuCategory"];
type Restaurant = components["schemas"]["Restaurant"];

// Helper to map MenuItem to MenuItemFormData (initialValues for the form)
const mapMenuItemToFormData = (
  item: MenuItem
): Partial<Omit<MenuItemInput, "restaurant_id">> => {
  return {
    name: item.name,
    category:
      typeof item.category === "string"
        ? item.category
        : (item.category as any)?.name || "", // Assuming category might be populated or just an ID string
    price: item.price,
    tax_percentage: item.tax_percentage,
    variants:
      item.variants?.map((v) => ({
        name: v.name || "",
        price: v.price || 0,
      })) || [],
    add_ons:
      item.add_ons?.map((a) => ({ name: a.name || "", price: a.price || 0 })) ||
      [],
    is_active: item.is_active,
    // restaurant_id is handled by the form/page
  };
};

function EditMenuItemPageContent() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For submission
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setError("Menu Item ID is missing.");
      setIsFetchingInitialData(false);
      return;
    }

    async function fetchData() {
      setIsFetchingInitialData(true);
      setError(null);
      try {
        const restaurantResponse = await getMyRestaurant();
        const currentRestaurant = restaurantResponse?.data?.restaurant;
        if (!currentRestaurant || !currentRestaurant._id) {
          throw new Error("Restaurant context not found.");
        }
        setRestaurant(currentRestaurant);

        const itemData = await getMenuItemById(itemId);
        if (!itemData?.data?.menuItem) {
          throw new Error("Menu item not found.");
        }
        setMenuItem(itemData.data.menuItem);

        const fetchedCategories = await getMenuCategories({
          restaurantId: currentRestaurant._id,
        });
        setCategories(fetchedCategories || []);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load data for editing."
        );
        notifications.show({
          title: "Error",
          message: "Could not load data for editing the menu item.",
          color: "red",
        });
      } finally {
        setIsFetchingInitialData(false);
      }
    }
    fetchData();
  }, [itemId]);

  const handleSubmit = async (values: MenuItemInput) => {
    if (!itemId || !restaurant?._id) {
      notifications.show({
        title: "Error",
        message: "Missing Item ID or Restaurant ID. Cannot update.",
        color: "red",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Ensure restaurant_id is part of the submission data,
      // MenuItemForm should already be adding it based on its props.
      // The 'values' from MenuItemForm should be complete MenuItemInput.
      await updateMenuItem(itemId, values);
      notifications.show({
        title: "Success",
        message: "Menu item updated successfully!",
        color: "green",
      });
      router.push(`/menu-items/${itemId}`); // Navigate to the detail page or list
    } catch (err) {
      console.error("Error updating menu item:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      notifications.show({
        title: "Error",
        message: `Failed to update menu item: ${
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

  if (error && !menuItem) {
    // Critical error if item or restaurant couldn't be fetched
    return (
      <Container size="md">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert
            title="Error Loading Data"
            color="red"
            icon={<IconAlertCircle />}
          >
            {error}
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (!menuItem || !restaurant?._id) {
    return (
      <Container size="md">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert title="Missing Data" color="orange" icon={<IconAlertCircle />}>
            Menu item data or restaurant context is not available. Cannot edit.
          </Alert>
        </Paper>
      </Container>
    );
  }

  const initialFormValues = mapMenuItemToFormData(menuItem);

  return (
    <Container size="lg" my="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} mb="lg">
          Edit Menu Item: {menuItem.name}
        </Title>
        {error &&
          !isLoading && ( // Show submission error if not loading initial data
            <Alert
              title="Update Error"
              color="red"
              icon={<IconAlertCircle />}
              mb="md"
            >
              {error}
            </Alert>
          )}
        <MenuItemForm
          onSubmit={handleSubmit}
          initialValues={initialFormValues}
          categories={categories}
          restaurantId={restaurant._id}
          isLoading={isLoading}
          submitButtonLabel="Save Changes"
        />
      </Paper>
    </Container>
  );
}

export default function EditMenuItemPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <EditMenuItemPageContent />
    </Suspense>
  );
}
