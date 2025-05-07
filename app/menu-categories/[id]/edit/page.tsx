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
  Skeleton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { MenuCategoryForm } from "@/components/MenuCategoryForm"; // Adjust path if needed
import { getMenuCategoryById, updateMenuCategory } from "@/lib/fetchers";
import type { components } from "@/types/swagger";

type MenuCategory = components["schemas"]["MenuCategory"];
type MenuCategoryFormData = Partial<
  components["schemas"]["UpdateMenuCategoryDto"]
>; // Use Update DTO for partial updates

export default function EditMenuCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Get ID from URL

  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [saving, setSaving] = useState(false); // Saving state for form submission
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
        // The response directly contains the category object based on swagger
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

  const handleSubmit = async (values: MenuCategoryFormData) => {
    setSaving(true);
    setError(null);
    try {
      // The update fetcher expects the UpdateMenuCategoryDto type
      const apiData = values as components["schemas"]["UpdateMenuCategoryDto"];
      await updateMenuCategory(id, apiData);
      notifications.show({
        title: "Category Updated",
        message: `Category "${
          values.name || category?.name
        }" updated successfully.`,
        color: "green",
      });
      router.push("/menu-categories"); // Redirect back to the list page
      // Or redirect to the detail page: router.push(`/menu-categories/${id}`);
    } catch (err: any) {
      console.error("Failed to update category:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update category.";
      setError(errorMessage);
      notifications.show({
        title: "Update Failed",
        message: errorMessage,
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbsItems = [
    { title: "Menu Categories", href: "/menu-categories" },
    {
      title: category ? category.name : "Edit",
      href: `/menu-categories/${id}/edit`,
    },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Breadcrumbs mb="lg">{breadcrumbsItems}</Breadcrumbs>
      <Title order={2} mb="lg">
        Edit Menu Category
      </Title>

      <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
        <LoadingOverlay
          visible={loading || saving}
          overlayProps={{ blur: 2 }}
        />

        {error &&
          !loading && ( // Show error only if not loading initial data
            <Alert
              title="Error"
              color="red"
              icon={<IconAlertCircle size="1rem" />}
              mb="lg"
              withCloseButton
              onClose={() => setError(null)} // Allow dismissing submit errors
            >
              {error}
            </Alert>
          )}

        {loading &&
          !error && ( // Show skeleton while loading initial data
            <>
              <Skeleton height={36} mt={6} radius="sm" />
              <Skeleton height={60} mt="md" radius="sm" />
              <Skeleton height={36} mt="md" radius="sm" />
              <Skeleton height={50} mt="md" radius="sm" />
              <Skeleton
                height={36}
                mt="xl"
                width="30%"
                style={{ marginLeft: "auto" }}
                radius="sm"
              />
            </>
          )}

        {!loading &&
          !error &&
          category && ( // Render form once data is loaded
            <MenuCategoryForm
              onSubmit={handleSubmit}
              initialValues={category} // Pass fetched data as initial values
              isLoading={saving}
              submitButtonLabel="Update Category"
            />
          )}
      </Paper>
    </Container>
  );
}
