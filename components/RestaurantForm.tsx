"use client";

import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Box,
  SimpleGrid,
  MultiSelect,
  Title,
  Divider, // Added
  PasswordInput, // Added
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { components, paths } from "@/types/swagger";

// Define the form data type. It needs to accommodate both restaurant fields
// and potentially owner fields for the admin create scenario.
export type RestaurantAndOwnerFormData = // Added export
  paths["/restaurants/my-restaurant"]["patch"]["requestBody"]["content"]["application/json"] & {
    owner_name?: string;
    owner_email?: string;
    owner_password?: string;
  };

interface RestaurantFormProps {
  onSubmit: (values: RestaurantAndOwnerFormData) => Promise<void>; // Use combined type
  initialValues?: Partial<RestaurantAndOwnerFormData>; // Use combined type
  isLoading?: boolean;
  submitButtonLabel?: string;
  showOwnerFields?: boolean; // New prop to control owner fields visibility
}

export function RestaurantForm({
  onSubmit,
  initialValues = {},
  isLoading = false,
  submitButtonLabel = "Save Restaurant",
  showOwnerFields = false, // Default to false
}: RestaurantFormProps) {
  // Use the combined type for the form
  const form = useForm<RestaurantAndOwnerFormData>({
    initialValues: {
      // Restaurant fields
      name: initialValues.name ?? "",
      description: initialValues.description ?? "",
      contact: {
        phone: initialValues.contact?.phone ?? "",
        email: initialValues.contact?.email ?? "",
        website: initialValues.contact?.website ?? "",
      },
      address: {
        street: initialValues.address?.street ?? "",
        city: initialValues.address?.city ?? "",
        state: initialValues.address?.state ?? "",
        postal_code: initialValues.address?.postal_code ?? "",
        country: initialValues.address?.country ?? "",
      },
      cuisine_types: initialValues.cuisine_types ?? [],
      payment_options: initialValues.payment_options ?? [],
      images: initialValues.images ?? [],
      // operating_hours: initialValues.operating_hours ?? {}, // Omitted for simplicity

      // Owner fields (only relevant if showOwnerFields is true)
      owner_name: initialValues.owner_name ?? "",
      owner_email: initialValues.owner_email ?? "",
      owner_password: "", // Always start empty for password field
    },
    validate: {
      // Restaurant validations
      name: (value) =>
        value && value.trim().length > 0 ? null : "Restaurant name is required",
      contact: {
        email: (value) =>
          value && /^\S+@\S+$/.test(value) ? null : "Invalid email format",
      },

      // Owner validations (only apply if fields are shown)
      owner_name: (value) =>
        showOwnerFields && (!value || value.trim().length === 0)
          ? "Owner name is required"
          : null,
      owner_email: (value) => {
        if (!showOwnerFields) return null;
        if (!value || value.trim().length === 0)
          return "Owner email is required";
        if (!/^\S+@\S+$/.test(value)) return "Invalid owner email format";
        return null;
      },
      owner_password: (value) => {
        if (!showOwnerFields) return null;
        if (!value || value.trim().length === 0)
          return "Owner password is required";
        if (value.trim().length < 6)
          return "Owner password must be at least 6 characters";
        return null;
      },
    },
  });

  // Handler for MultiSelect which expects string[]
  const handleMultiSelectChange =
    (field: keyof RestaurantAndOwnerFormData) => (value: string[]) => {
      form.setFieldValue(field, value);
    };

  // Internal handler to prepare data before calling the passed onSubmit
  const handleSubmitInternal = async (values: RestaurantAndOwnerFormData) => {
    const submitData: RestaurantAndOwnerFormData = {
      name: values.name,
      description: values.description,
      contact: values.contact,
      address: values.address,
      cuisine_types: values.cuisine_types,
      payment_options: values.payment_options,
      images: values.images,
      // operating_hours: values.operating_hours, // Add if implemented
    };
    // Include owner fields if they were shown/filled
    if (showOwnerFields) {
      submitData.owner_name = values.owner_name;
      submitData.owner_email = values.owner_email;
      submitData.owner_password = values.owner_password;
    }
    await onSubmit(submitData); // Call the passed onSubmit prop
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmitInternal)}>
      <Stack>
        {/* Restaurant Fields */}
        <Title order={3}>Restaurant Information</Title>
        <TextInput
          required
          label="Restaurant Name"
          placeholder="Your restaurant's name"
          {...form.getInputProps("name")}
          disabled={isLoading}
        />
        <Textarea
          label="Description"
          placeholder="Describe your restaurant"
          {...form.getInputProps("description")}
          disabled={isLoading}
          rows={4}
        />
        <MultiSelect
          label="Cuisine Types"
          placeholder="Select or type cuisines (e.g., Italian, Indian)"
          data={form.values.cuisine_types ?? []} // Allow adding new ones
          value={form.values.cuisine_types ?? []}
          onChange={handleMultiSelectChange("cuisine_types")}
          searchable
          disabled={isLoading}
        />

        <Title order={3} mt="lg">
          Restaurant Contact Details
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Phone Number"
            placeholder="Contact phone"
            {...form.getInputProps("contact.phone")}
            disabled={isLoading}
          />
          <TextInput
            label="Email Address"
            placeholder="Contact email"
            type="email"
            {...form.getInputProps("contact.email")}
            disabled={isLoading}
          />
          <TextInput
            label="Website"
            placeholder="https://your-restaurant.com"
            type="url"
            {...form.getInputProps("contact.website")}
            disabled={isLoading}
          />
        </SimpleGrid>

        <Title order={3} mt="lg">
          Restaurant Address
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Street Address"
            placeholder="123 Main St"
            {...form.getInputProps("address.street")}
            disabled={isLoading}
          />
          <TextInput
            label="City"
            placeholder="City name"
            {...form.getInputProps("address.city")}
            disabled={isLoading}
          />
          <TextInput
            label="State / Province"
            placeholder="State or Province"
            {...form.getInputProps("address.state")}
            disabled={isLoading}
          />
          <TextInput
            label="Postal Code"
            placeholder="ZIP or Postal Code"
            {...form.getInputProps("address.postal_code")}
            disabled={isLoading}
          />
          <TextInput
            label="Country"
            placeholder="Country name"
            {...form.getInputProps("address.country")}
            disabled={isLoading}
          />
        </SimpleGrid>

        <Title order={3} mt="lg">
          Restaurant Options
        </Title>
        <MultiSelect
          label="Payment Options Accepted"
          placeholder="Select or type options (e.g., Card, UPI, Cash)"
          data={form.values.payment_options ?? []}
          value={form.values.payment_options ?? []}
          onChange={handleMultiSelectChange("payment_options")}
          searchable
          disabled={isLoading}
        />
        {/* Add Image Upload/Management Here */}
        {/* Add Operating Hours Input Here */}

        {/* Owner Fields (Conditional) */}
        {showOwnerFields && (
          <>
            <Divider
              my="xl"
              label="Restaurant Owner/Admin Details"
              labelPosition="center"
            />
            <TextInput
              required
              label="Owner Full Name"
              placeholder="Enter owner's full name"
              {...form.getInputProps("owner_name")}
              disabled={isLoading}
            />
            <TextInput
              required
              label="Owner Email Address"
              placeholder="owner@example.com"
              type="email"
              {...form.getInputProps("owner_email")}
              disabled={isLoading}
            />
            <PasswordInput
              required
              label="Owner Password"
              placeholder="Enter owner's initial password"
              {...form.getInputProps("owner_password")}
              disabled={isLoading}
            />
          </>
        )}

        <Group justify="flex-end" mt="xl">
          <Button type="submit" loading={isLoading}>
            {submitButtonLabel}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
