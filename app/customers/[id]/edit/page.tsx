"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Title, Paper, LoadingOverlay, Alert } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

import { CustomerForm } from "@/components/CustomerForm";
import {
  getCustomerById,
  updateCustomer,
  getMyRestaurant,
} from "@/lib/fetchers";
import type { components, paths } from "@/types/swagger"; // Import paths for UpdateCustomerData

type Customer = components["schemas"]["Customer"];
type CustomerInput = components["schemas"]["CustomerInput"]; // For form submission type from CustomerForm
type Restaurant = components["schemas"]["Restaurant"];
// Define the type expected by the updateCustomer fetcher's body
type UpdateCustomerPayload =
  paths["/customers/{customerId}"]["patch"]["requestBody"]["content"]["application/json"];
// Define the form data type based on CustomerInput (excluding restaurant_id)
type CustomerFormData = Omit<CustomerInput, "restaurant_id">;

function EditCustomerPageContent() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null); // Needed for restaurantId prop of CustomerForm
  const [isLoading, setIsLoading] = useState(false); // For submission
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setError("Customer ID is missing.");
      setIsFetchingInitialData(false);
      return;
    }

    async function fetchData() {
      setIsFetchingInitialData(true);
      setError(null);
      try {
        // Fetch restaurant context first (needed for CustomerForm prop)
        const restaurantResponse = await getMyRestaurant();
        const currentRestaurant = restaurantResponse?.data?.restaurant;
        if (!currentRestaurant?._id) {
          throw new Error("Restaurant context not found.");
        }
        setRestaurant(currentRestaurant);

        // Fetch customer details
        const customerResponse = await getCustomerById(customerId);
        if (!customerResponse?.data?.customer) {
          throw new Error("Customer not found.");
        }
        setCustomer(customerResponse.data.customer);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load data for editing."
        );
        notifications.show({
          title: "Error",
          message: "Could not load data for editing the customer.",
          color: "red",
        });
      } finally {
        setIsFetchingInitialData(false);
      }
    }
    fetchData();
  }, [customerId]);

  const handleSubmit = async (values: CustomerInput) => {
    // CustomerForm's onSubmit provides the full CustomerInput object
    if (!customerId) {
      setError("Customer ID is missing. Cannot update.");
      notifications.show({
        title: "Error",
        message: "Customer ID missing.",
        color: "red",
      });
      return;
    }
    setIsLoading(true);
    setError(null);

    // Prepare the payload for updateCustomer. It expects UpdateCustomerPayload.
    // This typically excludes restaurant_id and might make fields optional.
    // We take the relevant fields from 'values' (which is CustomerInput).
    const updatePayload: UpdateCustomerPayload = {
      name: values.name,
      phone: values.phone, // phone is required in CustomerInput, likely required/optional in UpdateCustomerPayload
      email: values.email,
      // Add any other fields expected by UpdateCustomerPayload if they differ from CustomerInput
    };

    try {
      await updateCustomer(customerId, updatePayload);
      notifications.show({
        title: "Success",
        message: "Customer updated successfully!",
        color: "green",
      });
      router.push(`/customers/${customerId}`); // Navigate to the detail page
    } catch (err) {
      console.error("Error updating customer:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: `Failed to update customer: ${errorMessage}`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingInitialData) {
    return <LoadingOverlay visible={true} />;
  }

  if (error && (!customer || !restaurant)) {
    // Critical error if initial data failed
    return (
      <Container size="md">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert
            title="Error Loading Data"
            color="red"
            icon={<IconAlertCircle />}
          >
            {error || "Could not load necessary data for editing."}
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (!customer || !restaurant?._id) {
    return (
      <Container size="md">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert title="Missing Data" color="orange" icon={<IconAlertCircle />}>
            Customer data or restaurant context is not available. Cannot edit.
          </Alert>
        </Paper>
      </Container>
    );
  }

  // Prepare initial values for the form (needs CustomerFormData type)
  const initialFormValues: Partial<CustomerFormData> = {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    // Map other fields from Customer to CustomerFormData if needed
  };

  return (
    <Container size="md" my="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} mb="lg">
          Edit Customer: {customer.name || customer.phone}
        </Title>
        {error &&
          !isLoading && ( // Show submission error
            <Alert
              title="Update Error"
              color="red"
              icon={<IconAlertCircle />}
              mb="md"
            >
              {error}
            </Alert>
          )}
        <CustomerForm
          onSubmit={handleSubmit}
          initialValues={initialFormValues}
          restaurantId={restaurant._id} // Still needed by the form component prop
          isLoading={isLoading}
          submitButtonLabel="Save Changes"
          isEditMode={true} // Indicate edit mode
        />
      </Paper>
    </Container>
  );
}

export default function EditCustomerPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <EditCustomerPageContent />
    </Suspense>
  );
}
