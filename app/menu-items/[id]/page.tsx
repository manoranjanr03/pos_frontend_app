"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Paper,
  LoadingOverlay,
  Alert,
  Text,
  Group,
  Button,
  SimpleGrid,
  Badge,
  Stack,
  Divider,
  Box,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconArrowLeft,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  getMenuItemById,
  deleteMenuItem,
  getMenuCategoryById,
} from "@/lib/fetchers";
import type { components } from "@/types/swagger";

type MenuItem = components["schemas"]["MenuItem"];
type MenuCategory = components["schemas"]["MenuCategory"]; // For displaying category name

function MenuItemDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setError("Menu Item ID is missing.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const itemData = await getMenuItemById(itemId);
        if (!itemData || !itemData.data || !itemData.data.menuItem) {
          // Changed to menuItem
          throw new Error("Menu item not found.");
        }
        setMenuItem(itemData.data.menuItem);

        // Fetch category details if category ID exists
        if (
          itemData.data.menuItem.category &&
          typeof itemData.data.menuItem.category === "string"
        ) {
          try {
            const categoryId = itemData.data.menuItem.category;
            const fetchedCategory = await getMenuCategoryById(categoryId); // Assume this returns MenuCategory directly or null/undefined
            if (fetchedCategory) {
              setCategory(fetchedCategory);
            } else {
              console.warn(`Category details not found for ID: ${categoryId}`);
              setCategory(null);
            }
          } catch (catError) {
            console.error("Failed to fetch category details:", catError);
            setCategory(null);
          }
        } else {
          // If category is not a string or not present
          if (itemData.data.menuItem.category) {
            // it was present but not a string
            console.warn(
              "MenuItem's category field is not a string ID:",
              itemData.data.menuItem.category
            );
          }
          setCategory(null);
        }
      } catch (err) {
        console.error("Failed to fetch menu item:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load menu item details."
        );
        notifications.show({
          title: "Error",
          message: "Could not load menu item details.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [itemId]);

  const handleDelete = async () => {
    if (!itemId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteMenuItem(itemId);
      notifications.show({
        title: "Success",
        message: "Menu item deleted successfully.",
        color: "green",
      });
      router.push("/menu-items");
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete menu item."
      );
      notifications.show({
        title: "Error",
        message: "Could not delete menu item.",
        color: "red",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (error && !menuItem) {
    return (
      <Container>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert title="Error" color="red" icon={<IconAlertCircle />}>
            {error}
          </Alert>
          <Button
            onClick={() => router.back()}
            mt="md"
            leftSection={<IconArrowLeft />}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!menuItem) {
    return (
      <Container>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Text>Menu item not found.</Text>
          <Button
            onClick={() => router.back()}
            mt="md"
            leftSection={<IconArrowLeft />}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" my="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Group justify="space-between" mb="xl">
          <Title order={2}>{menuItem.name}</Title>
          <Group>
            <Button
              variant="outline"
              onClick={() => router.push(`/menu-items/${itemId}/edit`)}
              leftSection={<IconEdit size={16} />}
              disabled={isDeleting}
            >
              Edit
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              leftSection={<IconTrash size={16} />}
              loading={isDeleting}
            >
              Delete
            </Button>
          </Group>
        </Group>

        {error && (
          <Alert
            title="Operation Error"
            color="red"
            icon={<IconAlertCircle />}
            mb="md"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Box>
              <Text fw={500}>Category:</Text>
              <Text>{category?.name || menuItem.category || "N/A"}</Text>
            </Box>
            <Box>
              <Text fw={500}>Base Price:</Text>
              <Text>₹{menuItem.price?.toFixed(2)}</Text>
            </Box>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Box>
              <Text fw={500}>Tax Percentage:</Text>
              <Text>{menuItem.tax_percentage ?? 0}%</Text>
            </Box>
            <Box>
              <Text fw={500}>Status:</Text>
              <Badge color={menuItem.is_active ? "green" : "red"}>
                {menuItem.is_active ? "Active" : "Inactive"}
              </Badge>
            </Box>
          </SimpleGrid>

          {/* menuItem.description was removed as it does not exist on the type */}

          {menuItem.variants && menuItem.variants.length > 0 && (
            <Box>
              <Divider my="md" label="Variants" labelPosition="center" />
              {menuItem.variants.map((variant, index) => (
                <Paper key={index} p="sm" withBorder mt="xs">
                  <Group justify="space-between">
                    <Text fw={500}>{variant.name}</Text>
                    <Text>₹{variant.price?.toFixed(2)}</Text>
                  </Group>
                </Paper>
              ))}
            </Box>
          )}

          {menuItem.add_ons && menuItem.add_ons.length > 0 && (
            <Box>
              <Divider my="md" label="Add-ons" labelPosition="center" />
              {menuItem.add_ons.map((addon, index) => (
                <Paper key={index} p="sm" withBorder mt="xs">
                  <Group justify="space-between">
                    <Text fw={500}>{addon.name}</Text>
                    <Text>₹{addon.price?.toFixed(2)}</Text>
                  </Group>
                </Paper>
              ))}
            </Box>
          )}
        </Stack>

        <Button
          onClick={() => router.back()}
          mt="xl"
          variant="light"
          leftSection={<IconArrowLeft />}
        >
          Back to Menu Items
        </Button>
      </Paper>
    </Container>
  );
}

export default function MenuItemDetailPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <MenuItemDetailPageContent />
    </Suspense>
  );
}
