"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Group,
  Text,
  ActionIcon,
  Modal,
  Stack,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPencil, IconTrash, IconEye } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { components } from "@/types/swagger";
import { deleteMenuItem } from "@/lib/fetchers"; // Assuming fetcher exists

type MenuItem = components["schemas"]["MenuItem"];

interface MenuItemTableProps {
  items: MenuItem[];
  onDelete?: (id: string) => void;
}

export function MenuItemTable({ items, onDelete }: MenuItemTableProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const openDeleteModal = (item: MenuItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete?._id) return;
    setLoadingDelete(true);
    try {
      await deleteMenuItem(itemToDelete._id); // Use the correct fetcher
      notifications.show({
        title: "Menu Item Deleted",
        message: `Item "${itemToDelete.name}" deleted successfully.`,
        color: "green",
      });
      closeDeleteModal();
      onDelete?.(itemToDelete._id);
    } catch (error: any) {
      console.error("Failed to delete menu item:", error);
      notifications.show({
        title: "Deletion Failed",
        message: error.response?.data?.message || "Could not delete menu item.",
        color: "red",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const rows = items.map((item) => (
    <Table.Tr key={item._id}>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>{item.category}</Table.Td>
      <Table.Td>{item.price?.toFixed(2)}</Table.Td>
      <Table.Td>
        <Badge color={item.is_active ? "green" : "red"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => router.push(`/menu-items/${item._id}`)} // Adjust path
            title="View Details"
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => router.push(`/menu-items/${item._id}/edit`)} // Adjust path
            title="Edit Item"
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => openDeleteModal(item)}
            title="Delete Item"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Price</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text c="dimmed" ta="center">
                  No menu items found.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteModal}
        onClose={closeDeleteModal}
        title="Confirm Deletion"
        centered
        size="sm"
      >
        <Stack>
          <Text>
            Are you sure you want to delete the menu item "{itemToDelete?.name}
            "? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={closeDeleteModal}
              disabled={loadingDelete}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={loadingDelete}>
              Delete Item
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
