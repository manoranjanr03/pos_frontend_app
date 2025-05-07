"use client";

import { useState } from "react";
import {
  Container,
  Title,
  Paper,
  LoadingOverlay,
  Alert,
  Anchor,
  Breadcrumbs,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MenuCategoryForm } from "@/components/MenuCategoryForm"; // Adjust path if needed
import { createMenuCategory } from "@/lib/fetchers";
import type { components } from "@/types/swagger";

type MenuCategoryFormData = Partial<
  components["schemas"]["CreateMenuCategoryDto"]
>;

export default function CreateMenuCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: MenuCategoryFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure required fields are present (though form validation should handle this)
      if (!values.name) {
        throw new Error("Category name is required.");
      }
      // Cast to the correct type expected by the fetcher
      const apiData = values as components["schemas"]["CreateMenuCategoryDto"];

      await createMenuCategory(apiData);
      notifications.show({
        title: "Category Created",
        message: `Category "${values.name}" created successfully.`,
        color: "green",
      });
      router.push("/menu-categories"); // Redirect back to the list page
      // Optionally, you could redirect to the new category's detail page if the API returns the ID
      // router.push(`/menu-categories/${response._id}`);
    } catch (err: any) {
      console.error("Failed to create category:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to create category.";
      setError(errorMessage);
      notifications.show({
        title: "Creation Failed",
        message: errorMessage,
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbsItems = [
    { title: "Menu Categories", href: "/menu-categories" },
    { title: "Create", href: "/menu-categories/create" },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Breadcrumbs mb="lg">{breadcrumbsItems}</Breadcrumbs>
      <Title order={2} mb="lg">
        Create New Menu Category
      </Title>
      <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
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
        <MenuCategoryForm
          onSubmit={handleSubmit}
          isLoading={loading}
          submitButtonLabel="Create Category"
        />
      </Paper>
    </Container>
  );
}
