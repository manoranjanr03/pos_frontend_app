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
  Anchor,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconArrowLeft,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { getAdminRestaurantById, deleteAdminRestaurant } from "@/lib/fetchers"; // Using admin fetchers
import type { components } from "@/types/swagger";

type Restaurant = components["schemas"]["Restaurant"]; // Full restaurant details

function RestaurantDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setError("Restaurant ID is missing.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming getAdminRestaurantById returns a structure like { data: { restaurant: Restaurant } }
        const response = await getAdminRestaurantById(restaurantId);
        if (!response?.data?.restaurant) {
          throw new Error("Restaurant not found.");
        }
        setRestaurant(response.data.restaurant);
      } catch (err) {
        console.error("Failed to fetch restaurant:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load restaurant details."
        );
        notifications.show({
          title: "Error",
          message: "Could not load restaurant details.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [restaurantId]);

  const handleDelete = async () => {
    if (!restaurantId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this restaurant? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteAdminRestaurant(restaurantId);
      notifications.show({
        title: "Success",
        message: "Restaurant deleted successfully.",
        color: "green",
      });
      router.push("/restaurants"); // Navigate to the restaurants list
    } catch (err) {
      console.error("Failed to delete restaurant:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete restaurant."
      );
      notifications.show({
        title: "Error",
        message: "Could not delete restaurant.",
        color: "red",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (error && !restaurant) {
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

  if (!restaurant) {
    return (
      <Container>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Text>Restaurant not found.</Text>
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
          <Title order={2}>{restaurant.name}</Title>
          <Group>
            <Button
              variant="outline"
              onClick={() => router.push(`/restaurants/${restaurantId}/edit`)}
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

        <Stack gap="lg">
          <Box>
            <Title order={4}>Description</Title>
            <Text>{restaurant.description || "N/A"}</Text>
          </Box>

          <Divider />

          <Box>
            <Title order={4} mb="xs">
              Contact Information
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Box>
                <Text fw={500}>Phone:</Text>
                <Text>{restaurant.contact?.phone || "N/A"}</Text>
              </Box>
              <Box>
                <Text fw={500}>Email:</Text>
                <Text>{restaurant.contact?.email || "N/A"}</Text>
              </Box>
              <Box>
                <Text fw={500}>Website:</Text>
                {restaurant.contact?.website ? (
                  <Anchor
                    href={restaurant.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {restaurant.contact.website}
                  </Anchor>
                ) : (
                  <Text>N/A</Text>
                )}
              </Box>
            </SimpleGrid>
          </Box>

          <Divider />

          <Box>
            <Title order={4} mb="xs">
              Address
            </Title>
            <Text>{restaurant.address?.street || "N/A"}</Text>
            <Text>
              {restaurant.address?.city || ""}
              {restaurant.address?.city && restaurant.address.state ? ", " : ""}
              {restaurant.address?.state || ""}
            </Text>
            <Text>
              {restaurant.address?.postal_code || ""}
              {restaurant.address?.postal_code && restaurant.address.country
                ? " "
                : ""}
              {restaurant.address?.country || ""}
            </Text>
          </Box>

          <Divider />

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Box>
              <Text fw={500}>Cuisine Types:</Text>
              <Text>{restaurant.cuisine_types?.join(", ") || "N/A"}</Text>
            </Box>
            <Box>
              <Text fw={500}>Payment Options:</Text>
              <Text>{restaurant.payment_options?.join(", ") || "N/A"}</Text>
            </Box>
            <Box>
              <Text fw={500}>Owner ID:</Text>
              <Text>{restaurant.owner_id}</Text>
            </Box>
            <Box>
              <Text fw={500}>Status:</Text>
              <Badge
                color={
                  restaurant.status === "active"
                    ? "green"
                    : restaurant.status === "pending_approval" // Changed from "pending"
                    ? "yellow"
                    : restaurant.status === "inactive"
                    ? "red" // Added handling for "inactive"
                    : "gray"
                }
              >
                {restaurant.status}
              </Badge>
            </Box>
          </SimpleGrid>

          {/* TODO: Display images, operating hours if available and needed */}
        </Stack>

        <Button
          onClick={() => router.back()}
          mt="xl"
          variant="light"
          leftSection={<IconArrowLeft />}
        >
          Back to Restaurants List
        </Button>
      </Paper>
    </Container>
  );
}

export default function RestaurantDetailPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <RestaurantDetailPageContent />
    </Suspense>
  );
}
