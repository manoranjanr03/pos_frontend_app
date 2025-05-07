"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Paper,
  LoadingOverlay,
  Alert,
  Anchor,
  Breadcrumbs,
  Skeleton,
  Text, // Import Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RestaurantForm } from "@/components/RestaurantForm"; // Adjust path if needed
import { getMyRestaurant, updateMyRestaurant } from "@/lib/fetchers";
import type { components, paths } from "@/types/swagger";

type Restaurant = components["schemas"]["Restaurant"];
// Use the specific type for the PATCH request body
type UpdateMyRestaurantFormData =
  paths["/restaurants/my-restaurant"]["patch"]["requestBody"]["content"]["application/json"];

export default function EditMyRestaurantPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [saving, setSaving] = useState(false); // Saving state for form submission
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMyRestaurant();
        setRestaurant(response.data?.restaurant || null);
        if (!response.data?.restaurant) {
          setError("No restaurant associated with this account.");
        }
      } catch (err: any) {
        console.error("Failed to fetch restaurant:", err);
        if (err.response?.status === 403 || err.response?.status === 404) {
          setError(
            "No restaurant associated with this account or not authorized."
          );
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

  const handleSubmit = async (values: UpdateMyRestaurantFormData) => {
    setSaving(true);
    setError(null);
    try {
      await updateMyRestaurant(values);
      notifications.show({
        title: "Restaurant Updated",
        message: `Restaurant "${
          values.name || restaurant?.name
        }" updated successfully.`,
        color: "green",
      });
      router.push("/restaurants"); // Redirect back to the detail page
    } catch (err: any) {
      console.error("Failed to update restaurant:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update restaurant.";
      setError(errorMessage);
      notifications.show({
        title: "Update Failed",
        message: errorMessage,
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbsItems = [
    { title: "My Restaurant", href: "/restaurants" },
    { title: "Edit", href: `/restaurants/edit` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Breadcrumbs mb="lg">{breadcrumbsItems}</Breadcrumbs>
      <Title order={2} mb="lg">
        Edit My Restaurant
      </Title>

      <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
        <LoadingOverlay
          visible={loading || saving}
          overlayProps={{ blur: 2 }}
        />

        {error &&
          !loading && ( // Show error only if not loading initial data
            <Alert
              title="Error"
              color="red"
              icon={<IconAlertCircle size="1rem" />}
              mb="lg"
              withCloseButton
              onClose={() => setError(null)} // Allow dismissing submit errors
            >
              {error}
            </Alert>
          )}

        {loading &&
          !error && ( // Show skeleton while loading initial data
            <>
              {/* Add appropriate skeleton loaders matching the form structure */}
              <Skeleton height={36} mt={6} radius="sm" />
              <Skeleton height={60} mt="md" radius="sm" />
              <Skeleton height={50} mt="md" radius="sm" />
              <Skeleton
                height={36}
                mt="xl"
                width="30%"
                style={{ marginLeft: "auto" }}
                radius="sm"
              />
            </>
          )}

        {!loading &&
          !error &&
          restaurant && ( // Render form once data is loaded
            <RestaurantForm
              onSubmit={handleSubmit}
              initialValues={restaurant} // Pass fetched data as initial values
              isLoading={saving}
              submitButtonLabel="Update Restaurant"
            />
          )}
        {/* Handle case where restaurant is null after loading but no error (e.g., 404 handled gracefully) */}
        {!loading && !error && !restaurant && (
          <Text c="dimmed">Could not load restaurant data to edit.</Text>
        )}
      </Paper>
    </Container>
  );
}
