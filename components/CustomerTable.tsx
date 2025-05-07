"use client";

import { Table, Button, Group, Anchor, Text } from "@mantine/core";
import { IconPencil, IconTrash, IconEye } from "@tabler/icons-react";
import Link from "next/link";
import type { components } from "@/types/swagger";

// Assuming Customer schema has at least these fields based on CustomerInput + _id
type Customer = components["schemas"]["Customer"]; // Use the actual Customer schema type

interface CustomerTableProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onViewDetails?: (customer: Customer) => void; // Optional: Link to detail page
}

export function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onViewDetails,
}: CustomerTableProps) {
  const rows = customers.map((customer) => (
    <Table.Tr key={customer._id}>
      <Table.Td>
        {/* Link to detail page if onViewDetails is not provided, otherwise use button */}
        {!onViewDetails ? (
          <Anchor component={Link} href={`/customers/${customer._id}`}>
            {customer.name || "N/A"}
          </Anchor>
        ) : (
          customer.name || "N/A"
        )}
      </Table.Td>
      <Table.Td>{customer.phone}</Table.Td>
      <Table.Td>{customer.email || "N/A"}</Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          {onViewDetails && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onViewDetails(customer)}
              leftSection={<IconEye size={14} />}
            >
              Details
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="xs"
              color="blue"
              onClick={() => onEdit(customer)}
              leftSection={<IconPencil size={14} />}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="xs"
              color="red"
              onClick={() => onDelete(customer)}
              leftSection={<IconTrash size={14} />}
            >
              Delete
            </Button>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Phone</Table.Th>
          <Table.Th>Email</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.length > 0 ? (
          rows
        ) : (
          <Table.Tr>
            <Table.Td colSpan={4}>
              <Text c="dimmed" ta="center">
                No customers found.
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
