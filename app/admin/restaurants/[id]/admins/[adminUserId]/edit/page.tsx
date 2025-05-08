"use client";

import { Title, Container, Text } from "@mantine/core";
import { UserForm, UserFormData } from "@/components/UserForm";
import { useParams, useRouter } from "next/navigation";
import { updateRestaurantUser, getRestaurantUsers } from "@/lib/api"; // getRestaurantUsers to fetch specific user
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import type { components, paths } from "@/types/swagger";

type User = components["schemas"]["User"];
// This is the expected payload for the updateRestaurantUser API function
type UpdateRestaurantUserAPIPayload =
  paths["/users/restaurant/{userId}"]["patch"]["requestBody"]["content"]["application/json"];

export default function EditRestaurantUserPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  const adminUserId = params.adminUserId as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId && adminUserId) {
      const fetchUserDetails = async () => {
        try {
          setLoading(true);
          // Fetch all users for the restaurant and find the specific one.
          // Ideally, there would be a getRestaurantUserById(restaurantId, userId) endpoint.
          const users = await getRestaurantUsers(restaurantId);
          const currentUser = users.find((u) => u._id === adminUserId);
          if (currentUser) {
            setUser(currentUser);
          } else {
            setError("User not found in this restaurant.");
          }
          setError(null);
        } catch (err: any) {
          console.error("Failed to fetch user details for editing:", err);
          setError(err.message || "Failed to load user data.");
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      fetchUserDetails();
    }
  }, [restaurantId, adminUserId]);

  const handleSubmit = async (formData: UserFormData) => {
    if (!restaurantId || !adminUserId) {
      notifications.show({
        title: "Error",
        message: "Restaurant ID or User ID is missing.",
        color: "red",
      });
      return;
    }

    try {
      // Construct the payload for updateRestaurantUser
      const apiPayload: UpdateRestaurantUserAPIPayload = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role as "manager" | "staff" | undefined, // Role might be optional on update
        // profile_image: formData.profile_image,
        // status: formData.status,
        // permissions: formData.permissions,
        // preferences: formData.preferences,
      };
      // Password should only be included if it's being changed
      if (formData.password && formData.password.trim() !== "") {
        // The UpdateRestaurantUserAPIPayload from swagger doesn't explicitly list password.
        // This assumes the backend handles password change if 'password' field is present.
        // If not, a separate endpoint/logic for password change is needed.
        // For now, we'll try to send it if provided, but this might need API adjustment.
        (apiPayload as any).password = formData.password;
      }

      await updateRestaurantUser(restaurantId, adminUserId, apiPayload);
      notifications.show({
        title: "User Updated",
        message: `User ${formData.name} has been successfully updated.`,
        color: "green",
      });
      router.push(`/admin/restaurants/${restaurantId}`); // Navigate back
    } catch (error: any) {
      console.error("Failed to update restaurant user:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update user. Please try again.",
        color: "red",
      });
    }
  };

  if (loading)
    return (
      <Container>
        <Text>Loading user details...</Text>
      </Container>
    );
  if (error)
    return (
      <Container>
        <Text color="red">{error}</Text>
      </Container>
    );
  if (!user)
    return (
      <Container>
        <Text>User data not found for editing.</Text>
      </Container>
    );

  return (
    <Container>
      <Title order={1} my="lg">
        Edit User: {user.name} (Restaurant ID: {restaurantId})
      </Title>
      <UserForm
        onSubmit={handleSubmit}
        initialValues={{
          name: user.name,
          email: user.email, // Email is usually not editable or handled with care
          phone: user.phone,
          role: user.role as "manager" | "staff", // Cast based on expected roles
          // profile_image: user.profile_image,
          // status: user.status,
        }}
        isEditing={true}
        submitButtonLabel="Update User"
      />
    </Container>
  );
}
