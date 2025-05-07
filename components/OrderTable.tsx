"use client";

import { Table, Button, Group, Anchor, Text, Badge } from "@mantine/core";
import { IconEye, IconTruckDelivery, IconReceipt } from "@tabler/icons-react"; // Example icons
import Link from "next/link";
import type { components } from "@/types/swagger";
import dayjs from "dayjs"; // For date formatting

type Order = components["schemas"]["Order"];
// Assuming Customer might be nested or we only have customer_id
type Customer = components["schemas"]["Customer"];

interface OrderTableProps {
  orders: Order[];
  // Define actions needed, e.g., view details, update status
  onViewDetails?: (order: Order) => void;
  onUpdateStatus?: (order: Order) => void; // Example action
}

// Helper to determine badge color based on status
const getStatusColor = (status: Order["status"]): string => {
  switch (status) {
    case "pending":
      return "yellow";
    case "confirmed":
      return "blue";
    case "preparing":
      return "orange";
    case "ready": // Corrected status
      return "lime";
    case "served": // Corrected status (assuming this maps to delivered/completed in some contexts)
      return "teal";
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    // Removed 'failed', 'out_for_delivery', 'delivered' as they are not in the likely enum based on TS errors
    default:
      return "gray"; // Default for any other status or undefined
  }
};

export function OrderTable({
  orders,
  onViewDetails,
  onUpdateStatus,
}: OrderTableProps) {
  const rows = orders.map((order) => {
    // Attempt to display customer info - might need adjustment based on actual data structure
    let customerDisplay = "N/A";
    const customerInfo = order.customer_id; // Can be string | Customer | null | undefined

    if (typeof customerInfo === "object" && customerInfo !== null) {
      // It's a populated Customer object
      const customer = customerInfo as Customer; // Explicitly assert type
      customerDisplay =
        customer.name ||
        customer.phone ||
        customer._id || // Use the asserted 'customer' variable
        "Unknown Customer";
    } else if (typeof customerInfo === "string") {
      // It's just an ID string
      customerDisplay = `ID: ${customerInfo.substring(0, 8)}...`;
    }
    // If null or undefined, it remains "N/A"

    return (
      <Table.Tr key={order._id}>
        <Table.Td>
          {/* Link to detail page if onViewDetails is not provided */}
          {!onViewDetails ? (
            <Anchor component={Link} href={`/orders/${order._id}`}>
              {order._id?.substring(0, 8) || "N/A"} {/* Use _id */}
            </Anchor>
          ) : (
            order._id?.substring(0, 8) || "N/A" // Use _id
          )}
        </Table.Td>
        <Table.Td>{customerDisplay}</Table.Td>
        <Table.Td>
          <Badge color={getStatusColor(order.status)} variant="light">
            {order.status || "N/A"}
          </Badge>
        </Table.Td>
        <Table.Td>₹{order.total_amount?.toFixed(2) ?? "0.00"}</Table.Td>
        <Table.Td>
          {order.createdAt
            ? dayjs(order.createdAt).format("DD MMM YYYY, hh:mm A")
            : "N/A"}
        </Table.Td>
        <Table.Td>
          <Group gap="xs" justify="flex-end">
            {onViewDetails && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onViewDetails(order)}
                leftSection={<IconEye size={14} />}
              >
                Details
              </Button>
            )}
            {/* Add other actions like Update Status if needed */}
            {/* Example:
                {onUpdateStatus && (
                    <Button variant="light" size="xs" onClick={() => onUpdateStatus(order)}>
                        Update Status
                    </Button>
                )}
                */}
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Order ID</Table.Th>
          <Table.Th>Customer</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Total Amount</Table.Th>
          <Table.Th>Date</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.length > 0 ? (
          rows
        ) : (
          <Table.Tr>
            <Table.Td colSpan={6}>
              <Text c="dimmed" ta="center">
                No orders found.
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
