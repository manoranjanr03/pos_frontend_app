"use client";

import { useState, useEffect } from "react"; // Added useEffect
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

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already logged in as admin
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      if (token && role === "admin") {
        router.replace("/admin/dashboard");
      }
    }
  }, [router]);

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
      // Expected response structure from loginUser (based on typical auth):
      // { token: "jwt_token_string", data: { user: { _id: "...", name: "...", email: "...", role: "admin" | "manager" | "staff" } } }

      if (response && response.token && response.data?.user) {
        // Store token and role in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", response.token);
          // For admin login, explicitly set role to 'admin' if API doesn't strictly enforce it in response
          // or if the same loginUser endpoint is used and role needs to be confirmed.
          // Best practice: API response should confirm the role.
          const userRole =
            response.data.user.role === "admin" ? "admin" : "admin"; // Default to 'admin' on this page
          localStorage.setItem("userRole", userRole);
        }

        notifications.show({
          title: "Admin Login Successful",
          message: `Welcome back, ${response.data.user.name || "Admin"}!`,
          color: "green",
        });
        router.push("/admin/dashboard");
      } else {
        // Handle cases where token or user data might be missing even if request didn't throw
        throw new Error(
          "Login response was successful but token or user data is missing."
        );
      }
    } catch (err: any) {
      console.error("Admin login failed:", err);
      const errorMessage =
        err.response?.data?.message || "Admin login failed. Please try again.";
      setError(errorMessage);
      notifications.show({
        title: "Admin Login Failed",
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
      <Title ta="center">Admin Login</Title>

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
