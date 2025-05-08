"use client";

import {
  Title,
  Container,
  Paper,
  Text,
  Button,
  Group,
  List,
  ThemeIcon,
  Stack,
  Divider,
  Alert,
} from "@mantine/core";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getRestaurantUsers, deleteRestaurantUser } from "@/lib/api"; // Assuming getAdminRestaurantById will also be here
import { useEffect, useState } from "react";
import type { components } from "@/types/swagger";
import {
  IconUserCircle,
  IconEdit,
  IconTrash,
  IconAlertCircle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";

type Restaurant = components["schemas"]["Restaurant"]; // Assuming this will be fetched too
type User = components["schemas"]["User"];

export default function AdminRestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string; // This is restaurantId

  // const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [
    openedDeleteModal,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchRestaurantData = async () => {
    if (!id) return;
    // TODO: Fetch restaurant details using getAdminRestaurantById(id)
    // For now, just simulating loading completion for restaurant details
    setLoadingRestaurant(false);

    try {
      setLoadingUsers(true);
      const fetchedUsers = await getRestaurantUsers(id);
      setUsers(
        fetchedUsers.filter(
          (user) => user.role === "manager" || user.role === "staff"
        )
      ); // Filter for relevant roles
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch restaurant users:", err);
      setError(err.message || "Failed to load restaurant users.");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete._id) return;
    try {
      await deleteRestaurantUser(id, userToDelete._id); // id is restaurantId
      notifications.show({
        title: "User Deleted",
        message: `${userToDelete.name} has been successfully deleted.`,
        color: "green",
      });
      setUsers(users.filter((user) => user._id !== userToDelete._id));
      closeDeleteModal();
      setUserToDelete(null);
    } catch (err: any) {
      notifications.show({
        title: "Error Deleting User",
        message: err.message || "Could not delete user.",
        color: "red",
      });
    }
  };

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    openDeleteModal();
  };

  if (loadingRestaurant || loadingUsers)
    return (
      <Container>
        <Text>Loading restaurant details and users...</Text>
      </Container>
    );
  // if (error && !users.length) return <Container><Text color="red">{error}</Text></Container>; // Show general error if users also failed

  return (
    <Container>
      <Title order={1} my="lg">
        {/* Restaurant Name: {restaurant?.name || "Restaurant"} Details */}
        Restaurant Details (ID: {id})
      </Title>

      <Paper p="md" shadow="xs" mb="xl">
        <Title order={3} mb="sm">
          Restaurant Information
        </Title>
        <Text>
          General details for restaurant with ID: {id} will be displayed here.
        </Text>
        {/* Placeholder for actual restaurant details */}
        <Group mt="lg">
          <Link href={`/admin/restaurants/${id}/edit`} passHref legacyBehavior>
            <Button component="a">Edit Restaurant Info</Button>
          </Link>
          {/* Add Delete Restaurant Button with confirmation here */}
        </Group>
      </Paper>

      <Divider
        my="xl"
        label="Restaurant Admins & Staff"
        labelPosition="center"
      />

      {error && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error Loading Users"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <Group justify="space-between" mb="md">
        <Title order={3}>Manage Users</Title>
        <Link
          href={`/admin/restaurants/${id}/admins/create`}
          passHref
          legacyBehavior
        >
          <Button component="a">Add New User</Button>
        </Link>
      </Group>

      {users.length > 0 ? (
        <List
          spacing="xs"
          size="sm"
          center
          icon={
            <ThemeIcon color="teal" size={24} radius="xl">
              <IconUserCircle size="1rem" />
            </ThemeIcon>
          }
        >
          {users.map((user) => (
            <List.Item key={user._id}>
              <Group justify="space-between">
                <Stack gap={0}>
                  <Text fw={500}>{user.name}</Text>
                  <Text size="xs" c="dimmed">
                    {user.email} - Role: {user.role}
                  </Text>
                </Stack>
                <Group>
                  <Link
                    href={`/admin/restaurants/${id}/admins/${user._id}/edit`}
                    passHref
                    legacyBehavior
                  >
                    <Button
                      component="a"
                      variant="subtle"
                      size="xs"
                      leftSection={<IconEdit size={14} />}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => confirmDeleteUser(user)}
                    leftSection={<IconTrash size={14} />}
                  >
                    Delete
                  </Button>
                </Group>
              </Group>
            </List.Item>
          ))}
        </List>
      ) : (
        !loadingUsers &&
        !error && <Text>No managers or staff found for this restaurant.</Text>
      )}

      <Modal
        opened={openedDeleteModal}
        onClose={closeDeleteModal}
        title="Confirm Deletion"
      >
        <Text>Are you sure you want to delete user: {userToDelete?.name}?</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
