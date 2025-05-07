"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Paper,
  LoadingOverlay,
  Alert,
  Anchor,
  Breadcrumbs,
  Text,
  Group,
  Button,
  Skeleton,
  Stack,
  Badge,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconPencil,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getMenuCategoryById } from "@/lib/fetchers";
import type { components } from "@/types/swagger";

type MenuCategory = components["schemas"]["MenuCategory"];

export default function MenuCategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Category ID is missing.");
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMenuCategoryById(id);
        setCategory(response);
      } catch (err: any) {
        console.error("Failed to fetch category:", err);
        setError(
          err.response?.data?.message || "Failed to load category details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const breadcrumbsItems = [
    { title: "Menu Categories", href: "/menu-categories" },
    {
      title: category ? category.name : "Details",
      href: `/menu-categories/${id}`,
    },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Breadcrumbs mb="lg">{breadcrumbsItems}</Breadcrumbs>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Category Details</Title>
        <Group>
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => router.push("/menu-categories")}
          >
            Back to List
          </Button>
          <Button
            leftSection={<IconPencil size={14} />}
            onClick={() => router.push(`/menu-categories/${id}/edit`)}
            disabled={!category || loading}
          >
            Edit Category
          </Button>
        </Group>
      </Group>

      <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

        {error && (
          <Alert
            title="Error"
            color="red"
            icon={<IconAlertCircle size="1rem" />}
            mb="lg"
          >
            {error}
          </Alert>
        )}

        {loading &&
          !error && ( // Skeleton loader
            <Stack>
              <Skeleton height={20} width="30%" radius="sm" />
              <Skeleton height={16} mt={4} width="60%" radius="sm" />
              <Skeleton height={16} mt="md" width="20%" radius="sm" />
              <Skeleton height={16} mt={4} width="10%" radius="sm" />
              <Skeleton height={16} mt="md" width="25%" radius="sm" />
              <Skeleton height={16} mt={4} width="15%" radius="sm" />
            </Stack>
          )}

        {!loading && !error && category && (
          <Stack gap="sm">
            <Group>
              <Text fw={500}>Name:</Text>
              <Text>{category.name}</Text>
            </Group>
            <Group align="flex-start">
              <Text fw={500}>Description:</Text>
              <Text>
                {category.description || <Text c="dimmed">Not provided</Text>}
              </Text>
            </Group>
            <Group>
              <Text fw={500}>Status:</Text>
              <Badge color={category.is_active ? "green" : "red"}>
                {category.is_active ? "Active" : "Inactive"}
              </Badge>
            </Group>
            <Group>
              <Text fw={500}>Display Order:</Text>
              <Text>{category.display_order}</Text>
            </Group>
            <Group>
              <Text fw={500}>Created At:</Text>
              <Text>{new Date(category.createdAt ?? "").toLocaleString()}</Text>
            </Group>
            <Group>
              <Text fw={500}>Last Updated:</Text>
              <Text>{new Date(category.updatedAt ?? "").toLocaleString()}</Text>
            </Group>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
