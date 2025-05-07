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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { components, paths } from "@/types/swagger"; // Import paths

// Define the correct type based on the PATCH request body schema
type UpdateMyRestaurantFormData =
  paths["/restaurants/my-restaurant"]["patch"]["requestBody"]["content"]["application/json"];

interface RestaurantFormProps {
  onSubmit: (values: UpdateMyRestaurantFormData) => Promise<void>; // Use correct type
  initialValues?: Partial<UpdateMyRestaurantFormData>; // Use correct type
  isLoading?: boolean;
  submitButtonLabel?: string;
}

export function RestaurantForm({
  onSubmit,
  initialValues = {},
  isLoading = false,
  submitButtonLabel = "Save Restaurant",
}: RestaurantFormProps) {
  // Use the correct, more specific type for the form
  const form = useForm<UpdateMyRestaurantFormData>({
    initialValues: {
      // Ensure initial values match the UpdateMyRestaurantFormData structure
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
        // geo_location might need separate handling if editable
      },
      cuisine_types: initialValues.cuisine_types ?? [],
      payment_options: initialValues.payment_options ?? [],
      // images might need a file upload component
      images: initialValues.images ?? [],
      // Operating hours need a more complex input structure, omitting for simplicity for now
      // operating_hours: initialValues.operating_hours ?? {},
      // owner_id and status are usually not editable by the restaurant manager directly
    },
    validate: {
      name: (value) =>
        value && value.trim().length > 0 ? null : "Restaurant name is required",
      contact: {
        email: (value) =>
          value && /^\S+@\S+$/.test(value) ? null : "Invalid email format",
        // Add other contact validations if needed
      },
      // Add other validations as needed
    },
  });

  // Handler for MultiSelect which expects string[]
  // Adjust the keyof type to the new form data type
  const handleMultiSelectChange =
    (field: keyof UpdateMyRestaurantFormData) => (value: string[]) => {
      form.setFieldValue(field, value);
    };

  // Update handleSubmit parameter type
  const handleSubmit = async (values: UpdateMyRestaurantFormData) => {
    // Filter out potentially non-editable fields if necessary before submitting
    // Casting might not be needed if the form type matches the submit type exactly
    const submitData = {
      name: values.name,
      description: values.description,
      contact: values.contact,
      address: values.address,
      cuisine_types: values.cuisine_types,
      payment_options: values.payment_options,
      images: values.images,
      // operating_hours: values.operating_hours, // Add if implemented
    };
    // Use the correct type in onSubmit call
    await onSubmit(submitData);
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Title order={3}>Basic Information</Title>
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
          Contact Details
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
          Address
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
          Options
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

        <Group justify="flex-end" mt="xl">
          <Button type="submit" loading={isLoading}>
            {submitButtonLabel}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
