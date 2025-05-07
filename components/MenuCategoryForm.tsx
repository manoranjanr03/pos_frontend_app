"use client";

import {
  TextInput,
  Textarea,
  Switch,
  NumberInput,
  Button,
  Group,
  Stack,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { components } from "@/types/swagger";

// Type for the form values, based on Create DTO but allowing optional fields for edit
type MenuCategoryFormData = Partial<
  components["schemas"]["CreateMenuCategoryDto"]
>;

interface MenuCategoryFormProps {
  onSubmit: (values: MenuCategoryFormData) => Promise<void>;
  initialValues?: MenuCategoryFormData;
  isLoading?: boolean;
  submitButtonLabel?: string;
}

export function MenuCategoryForm({
  onSubmit,
  initialValues = {
    name: "",
    description: "",
    is_active: true,
    display_order: 0,
  },
  isLoading = false,
  submitButtonLabel = "Save Category",
}: MenuCategoryFormProps) {
  const form = useForm<MenuCategoryFormData>({
    initialValues: {
      name: initialValues.name ?? "",
      description: initialValues.description ?? "",
      is_active: initialValues.is_active ?? true,
      display_order: initialValues.display_order ?? 0,
    },
    validate: {
      name: (value) =>
        value && value.trim().length > 0 ? null : "Category name is required",
      display_order: (value) =>
        value !== undefined && value >= 0
          ? null
          : "Display order must be 0 or greater",
    },
  });

  const handleSubmit = async (values: MenuCategoryFormData) => {
    await onSubmit(values);
    // Optionally reset form after successful submission if needed
    // form.reset();
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          required
          label="Category Name"
          placeholder="e.g., Appetizers, Main Course"
          {...form.getInputProps("name")}
          disabled={isLoading}
        />
        <Textarea
          label="Description"
          placeholder="Optional description for the category"
          {...form.getInputProps("description")}
          disabled={isLoading}
        />
        <NumberInput
          label="Display Order"
          description="Order in which category appears (lower numbers first)"
          placeholder="0"
          min={0}
          step={1}
          {...form.getInputProps("display_order")}
          disabled={isLoading}
        />
        <Switch
          label="Active Category"
          description="Inactive categories won't be shown on menus."
          {...form.getInputProps("is_active", { type: "checkbox" })}
          disabled={isLoading}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={isLoading}>
            {submitButtonLabel}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
