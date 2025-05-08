"use client";

import { Title, Container } from "@mantine/core";
import { UserForm, UserFormData } from "@/components/UserForm";
import { useParams, useRouter } from "next/navigation";
import { createRestaurantUser } from "@/lib/api";
import { notifications } from "@mantine/notifications";
import type { paths } from "@/types/swagger";

// This is the expected payload for the createRestaurantUser API function
type CreateRestaurantUserAPIPayload =
  paths["/users/restaurant"]["post"]["requestBody"]["content"]["application/json"];

export default function CreateRestaurantUserPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string; // This is the restaurant ID from the URL

  const handleSubmit = async (formData: UserFormData) => {
    if (!restaurantId) {
      notifications.show({
        title: "Error",
        message: "Restaurant ID is missing. Cannot create user.",
        color: "red",
      });
      return;
    }

    try {
      // The UserFormData might have more fields than CreateRestaurantUserAPIPayload expects
      // or might need transformation.
      // For example, UserFormData includes 'status', 'profile_image' which might not be in CreateRestaurantUserAPIPayload.
      // The API also expects 'password' and 'role' to be mandatory.

      if (!formData.password) {
        notifications.show({
          title: "Error",
          message: "Password is required.",
          color: "red",
        });
        return;
      }
      if (
        !formData.role ||
        (formData.role !== "manager" && formData.role !== "staff")
      ) {
        notifications.show({
          title: "Error",
          message: "Valid role (manager/staff) is required.",
          color: "red",
        });
        return;
      }

      const apiPayload: CreateRestaurantUserAPIPayload = {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone,
        password: formData.password, // Already checked
        role: formData.role as "manager" | "staff", // Already checked
        // profile_image: formData.profile_image, // If UserForm collects it
        // permissions: {}, // Default or from form
        // preferences: {}, // Default or from form
      };

      await createRestaurantUser(restaurantId, apiPayload);
      notifications.show({
        title: "User Created",
        message: `User ${formData.name} has been successfully created for the restaurant.`,
        color: "green",
      });
      router.push(`/admin/restaurants/${restaurantId}`); // Navigate back to the restaurant detail page
    } catch (error: any) {
      console.error("Failed to create restaurant user:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create user. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <Container>
      <Title order={1} my="lg">
        Add New User to Restaurant (ID: {restaurantId})
      </Title>
      <UserForm
        onSubmit={handleSubmit}
        initialValues={{ role: "manager" }} // Default to 'manager' for "Restaurant Admins"
        isEditing={false}
        submitButtonLabel="Create User"
      />
    </Container>
  );
}
