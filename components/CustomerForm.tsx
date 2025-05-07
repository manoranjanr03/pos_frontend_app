"use client";

import {
  TextInput,
  Button,
  Group,
  Stack,
  Box,
  SimpleGrid,
  Title,
  Textarea,
  Switch,
} from "@mantine/core";
import { useForm, isNotEmpty, isEmail } from "@mantine/form";
import type { components } from "@/types/swagger";

// Types from swagger
type CustomerInput = components["schemas"]["CustomerInput"];
// If loyalty_tier is an enum, you might want to define options for a Select here
// Form data type - Omit restaurant_id as it's passed separately
type CustomerFormData = Omit<CustomerInput, "restaurant_id">;

interface CustomerFormProps {
  onSubmit: (values: CustomerInput) => Promise<void>;
  initialValues?: Partial<CustomerFormData>;
  restaurantId: string;
  isLoading?: boolean;
  submitButtonLabel?: string;
  isEditMode?: boolean;
}

export function CustomerForm({
  onSubmit,
  initialValues = {},
  restaurantId,
  isLoading = false,
  submitButtonLabel = "Save Customer",
  isEditMode = false,
}: CustomerFormProps) {
  const form = useForm<CustomerFormData>({
    initialValues: {
      name: initialValues.name ?? "",
      email: initialValues.email ?? "",
      phone: initialValues.phone ?? "",
    },
    validate: {
      // Name is optional in schema, so no isNotEmpty unless desired for the form
      // name: isNotEmpty("Customer name is required"),
      email: (value) => {
        // Email is optional in schema
        if (value && !isEmail()(value)) return "Invalid email format";
        return null;
      },
      phone: isNotEmpty("Phone number is required"), // Phone is required in schema
    },
  });

  const handleFormSubmit = async (formValues: CustomerFormData) => {
    const submitData: CustomerInput = {
      ...formValues,
      name: formValues.name || undefined, // Ensure name is explicitly undefined if empty, as it's optional
      email: formValues.email || undefined, // Ensure email is explicitly undefined if empty
      phone: formValues.phone, // Phone is required
      restaurant_id: restaurantId,
    };
    await onSubmit(submitData);
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <Title order={3}>Customer Details</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Full Name" // Not required by schema, but can be by form
            placeholder="e.g., John Doe"
            {...form.getInputProps("name")}
            disabled={isLoading}
          />
          <TextInput
            label="Email Address" // Optional
            placeholder="john.doe@example.com"
            type="email"
            {...form.getInputProps("email")}
            disabled={isLoading || (isEditMode && !!initialValues.email)} // Optionally disable email editing
          />
        </SimpleGrid>
        <TextInput
          required // Required by schema
          label="Phone"
          placeholder="+1234567890"
          {...form.getInputProps("phone")}
          disabled={isLoading}
        />
        {/* Removed Address, Loyalty, Preferences, IsActive fields as they are not in CustomerInput */}
        <Group justify="flex-end" mt="xl">
          <Button type="submit" loading={isLoading}>
            {submitButtonLabel}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
