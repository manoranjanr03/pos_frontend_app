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
  Select, // For filtering by status
} from "@mantine/core";
import { IconPlus, IconAlertCircle, IconFilter } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { getOrders } from "@/lib/fetchers"; // Assuming getOrders fetches for the logged-in user's restaurant
import { OrderTable } from "@/components/OrderTable";
import type { components } from "@/types/swagger";

type Order = components["schemas"]["Order"];
// Define possible order statuses based on the schema for filtering
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
] as const; // Use const assertion for literal types
type OrderStatus = (typeof ORDER_STATUSES)[number];

function OrdersListPageContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);

  const fetchOrders = async (status?: OrderStatus | null) => {
    setLoading(true);
    setError(null);
    try {
      // Pass status filter to getOrders if selected
      const orderResponse = await getOrders(status || undefined);
      // Assuming response structure { data: { orders: Order[] } }
      setOrders(orderResponse?.data?.orders || []);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load order data."
      );
      notifications.show({
        title: "Error",
        message: "Could not load order list.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]); // Refetch when filter changes

  const handleViewDetails = (order: Order) => {
    if (!order._id) return;
    router.push(`/orders/${order._id}`); // Navigate to detail page
  };

  // Handler for status filter change
  const handleStatusFilterChange = (value: string | null) => {
    // Ensure the value is a valid OrderStatus or null
    const newStatus = ORDER_STATUSES.includes(value as OrderStatus)
      ? (value as OrderStatus)
      : null;
    setStatusFilter(newStatus);
  };

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Orders</Title>
        <Group>
          <Select
            placeholder="Filter by status"
            leftSection={<IconFilter size={16} />}
            data={[
              { value: "", label: "All Statuses" },
              ...ORDER_STATUSES.map((s) => ({
                value: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
              })),
            ]}
            value={statusFilter}
            onChange={handleStatusFilterChange}
            clearable
            disabled={loading}
          />
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={() => router.push("/orders/create")}
            // Disable create for now as it's complex
            // disabled={true}
            title="Order creation form is complex and not yet implemented"
          >
            Create New Order
          </Button>
        </Group>
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
          <OrderTable
            orders={orders}
            onViewDetails={handleViewDetails}
            // Add other handlers like onUpdateStatus if implemented
          />
        )}
        {!loading && !error && orders.length === 0 && (
          <Text c="dimmed" ta="center" mt="xl">
            No orders found
            {statusFilter ? ` with status "${statusFilter}"` : ""}.
          </Text>
        )}
      </Box>
    </Container>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <OrdersListPageContent />
    </Suspense>
  );
}
