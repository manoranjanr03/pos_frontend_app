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
  Stack,
  Box,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconArrowLeft,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { getCustomerById, deleteCustomer } from "@/lib/fetchers";
import type { components } from "@/types/swagger";

type Customer = components["schemas"]["Customer"]; // Use the actual Customer schema

function CustomerDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setError("Customer ID is missing.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming getCustomerById returns a structure like { data: { customer: Customer } }
        const response = await getCustomerById(customerId);
        if (!response?.data?.customer) {
          // Adjust path based on actual response structure
          throw new Error("Customer not found.");
        }
        setCustomer(response.data.customer);
      } catch (err) {
        console.error("Failed to fetch customer:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load customer details."
        );
        notifications.show({
          title: "Error",
          message: "Could not load customer details.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [customerId]);

  const handleDelete = async () => {
    if (!customerId) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete customer "${
        customer?.name || customer?.phone
      }"?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteCustomer(customerId);
      notifications.show({
        title: "Success",
        message: "Customer deleted successfully.",
        color: "green",
      });
      router.push("/customers"); // Navigate back to the list
    } catch (err) {
      console.error("Failed to delete customer:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete customer."
      );
      notifications.show({
        title: "Error",
        message: "Could not delete customer.",
        color: "red",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (error && !customer) {
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

  if (!customer) {
    return (
      <Container>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Text>Customer not found.</Text>
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
          <Title order={2}>{customer.name || "Customer Details"}</Title>
          <Group>
            <Button
              variant="outline"
              onClick={() => router.push(`/customers/${customerId}/edit`)}
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

        {error && ( // Error during delete operation
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

        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Box>
              <Text fw={500}>Name:</Text>
              <Text>{customer.name || "N/A"}</Text>
            </Box>
            <Box>
              <Text fw={500}>Phone:</Text>
              <Text>{customer.phone}</Text>
            </Box>
            <Box>
              <Text fw={500}>Email:</Text>
              <Text>{customer.email || "N/A"}</Text>
            </Box>
            {/* Display other Customer fields if they exist in the schema */}
            {/* Example:
             <Box>
                <Text fw={500}>Loyalty Points:</Text>
                <Text>{customer.loyalty_points ?? 0}</Text>
             </Box>
             <Box>
                <Text fw={500}>Visit Count:</Text>
                <Text>{customer.visit_count ?? 0}</Text>
             </Box>
             */}
          </SimpleGrid>
        </Stack>

        <Button
          onClick={() => router.back()}
          mt="xl"
          variant="light"
          leftSection={<IconArrowLeft />}
        >
          Back to Customers List
        </Button>
      </Paper>
    </Container>
  );
}

export default function CustomerDetailPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <CustomerDetailPageContent />
    </Suspense>
  );
}
