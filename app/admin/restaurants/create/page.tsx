"use client";

import { useState, useEffect } from "react"; // Added useEffect
import { Title, Container, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  RestaurantForm,
  RestaurantAndOwnerFormData,
} from "@/components/RestaurantForm";
import { useRouter } from "next/navigation";
import { createAdminRestaurant } from "@/lib/api"; // createAdminRestaurant is likely in lib/api
import {
  registerUser,
  getCurrentUser,
  updateAdminRestaurant,
} from "@/lib/fetchers"; // Moved updateAdminRestaurant here
import { notifications } from "@mantine/notifications";
import type { paths, components } from "@/types/swagger";

type RestaurantInput = components["schemas"]["RestaurantInput"];
type UserInput = components["schemas"]["UserInput"];
type UpdateAdminRestaurantPayload =
  paths["/admin/restaurants/{restaurantId}"]["patch"]["requestBody"]["content"]["application/json"];

export default function CreateRestaurantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [initialLoadingError, setInitialLoadingError] = useState<string | null>(
    null
  );

  // Fetch current admin user ID on component mount
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        const response = await getCurrentUser();
        console.log("getCurrentUser response:", response); // Log the response
        if (response?.data?.user?._id && response.data.user.role === "admin") {
          console.log("Admin user found:", response.data.user._id);
          setCurrentAdminId(response.data.user._id);
        } else {
          console.error("Admin check failed. User data:", response?.data?.user);
          throw new Error("Could not retrieve valid Admin user ID.");
        }
      } catch (error: any) {
        console.error("Failed to fetch current admin ID:", error);
        setInitialLoadingError(
          error.message ||
            "Failed to load necessary admin data. Cannot proceed."
        );
        notifications.show({
          title: "Initialization Error",
          message: "Could not verify admin identity. Please try refreshing.",
          color: "red",
        });
      }
    };
    fetchAdminId();
  }, []);

  const handleSubmit = async (formData: RestaurantAndOwnerFormData) => {
    setIsSubmitting(true);

    if (!currentAdminId) {
      notifications.show({
        title: "Error",
        message: "Admin ID not available. Cannot create restaurant.",
        color: "red",
      });
      setIsSubmitting(false);
      return;
    }

    const { owner_name, owner_email, owner_password, ...restaurantData } =
      formData;

    if (!owner_name || !owner_email || !owner_password) {
      notifications.show({
        title: "Error",
        message: "Owner details (name, email, password) are required.",
        color: "red",
      });
      setIsSubmitting(false);
      return;
    }

    let createdRestaurantId: string | undefined;
    let registeredUserId: string | undefined;

    try {
      // Step 1: Create Restaurant with current admin as temporary owner
      const restaurantPayload: RestaurantInput = {
        name: restaurantData.name || "",
        description: restaurantData.description,
        address: restaurantData.address,
        contact: restaurantData.contact,
        cuisine_types: restaurantData.cuisine_types,
        images: restaurantData.images,
        payment_options: restaurantData.payment_options,
        owner_id: currentAdminId, // Use current admin ID temporarily
        status: "pending_approval",
      };

      // Assuming createAdminRestaurant returns the created restaurant object including its _id
      // Adjust based on actual return type if it's different (e.g. from lib/fetchers vs lib/api)
      const createRestaurantResponse = await createAdminRestaurant(
        restaurantPayload
      );
      // IMPORTANT: Adjust access based on actual response structure
      // It might be response.data.restaurant._id or just response._id
      createdRestaurantId =
        (createRestaurantResponse as any)?._id ||
        (createRestaurantResponse as any)?.data?.restaurant?._id;

      if (!createdRestaurantId) {
        throw new Error("Failed to create restaurant or retrieve its ID.");
      }

      // Step 2: Register the new owner user, linking to the created restaurant
      const registerPayload: UserInput = {
        name: owner_name,
        email: owner_email,
        password: owner_password,
        role: "manager",
        restaurant_id: createdRestaurantId, // Link user to the new restaurant
        status: "active",
      };

      const registrationResponse = await registerUser(registerPayload);
      registeredUserId = registrationResponse?.data?.user?._id;

      if (!registeredUserId) {
        throw new Error(
          "Restaurant created, but failed to register owner user or retrieve user ID."
        );
      }

      // Step 3: (Recommended) Update restaurant owner_id to the new user's ID
      const updatePayload: UpdateAdminRestaurantPayload = {
        owner_id: registeredUserId,
      };
      // Now using updateAdminRestaurant from fetchers
      await updateAdminRestaurant(createdRestaurantId, updatePayload);

      notifications.show({
        title: "Restaurant & Owner Created",
        message: `Restaurant '${restaurantPayload.name}' and owner '${owner_name}' created and linked successfully.`,
        color: "green",
      });
      router.push("/admin/restaurants");
    } catch (error: any) {
      console.error("Failed during restaurant/owner creation process:", error);
      let errorMessage =
        "An unexpected error occurred during the creation process.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      notifications.show({
        title: "Creation Failed",
        message: `Error: ${errorMessage}. Please check details and try again.`,
        color: "red",
      });

      // Basic Rollback attempt (if user was created but restaurant update failed, or if restaurant created but user failed)
      // More robust rollback might be needed depending on backend capabilities
      if (registeredUserId && createdRestaurantId) {
        console.warn(
          "Attempting rollback: Update likely failed after user creation."
        );
        // Optionally try deleting the user? Depends on requirements.
      } else if (createdRestaurantId && !registeredUserId) {
        console.warn(
          "Attempting rollback: Deleting restaurant as user creation failed."
        );
        // try { await deleteAdminRestaurant(createdRestaurantId); } catch (e) { console.error("Rollback failed: Could not delete restaurant", e); }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoadingError) {
    return (
      <Container>
        <Alert title="Error" color="red" icon={<IconAlertCircle size="1rem" />}>
          {initialLoadingError}
        </Alert>
      </Container>
    );
  }

  if (!currentAdminId) {
    return (
      <Container>
        <Title order={3}>Loading admin data...</Title>
      </Container>
    ); // Show loading state while fetching admin ID
  }

  return (
    <Container>
      <Title order={1} my="lg">
        Create New Restaurant & Owner
      </Title>
      <RestaurantForm
        onSubmit={handleSubmit}
        initialValues={{
          name: "",
          description: "",
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
          owner_name: "",
          owner_email: "",
          owner_password: "",
        }}
        showOwnerFields={true}
        isLoading={isSubmitting}
        submitButtonLabel="Create Restaurant & Owner"
      />
    </Container>
  );
}
