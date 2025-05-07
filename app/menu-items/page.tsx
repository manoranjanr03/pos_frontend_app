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
  Text,
} from "@mantine/core";
import { IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { getMyRestaurant, getMenuItems } from "@/lib/fetchers";
import { MenuItemTable } from "@/components/MenuItemTable"; // Adjust path if needed
import type { components } from "@/types/swagger";

type MenuItem = components["schemas"]["MenuItem"];
type Restaurant = components["schemas"]["Restaurant"];

export default function MenuItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch restaurant details to get the ID
        const restaurantResponse = await getMyRestaurant();
        const fetchedRestaurant = restaurantResponse.data?.restaurant;

        if (!fetchedRestaurant?._id) {
          setError(
            "Could not determine the restaurant ID for fetching menu items."
          );
          setLoading(false);
          return;
        }
        setRestaurant(fetchedRestaurant);

        // 2. Fetch menu items using the restaurant ID
        const menuItemsResponse = await getMenuItems(fetchedRestaurant._id);
        // The response includes a 'data' wrapper which contains 'menuItems' array
        setItems(menuItemsResponse.data?.menuItems || []);
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(err.response?.data?.message || "Failed to load menu items.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleItemDeleted = (deletedId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item._id !== deletedId));
  };

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Menu Items</Title>
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={() => router.push("/menu-items/create")}
          disabled={!restaurant} // Disable create if restaurant ID is not available
        >
          Create New Item
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
        {!loading && !error && restaurant && (
          <MenuItemTable items={items} onDelete={handleItemDeleted} />
        )}
        {!loading && !error && !restaurant && (
          <Text c="dimmed">
            Cannot display menu items without a valid restaurant context.
          </Text>
        )}
      </Box>
    </Container>
  );
}
