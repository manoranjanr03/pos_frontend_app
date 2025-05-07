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
  Badge,
  Stack,
  Divider,
  Box,
  Table, // For displaying order items
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCurrencyRupee,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { getOrderById } from "@/lib/fetchers";
import type { components } from "@/types/swagger";
import dayjs from "dayjs";

type Order = components["schemas"]["Order"];
type Customer = components["schemas"]["Customer"];
type OrderItem = components["schemas"]["OrderItem"]; // Assuming this schema exists for items

// Helper function from OrderTable - reuse or redefine
const getStatusColor = (status: Order["status"]): string => {
  switch (status) {
    case "pending":
      return "yellow";
    case "confirmed":
      return "blue";
    case "preparing":
      return "orange";
    case "ready":
      return "lime";
    case "served":
      return "teal";
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
};

function OrderDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming getOrderById returns { data: { order: Order } }
        const response = await getOrderById(orderId);
        if (!response?.data?.order) {
          throw new Error("Order not found.");
        }
        setOrder(response.data.order);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load order details."
        );
        notifications.show({
          title: "Error",
          message: "Could not load order details.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [orderId]);

  // --- Customer Display Logic ---
  let customerDisplay = "N/A";
  if (order?.customer_id) {
    const customerInfo = order.customer_id;
    if (typeof customerInfo === "object" && customerInfo !== null) {
      const customer = customerInfo as Customer;
      customerDisplay = `${customer.name || "Unknown"} (${
        customer.phone || "No Phone"
      })`;
    } else if (typeof customerInfo === "string") {
      customerDisplay = `ID: ${customerInfo.substring(0, 8)}...`;
    }
  }

  // --- Order Items Table ---
  const itemRows = order?.items?.map((item, index) => (
    <Table.Tr key={item.menu_item_id + index}>
      {" "}
      {/* Use a combination for key if IDs aren't unique per order */}
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>{item.quantity}</Table.Td>
      <Table.Td>₹{item.price?.toFixed(2)}</Table.Td>
      <Table.Td>₹{(item.quantity * (item.price || 0)).toFixed(2)}</Table.Td>
      {/* Add Add-ons display if needed */}
      {/* <Table.Td>{item.add_ons?.map(a => a.name).join(', ') || '-'}</Table.Td> */}
    </Table.Tr>
  ));

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (error && !order) {
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

  if (!order) {
    return (
      <Container>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Text>Order not found.</Text>
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
          <Title order={2}>Order Details #{order._id?.substring(0, 8)}</Title>
          {/* Add Actions like Update Status, Print KOT, Record Payment etc. here */}
          <Button
            onClick={() => router.back()}
            variant="light"
            leftSection={<IconArrowLeft />}
          >
            Back to Orders
          </Button>
        </Group>

        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            <Box>
              <Text fw={500}>Status:</Text>
              <Badge
                color={getStatusColor(order.status)}
                size="lg"
                variant="light"
              >
                {order.status || "N/A"}
              </Badge>
            </Box>
            <Box>
              <Text fw={500}>Order Type:</Text>
              <Text>{order.order_type || "N/A"}</Text>
            </Box>
            {order.order_type === "dine-in" && (
              <Box>
                <Text fw={500}>Table No:</Text>
                <Text>{order.table_no || "N/A"}</Text>
              </Box>
            )}
            <Box>
              <Text fw={500}>Customer:</Text>
              <Text>{customerDisplay}</Text>
            </Box>
            <Box>
              <Text fw={500}>Order Date:</Text>
              <Text>
                {order.createdAt
                  ? dayjs(order.createdAt).format("DD MMM YYYY, hh:mm A")
                  : "N/A"}
              </Text>
            </Box>
          </SimpleGrid>

          <Divider my="md" label="Order Items" labelPosition="center" />

          {order.items && order.items.length > 0 ? (
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Qty</Table.Th>
                  <Table.Th>Unit Price</Table.Th>
                  <Table.Th>Total</Table.Th>
                  {/* <Table.Th>Add-ons</Table.Th> */}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{itemRows}</Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed" ta="center">
              No items in this order.
            </Text>
          )}

          <Divider my="md" label="Pricing" labelPosition="center" />

          <SimpleGrid
            cols={{ base: 1, sm: 2 }}
            ml="auto"
            style={{ maxWidth: "300px" }}
          >
            {/* Removed Subtotal and Discount as they don't exist on the Order schema */}
            <Text fw={500} ta="right">
              Tax Amount:
            </Text>
            <Text ta="right">₹{order.tax_amount?.toFixed(2) ?? "0.00"}</Text>

            {/* Spacer to maintain alignment if needed, or adjust grid cols */}
            <span />
            <span />

            <Text fw={700} ta="right" size="lg">
              Total Amount:
            </Text>
            <Text ta="right" fw={700} size="lg">
              ₹{order.total_amount?.toFixed(2) ?? "0.00"}
            </Text>
          </SimpleGrid>

          {/* Add Payment Details Section if applicable */}
          {/* <Divider my="md" label="Payment" labelPosition="center" />
          <Text>Payment Status: {order.payment_status}</Text>
          <Text>Payment Method: {order.payment_method}</Text> */}
        </Stack>
      </Paper>
    </Container>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <OrderDetailPageContent />
    </Suspense>
  );
}
