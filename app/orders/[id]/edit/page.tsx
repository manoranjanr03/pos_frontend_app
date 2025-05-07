"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Paper,
  LoadingOverlay,
  Alert,
  Text,
} from "@mantine/core";
import { useRouter, useParams } from "next/navigation";
import OrderForm from "@/components/OrderForm";
import { getOrderById } from "@/lib/fetchers";
import { components } from "@/types/swagger";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

type Order = components["schemas"]["Order"];

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      getOrderById(orderId)
        .then((response) => {
          if (response.data?.order) {
            setOrder(response.data.order);
          } else {
            setError("Order not found.");
            notifications.show({
              title: "Error",
              message: "Order not found or could not be loaded.",
              color: "red",
            });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch order:", err);
          setError(err.message || "Failed to load order data.");
          notifications.show({
            title: "Error Loading Order",
            message:
              err.message ||
              "An unexpected error occurred while fetching the order.",
            color: "red",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [orderId]);

  const handleUpdateSuccess = (updatedOrderId: string) => {
    notifications.show({
      title: "Order Update Submitted", // Changed from 'Order Updated' as full update isn't there
      message: `Order ${updatedOrderId} submission processed. Redirecting...`, // Generic message
      color: "blue", // Blue for info, as it's not a full update yet
    });
    router.push(`/orders/${updatedOrderId}`);
  };

  if (loading) {
    return <LoadingOverlay visible={true} overlayBlur={2} />;
  }

  if (error) {
    return (
      <Container size="md" my="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error!"
          color="red"
          variant="filled"
        >
          {error} Please try again or contact support.
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container size="md" my="xl">
        <Paper p="lg" shadow="sm" withBorder>
          <Text ta="center">
            Order data could not be loaded or order does not exist.
          </Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md" my="xl">
      <Paper p="lg" shadow="sm" withBorder>
        <Title order={1} mb="xl" ta="center">
          Edit Order #{order._id}
        </Title>
        <OrderForm order={order} onSubmitSuccess={handleUpdateSuccess} />
      </Paper>
    </Container>
  );
}
