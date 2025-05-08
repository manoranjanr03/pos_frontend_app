"use client";

import { Title, Container, Text } from "@mantine/core";
import { RestaurantForm } from "@/components/RestaurantForm";
import { useParams, useRouter } from "next/navigation";
// import { getAdminRestaurantById, updateAdminRestaurant } from "@/lib/api"; // API functions
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import type { paths, components } from "@/types/swagger";

type Restaurant = components["schemas"]["Restaurant"];
// Type for the PATCH request body for /admin/restaurants/{restaurantId}
type UpdateAdminRestaurantPayload =
  paths["/admin/restaurants/{restaurantId}"]["patch"]["requestBody"]["content"]["application/json"];
// This is the type RestaurantForm provides on submit
type RestaurantFormData =
  paths["/restaurants/my-restaurant"]["patch"]["requestBody"]["content"]["application/json"];

export default function EditAdminRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (id) {
  //     const fetchRestaurantDetails = async () => {
  //       try {
  //         setLoading(true);
  //         // const data = await getAdminRestaurantById(id); // To be implemented
  //         // setRestaurant(data);
  //         setError(null);
  //       } catch (err: any) {
  //         console.error("Failed to fetch restaurant details for editing:", err);
  //         setError(err.message || "Failed to load restaurant data.");
  //         setRestaurant(null);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchRestaurantDetails();
  //   }
  // }, [id]);

  const handleSubmit = async (formData: RestaurantFormData) => {
    if (!id) {
      notifications.show({
        title: "Error",
        message: "Restaurant ID is missing.",
        color: "red",
      });
      return;
    }
    try {
      // Construct the payload for updateAdminRestaurant
      // This needs to align with UpdateAdminRestaurantPayload
      const payload: UpdateAdminRestaurantPayload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        contact: formData.contact,
        cuisine_types: formData.cuisine_types,
        images: formData.images,
        payment_options: formData.payment_options,
        // operating_hours: formData.operating_hours, // If available
        // owner_id: formData.owner_id, // If admin can change owner
        // status: formData.status, // If admin can change status
      };
      // await updateAdminRestaurant(id, payload); // To be implemented
      notifications.show({
        title: "Restaurant Updated",
        message: "Restaurant details have been successfully updated.",
        color: "green",
      });
      router.push(`/admin/restaurants/${id}`); // Navigate back to the detail page
    } catch (error) {
      console.error("Failed to update restaurant:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update restaurant. Please try again.",
        color: "red",
      });
    }
  };

  // if (loading) return <Container><Text>Loading form...</Text></Container>;
  // if (error) return <Container><Text color="red">{error}</Text></Container>;
  // if (!restaurant) return <Container><Text>Restaurant data not found for editing.</Text></Container>;

  return (
    <Container>
      <Title order={1} my="lg">
        {/* Edit Restaurant: {restaurant?.name} */}
        Edit Restaurant (ID: {id})
      </Title>
      <RestaurantForm
        onSubmit={handleSubmit}
        // initialValues={restaurant ? { ...restaurant, owner_id: restaurant.owner_id } : undefined} // Adapt 'restaurant' to form structure
        initialValues={{
          // Placeholder initial values
          name: "Loading...",
          description: "Loading...",
          address: {
            street: "",
            city: "",
            state: "",
            postal_code: "",
            country: "",
          },
          contact: { phone: "", email: "", website: "" },
          cuisine_types: [],
          payment_options: [],
          images: [],
        }}
        submitButtonLabel="Update Restaurant"
      />
    </Container>
  );
}
