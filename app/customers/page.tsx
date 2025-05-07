"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Container,
  Title,
  Button,
  Group,
  LoadingOverlay,
  Alert,
  Box,
  Text,
} from "@mantine/core";
import { IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { getCustomers, deleteCustomer, getMyRestaurant } from "@/lib/fetchers"; // Assuming getCustomers fetches for the logged-in user's restaurant
import { CustomerTable } from "@/components/CustomerTable";
import type { components } from "@/types/swagger";

type Customer = components["schemas"]["Customer"];
type Restaurant = components["schemas"]["Restaurant"];

function CustomersListPageContent() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, get the restaurant context (needed for create button, potentially for fetchers)
      const restaurantResponse = await getMyRestaurant();
      const currentRestaurant = restaurantResponse?.data?.restaurant;
      if (!currentRestaurant?._id) {
        throw new Error(
          "Restaurant context not found. Cannot manage customers."
        );
      }
      setRestaurant(currentRestaurant);

      // Fetch customers - Assuming getCustomers implicitly uses the logged-in user's restaurant context via API
      // Or if getCustomers requires restaurantId, pass currentRestaurant._id
      const customerResponse = await getCustomers(); // Adjust if restaurantId is needed: getCustomers({ restaurantId: currentRestaurant._id })
      // Extract the actual customer array from the response structure
      setCustomers(customerResponse?.data?.customers || []);
    } catch (err: any) {
      console.error("Failed to fetch customers or restaurant:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load customer data."
      );
      notifications.show({
        title: "Error",
        message: "Could not load customer list.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDelete = async (customer: Customer) => {
    if (!customer._id) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete customer "${
        customer.name || customer.phone
      }"?`
    );
    if (!confirmed) return;

    try {
      await deleteCustomer(customer._id); // Assuming deleteCustomer fetcher exists
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
      notifications.show({
        title: "Success",
        message: "Customer deleted successfully.",
        color: "green",
      });
    } catch (err: any) {
      console.error("Failed to delete customer:", err);
      notifications.show({
        title: "Error",
        message: `Failed to delete customer: ${
          err.response?.data?.message || err.message
        }`,
        color: "red",
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    if (!customer._id) return;
    router.push(`/customers/${customer._id}/edit`); // Navigate to edit page
  };

  const handleViewDetails = (customer: Customer) => {
    if (!customer._id) return;
    router.push(`/customers/${customer._id}`); // Navigate to detail page
  };

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Customers</Title>
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={() => router.push("/customers/create")}
          disabled={!restaurant} // Disable if no restaurant context
        >
          Add New Customer
        </Button>
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        {error && (
          <Alert
            title="Error"
            color="red"
            icon={<IconAlertCircle size="1rem" />}
            mb="lg"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        {!loading && !error && (
          <CustomerTable
            customers={customers}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails} // Pass handler for detail view navigation
          />
        )}
        {!loading && !error && customers.length === 0 && (
          <Text c="dimmed" ta="center" mt="xl">
            No customers found for this restaurant.
          </Text>
        )}
      </Box>
    </Container>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <CustomersListPageContent />
    </Suspense>
  );
}
