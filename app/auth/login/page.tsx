"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { loginUser } from "@/lib/fetchers"; // Assuming alias is set up

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(values);
      // Add checks for response data and user
      if (response?.data?.user?.name) {
        notifications.show({
          title: "Login Successful",
          message: `Welcome back, ${response.data.user.name}!`,
          color: "green",
        });
      } else {
        // Handle case where user name might be missing in response, though unlikely on success
        notifications.show({
          title: "Login Successful",
          message: `Welcome back!`,
          color: "green",
        });
      }
      // Redirect to a protected dashboard page after successful login
      router.push("/restaurants"); // Adjust redirect path as needed
    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
      notifications.show({
        title: "Login Failed",
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
      <Title ta="center">Welcome back!</Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && (
              <Alert
                title="Login Error"
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
            <Button type="submit" fullWidth mt="xl" disabled={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
