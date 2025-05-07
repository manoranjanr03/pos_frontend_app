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
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPencil, IconTrash, IconEye } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { components } from "@/types/swagger"; // Import generated types
import { deleteMenuCategory } from "@/lib/fetchers"; // Import the delete fetcher

type MenuCategory = components["schemas"]["MenuCategory"];

interface MenuCategoryTableProps {
  categories: MenuCategory[];
  onDelete?: (id: string) => void; // Optional callback after deletion
}

export function MenuCategoryTable({
  categories,
  onDelete,
}: MenuCategoryTableProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(
    null
  );
  const [loadingDelete, setLoadingDelete] = useState(false);

  const openDeleteModal = (category: MenuCategory) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!categoryToDelete?._id) return;
    setLoadingDelete(true);
    try {
      await deleteMenuCategory(categoryToDelete._id);
      notifications.show({
        title: "Category Deleted",
        message: `Category "${categoryToDelete.name}" deleted successfully.`,
        color: "green",
      });
      closeDeleteModal();
      onDelete?.(categoryToDelete._id); // Trigger callback if provided
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      notifications.show({
        title: "Deletion Failed",
        message: error.response?.data?.message || "Could not delete category.",
        color: "red",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const rows = categories.map((category) => (
    <Table.Tr key={category._id}>
      <Table.Td>{category.name}</Table.Td>
      <Table.Td>{category.description || "-"}</Table.Td>
      <Table.Td>{category.is_active ? "Yes" : "No"}</Table.Td>
      <Table.Td>{category.display_order}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => router.push(`/menu-categories/${category._id}`)}
            title="View Details"
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => router.push(`/menu-categories/${category._id}/edit`)}
            title="Edit Category"
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => openDeleteModal(category)}
            title="Delete Category"
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
            <Table.Th>Description</Table.Th>
            <Table.Th>Active</Table.Th>
            <Table.Th>Display Order</Table.Th>
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
                  No categories found.
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
            Are you sure you want to delete the category "
            {categoryToDelete?.name}"? This action cannot be undone.
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
              Delete Category
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
