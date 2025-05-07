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
import { useRouter, useParams } from "next/navigation"; // Added useParams
import Link from "next/link";
import { RestaurantForm } from "@/components/RestaurantForm";
import { getAdminRestaurantById, updateAdminRestaurant } from "@/lib/fetchers"; // Changed fetchers
import type { components, paths } from "@/types/swagger"; // Added paths back

import * as EP from "@/lib/endpoints"; // Required for paths type if used directly

type Restaurant = components["schemas"]["Restaurant"];
// Type for data coming FROM RestaurantForm
type RestaurantFormDataType =
  paths["/restaurants/my-restaurant"]["patch"]["requestBody"]["content"]["application/json"];

// Type for data expected by updateAdminRestaurant (RestaurantInput)
type AdminUpdateRestaurantDataType = components["schemas"]["RestaurantInput"];

export default function EditAdminRestaurantPage() {
  // Renamed component
  const router = useRouter();
  const params = useParams(); // Get route params
  const restaurantId = params.id as string; // Extract restaurant ID

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setError("Restaurant ID is missing from URL.");
      setLoading(false);
      return;
    }
    const fetchRestaurantDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAdminRestaurantById(restaurantId); // Use admin fetcher
        if (!response.data?.restaurant) {
          setError("Restaurant not found.");
          setRestaurant(null);
        } else {
          setRestaurant(response.data.restaurant);
        }
      } catch (err: any) {
        console.error("Failed to fetch restaurant details:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load restaurant details for editing."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [restaurantId]); // Depend on restaurantId

  const handleSubmit = async (formValues: RestaurantFormDataType) => {
    // Changed type to RestaurantFormDataType
    if (!restaurantId) {
      setError("Restaurant ID is missing, cannot update.");
      return;
    }
    setSaving(true);
    setError(null);

    // Values from the form (RestaurantFormDataType) might not include owner_id or status.
    // AdminUpdateRestaurantDataType (RestaurantInput) might make them optional for PATCH.
    // We pass formValues directly, assuming compatibility or that API handles partial updates correctly.
    // If owner_id/status were required for PATCH and not in formValues, they'd need to be added here.
    // RestaurantInput (AdminUpdateRestaurantDataType) seems to require them.
    if (!restaurant) {
      setError(
        "Original restaurant data not loaded, cannot form update payload."
      );
      setSaving(false);
      return;
    }

    const updatePayload: AdminUpdateRestaurantDataType = {
      ...formValues,
      name: formValues.name || restaurant.name, // Ensure name is present
      owner_id: restaurant.owner_id, // Preserve original owner_id
      status: restaurant.status || "active", // Provide default if status is undefined
      // Any other fields from RestaurantInput that are not in RestaurantFormDataType
      // but are required by the API for update should be added here,
      // potentially from the original 'restaurant' object.
    };

    try {
      await updateAdminRestaurant(restaurantId, updatePayload); // Pass the potentially augmented payload
      notifications.show({
        title: "Restaurant Updated",
        message: `Restaurant "${
          formValues.name || restaurant?.name // Changed values to formValues
        }" updated successfully.`,
        color: "green",
      });
      router.push(`/restaurants/${restaurantId}`); // Redirect to the updated restaurant's detail page
    } catch (err: any) {
      console.error("Failed to update restaurant:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update restaurant details.";
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
    { title: "Restaurants", href: "/restaurants" },
    {
      title: restaurant?.name || "Edit Restaurant",
      href: `/restaurants/${restaurantId}`,
    },
    { title: "Edit", href: `/restaurants/${restaurantId}/edit` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Breadcrumbs mb="lg">{breadcrumbsItems}</Breadcrumbs>
      <Title order={2} mb="lg">
        Edit Restaurant: {restaurant?.name || "Loading..."}
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
