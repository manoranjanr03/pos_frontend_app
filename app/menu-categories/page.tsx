"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Button,
  Group,
  LoadingOverlay,
  Alert,
  Box,
} from "@mantine/core";
import { IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { getMenuCategories, getMyRestaurant } from "@/lib/fetchers"; // Added getMyRestaurant
import { MenuCategoryTable } from "@/components/MenuCategoryTable";
import type { components } from "@/types/swagger";

type MenuCategory = components["schemas"]["MenuCategory"];
type Restaurant = components["schemas"]["Restaurant"]; // Added Restaurant type

export default function MenuCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null); // Added restaurant state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoriesAndRestaurant = async () => {
    // Renamed function
    setLoading(true);
    setError(null);
    try {
      const restaurantResponse = await getMyRestaurant();
      const currentRestaurant = restaurantResponse?.data?.restaurant;

      if (!currentRestaurant || !currentRestaurant._id) {
        throw new Error(
          "Restaurant not found or user is not associated with a restaurant."
        );
      }
      setRestaurant(currentRestaurant);

      // The response from getMenuCategories is directly the array based on swagger
      const data = await getMenuCategories({
        restaurantId: currentRestaurant._id,
      });
      setCategories(data || []); // Ensure it's an array
    } catch (err: any) {
      console.error("Failed to fetch menu categories or restaurant:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load categories or restaurant information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndRestaurant(); // Call the renamed function
  }, []);

  const handleCategoryDeleted = (deletedId: string) => {
    setCategories((prevCategories) =>
      prevCategories.filter((cat) => cat._id !== deletedId)
    );
  };

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Menu Categories</Title>
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={() => router.push("/menu-categories/create")}
        >
          Create New Category
        </Button>
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        {error && (
          <Alert
            title="Error"
            color="red"
            icon={<IconAlertCircle size="1rem" />}
            mb="lg"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        {!loading && !error && (
          <MenuCategoryTable
            categories={categories}
            onDelete={handleCategoryDeleted}
          />
        )}
      </Box>
    </Container>
  );
}
