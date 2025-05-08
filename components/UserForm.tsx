"use client";

import {
  TextInput,
  PasswordInput,
  Button,
  Group,
  Stack,
  Box,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { components } from "@/types/swagger";

// Using the specific payload for creating a restaurant user (manager/staff)
// from POST /users/restaurant
// This includes name, email, phone, password, role, etc.
// For updates, some fields like password might be optional or handled differently.
export type UserFormData = Partial<
  components["schemas"]["User"] & { password?: string } // Add password for creation
>;

interface UserFormProps {
  onSubmit: (values: UserFormData) => Promise<void>;
  initialValues?: UserFormData;
  isLoading?: boolean;
  isEditing?: boolean; // To conditionally show/require password
  submitButtonLabel?: string;
}

export function UserForm({
  onSubmit,
  initialValues = { role: "staff" }, // Default role to staff
  isLoading = false,
  isEditing = false,
  submitButtonLabel,
}: UserFormProps) {
  const form = useForm<UserFormData>({
    initialValues: {
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      password: "", // Password field for creation, or for changing password
      role: initialValues?.role ?? "staff", // Default to 'staff'
      // profile_image: initialValues?.profile_image ?? "",
      // status: initialValues?.status ?? "active",
    },
    validate: {
      name: (value) =>
        value && value.trim().length > 0 ? null : "Name is required",
      email: (value) => {
        if (!value) return "Email is required";
        if (!/^\S+@\S+$/.test(value)) return "Invalid email format";
        return null;
      },
      password: (value, values) => {
        if (!isEditing && (!value || value.trim().length === 0)) {
          return "Password is required for new users.";
        }
        if (value && value.trim().length > 0 && value.trim().length < 6) {
          return "Password must be at least 6 characters long.";
        }
        return null;
      },
      role: (value) => (value ? null : "Role is required"),
    },
  });

  const handleSubmit = async (values: UserFormData) => {
    const submitData = { ...values };
    if (isEditing && !submitData.password) {
      delete submitData.password; // Don't send empty password on edit unless it's being changed
    }
    await onSubmit(submitData);
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          required
          label="Full Name"
          placeholder="Enter user's full name"
          {...form.getInputProps("name")}
          disabled={isLoading}
        />
        <TextInput
          required
          label="Email Address"
          placeholder="user@example.com"
          type="email"
          {...form.getInputProps("email")}
          disabled={isLoading || isEditing} // Email might not be editable
        />
        <TextInput
          label="Phone Number"
          placeholder="Enter phone number"
          {...form.getInputProps("phone")}
          disabled={isLoading}
        />
        <PasswordInput
          label={isEditing ? "New Password (optional)" : "Password"}
          placeholder={
            isEditing
              ? "Leave blank to keep current password"
              : "Enter password"
          }
          required={!isEditing}
          {...form.getInputProps("password")}
          disabled={isLoading}
        />
        <Select
          required
          label="Role"
          placeholder="Select user role"
          data={[
            { value: "manager", label: "Manager" },
            { value: "staff", label: "Staff" },
            // Add other roles if applicable, e.g., 'admin' for super admin if managed here
          ]}
          {...form.getInputProps("role")}
          disabled={isLoading}
        />
        {/* Add other fields like profile_image, status if needed */}
        <Group justify="flex-end" mt="xl">
          <Button type="submit" loading={isLoading}>
            {submitButtonLabel || (isEditing ? "Update User" : "Create User")}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
