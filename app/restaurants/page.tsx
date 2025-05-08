"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Paper,
  LoadingOverlay,
  Alert,
  Text,
  Group,
  Button,
  Skeleton,
  Stack,
  Badge,
  SimpleGrid,
  Box, // Import Box
} from "@mantine/core";
import { IconAlertCircle, IconPencil } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { getMyRestaurant } from "@/lib/fetchers";
import type { components } from "@/types/swagger";

type Restaurant = components["schemas"]["Restaurant"];

// Helper function to display nested object data nicely
const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box>
    <Text size="xs" tt="uppercase" c="dimmed">
      {label}
    </Text>
    <Text>
      {value ?? (
        <Text c="dimmed" component="span">
          Not set
        </Text>
      )}
    </Text>
  </Box>
);

export default function MyRestaurantPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMyRestaurant();
        // The response includes a 'data' wrapper
        if (response.data?.restaurant) {
          setRestaurant(response.data.restaurant);
        } else {
          // No restaurant found, redirect to create page
          router.push("/restaurants/create");
          return; // Important to return here to avoid further state updates
        }
      } catch (err: any) {
        console.error("Failed to fetch restaurant:", err);
        if (err.response?.status === 403 || err.response?.status === 404) {
          // No restaurant associated or not authorized, redirect to create
          router.push("/restaurants/create");
          return; // Important
        } else {
          setError(
            err.response?.data?.message || "Failed to load restaurant details."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2}>My Restaurant Details</Title>
        <Button
          leftSection={<IconPencil size={14} />}
          onClick={() => router.push(`/restaurants/edit`)} // Edit page for the user's restaurant
          disabled={!restaurant || loading || !!error}
        >
          Edit Restaurant
        </Button>
      </Group>

      <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

        {error && (
          <Alert
            title="Error"
            color="red"
            icon={<IconAlertCircle size="1rem" />}
            mb="lg"
          >
            {error}
          </Alert>
        )}

        {loading &&
          !error && ( // Skeleton loader
            <Stack>
              <Skeleton height={25} width="40%" radius="sm" />
              <Skeleton height={16} mt="md" width="70%" radius="sm" />
              <Skeleton height={16} mt="sm" width="50%" radius="sm" />
              <Skeleton height={16} mt="xl" width="30%" radius="sm" />
              <Skeleton height={16} mt={4} width="60%" radius="sm" />
              <Skeleton height={16} mt="md" width="25%" radius="sm" />
              <Skeleton height={16} mt={4} width="50%" radius="sm" />
            </Stack>
          )}

        {!loading && !error && restaurant && (
          <Stack gap="lg">
            <Group>
              <Title order={3}>{restaurant.name}</Title>
              <Badge
                color={restaurant.status === "active" ? "green" : "orange"}
              >
                {restaurant.status}
              </Badge>
            </Group>

            <Text>
              {restaurant.description || (
                <Text c="dimmed" component="span">
                  No description provided.
                </Text>
              )}
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <DetailItem label="Owner ID" value={restaurant.owner_id} />
              <DetailItem
                label="Cuisine Types"
                value={restaurant.cuisine_types?.join(", ") || "None"}
              />
            </SimpleGrid>

            <Title order={4} mt="md">
              Contact
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <DetailItem label="Phone" value={restaurant.contact?.phone} />
              <DetailItem label="Email" value={restaurant.contact?.email} />
              <DetailItem label="Website" value={restaurant.contact?.website} />
            </SimpleGrid>

            <Title order={4} mt="md">
              Address
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <DetailItem label="Street" value={restaurant.address?.street} />
              <DetailItem label="City" value={restaurant.address?.city} />
              <DetailItem label="State" value={restaurant.address?.state} />
              <DetailItem
                label="Postal Code"
                value={restaurant.address?.postal_code}
              />
              <DetailItem label="Country" value={restaurant.address?.country} />
            </SimpleGrid>

            {/* Add Operating Hours, Images, Payment Options if needed */}
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
