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
  SimpleGrid,
  Select,
  ActionIcon,
  Title,
  Text,
} from "@mantine/core";
import { useForm, isNotEmpty, isEmail } from "@mantine/form";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import type { components } from "@/types/swagger";

// Types from swagger
type MenuItemInput = components["schemas"]["MenuItemInput"];
type MenuItemVariant = components["schemas"]["MenuItemVariant"];
type MenuItemAddOn = components["schemas"]["MenuItemAddOn"];
type MenuCategory = components["schemas"]["MenuCategory"]; // Needed for category select

// Form data type - closely matches MenuItemInput but might omit restaurant_id initially
// We'll add restaurant_id before submitting in the parent page component.
type MenuItemFormData = Omit<MenuItemInput, "restaurant_id">;

interface MenuItemFormProps {
  onSubmit: (values: MenuItemInput) => Promise<void>; // onSubmit expects the full MenuItemInput
  initialValues?: Partial<MenuItemFormData>;
  categories: MenuCategory[]; // Pass categories for the Select input
  restaurantId: string; // Pass restaurantId to be added on submit
  isLoading?: boolean;
  submitButtonLabel?: string;
}

export function MenuItemForm({
  onSubmit,
  initialValues = {},
  categories = [],
  restaurantId,
  isLoading = false,
  submitButtonLabel = "Save Menu Item",
}: MenuItemFormProps) {
  // Ensure categories have names and map to the expected { value: string, label: string } structure
  const categoryOptions = categories
    .filter((cat): cat is MenuCategory & { name: string } => !!cat.name) // Type guard
    .map((cat) => ({
      value: cat.name, // cat.name is now guaranteed to be string
      label: cat.name,
    }));

  const form = useForm<MenuItemFormData>({
    initialValues: {
      name: initialValues.name ?? "",
      category: initialValues.category ?? "",
      price: initialValues.price ?? 0,
      tax_percentage: initialValues.tax_percentage ?? 0,
      variants: initialValues.variants ?? [],
      add_ons: initialValues.add_ons ?? [],
      is_active: initialValues.is_active ?? true,
    },
    validate: {
      name: isNotEmpty("Menu item name is required"),
      category: isNotEmpty("Category is required"),
      price: (value) =>
        value !== undefined && value >= 0 ? null : "Price must be 0 or greater",
      tax_percentage: (value) =>
        value !== undefined && value >= 0
          ? null
          : "Tax percentage must be 0 or greater",
      variants: {
        name: isNotEmpty("Variant name cannot be empty"),
        price: (value) =>
          value !== undefined && value >= 0
            ? null
            : "Variant price must be 0 or greater",
      },
      add_ons: {
        name: isNotEmpty("Add-on name cannot be empty"),
        price: (value) =>
          value !== undefined && value >= 0
            ? null
            : "Add-on price must be 0 or greater",
      },
    },
  });

  // --- Variants Handling ---
  const variantFields = form.values.variants?.map((item, index) => (
    <Group key={index} mt="xs" grow>
      <TextInput
        placeholder="Variant Name (e.g., Half, Full)"
        required
        {...form.getInputProps(`variants.${index}.name`)}
      />
      <NumberInput
        placeholder="Variant Price"
        required
        min={0}
        step={0.01} // For currency
        {...form.getInputProps(`variants.${index}.price`)}
      />
      <ActionIcon
        color="red"
        onClick={() => form.removeListItem("variants", index)}
      >
        <IconTrash size="1rem" />
      </ActionIcon>
    </Group>
  ));

  // --- Add-ons Handling ---
  const addOnFields = form.values.add_ons?.map((item, index) => (
    <Group key={index} mt="xs" grow>
      <TextInput
        placeholder="Add-on Name (e.g., Extra Cheese)"
        required
        {...form.getInputProps(`add_ons.${index}.name`)}
      />
      <NumberInput
        placeholder="Add-on Price"
        required
        min={0}
        step={0.01}
        {...form.getInputProps(`add_ons.${index}.price`)}
      />
      <ActionIcon
        color="red"
        onClick={() => form.removeListItem("add_ons", index)}
      >
        <IconTrash size="1rem" />
      </ActionIcon>
    </Group>
  ));

  const handleSubmit = async (values: MenuItemFormData) => {
    const submitData: MenuItemInput = {
      ...values,
      restaurant_id: restaurantId, // Add the restaurant ID
    };
    await onSubmit(submitData);
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Title order={3}>Basic Details</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            required
            label="Item Name"
            placeholder="e.g., Paneer Butter Masala"
            {...form.getInputProps("name")}
            disabled={isLoading}
          />
          <Select
            required
            label="Category"
            placeholder="Select category"
            data={categoryOptions}
            {...form.getInputProps("category")}
            disabled={isLoading || categories.length === 0}
            searchable
          />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <NumberInput
            required
            label="Base Price"
            placeholder="Enter base price"
            min={0}
            step={0.01}
            {...form.getInputProps("price")}
            disabled={isLoading}
          />
          <NumberInput
            label="Tax Percentage (%)"
            placeholder="e.g., 5 for 5%"
            min={0}
            step={0.1}
            {...form.getInputProps("tax_percentage")}
            disabled={isLoading}
          />
        </SimpleGrid>
        <Switch
          mt="md"
          label="Active Item"
          description="Inactive items won't be available for ordering."
          {...form.getInputProps("is_active", { type: "checkbox" })}
          disabled={isLoading}
        />

        {/* Variants Section */}
        <Title order={4} mt="lg">
          Variants (Optional)
        </Title>
        <Text size="sm" c="dimmed">
          Define different sizes or versions (e.g., Half/Full, Small/Large). If
          none, the base price is used.
        </Text>
        {variantFields && variantFields.length > 0 && (
          <Stack mt="xs">{variantFields}</Stack>
        )}
        <Group mt="sm">
          <Button
            leftSection={<IconPlus size="1rem" />}
            variant="light"
            onClick={() =>
              form.insertListItem("variants", { name: "", price: 0 })
            }
          >
            Add Variant
          </Button>
        </Group>

        {/* Add-ons Section */}
        <Title order={4} mt="lg">
          Add-ons (Optional)
        </Title>
        <Text size="sm" c="dimmed">
          Define optional additions customers can choose (e.g., Extra Cheese,
          Toppings).
        </Text>
        {addOnFields && addOnFields.length > 0 && (
          <Stack mt="xs">{addOnFields}</Stack>
        )}
        <Group mt="sm">
          <Button
            leftSection={<IconPlus size="1rem" />}
            variant="light"
            onClick={() =>
              form.insertListItem("add_ons", { name: "", price: 0 })
            }
          >
            Add Add-on
          </Button>
        </Group>

        <Group justify="flex-end" mt="xl">
          <Button type="submit" loading={isLoading}>
            {submitButtonLabel}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
