"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  LoadingOverlay,
  Stack,
  Alert,
  Anchor,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { registerUser } from "@/lib/fetchers";
import type { components } from "@/types/swagger"; // Import types

// Use the UserInput type, but omit fields not suitable for self-registration
type RegisterFormValues = Pick<
  components["schemas"]["UserInput"],
  "name" | "email" | "password"
> & { confirmPassword?: string }; // Add confirmPassword for validation

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    // Omit confirmPassword before sending to API
    const { confirmPassword, ...apiData } = values;

    // Add default role and potentially restaurant ID if required by API for basic registration
    // This might need adjustment based on actual API behavior for self-registration
    const registrationData = {
      ...apiData,
      role: "staff", // Default role, adjust if needed
      // restaurant_id: 'DEFAULT_RESTAURANT_ID', // This likely needs a proper value or backend handling
    } as components["schemas"]["UserInput"]; // Cast to the full type expected by API

    try {
      // The API expects the full UserInput, including role and restaurant_id.
      // We need to provide defaults or adjust the API/fetcher if self-registration
      // doesn't require these immediately. For now, sending defaults.
      // A real app might need a different flow (e.g., invite system).

      // TEMPORARY FIX: Need a valid restaurant_id for the UserInput schema.
      // In a real scenario, this would come from context or a selection.
      // Using a placeholder - THIS WILL LIKELY FAIL without a valid ID.
      if (!registrationData.restaurant_id) {
        registrationData.restaurant_id = "60f7e1b9b5a5f3a9c8b5c8a6"; // Placeholder ID
        console.warn(
          "Using placeholder restaurant_id for registration. This needs proper handling."
        );
      }

      await registerUser(registrationData);
      notifications.show({
        title: "Registration Successful",
        message: "You can now log in with your credentials.",
        color: "green",
      });
      router.push("/auth/login"); // Redirect to login page
    } catch (err: any) {
      console.error("Registration failed:", err);
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      notifications.show({
        title: "Registration Failed",
        message: errorMessage,
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Create Account</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{" "}
        <Anchor component={Link} href="/auth/login" size="sm">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && (
              <Alert
                title="Registration Error"
                color="red"
                icon={<IconAlertCircle size="1rem" />}
                withCloseButton
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            <TextInput
              required
              label="Name"
              placeholder="Your name"
              {...form.getInputProps("name")}
            />
            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              {...form.getInputProps("password")}
            />
            <PasswordInput
              required
              label="Confirm Password"
              placeholder="Confirm password"
              {...form.getInputProps("confirmPassword")}
            />
            <Button type="submit" fullWidth mt="xl" disabled={loading}>
              Register
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
