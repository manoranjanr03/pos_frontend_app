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

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already logged in as a restaurant user
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");
      if (token && (role === "manager" || role === "staff")) {
        router.replace("/restaurants"); // Or appropriate dashboard for restaurant users
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
      // Expected response structure from loginUser:
      // { token: "jwt_token_string", data: { user: { _id: "...", name: "...", email: "...", role: "admin" | "manager" | "staff" } } }

      if (
        response &&
        response.token &&
        response.data?.user &&
        response.data.user.role
      ) {
        // Store token and role in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", response.token);
          // Ensure the role is one of the expected non-admin roles
          const userRole =
            response.data.user.role === "manager" ||
            response.data.user.role === "staff"
              ? response.data.user.role
              : "staff"; // Default to 'staff' if role is unexpected for this login type
          localStorage.setItem("userRole", userRole);
        }

        notifications.show({
          title: "Login Successful",
          message: `Welcome back, ${response.data.user.name || "User"}!`,
          color: "green",
        });
        // Redirect based on role, or to a general dashboard for restaurant users
        if (
          response.data.user.role === "manager" ||
          response.data.user.role === "staff"
        ) {
          router.push("/restaurants"); // Or a more specific dashboard if available
        } else {
          // Fallback or error if role is not manager/staff after user login
          console.warn(
            "User logged in with unexpected role:",
            response.data.user.role
          );
          router.push("/"); // Or an error page
        }
      } else {
        throw new Error(
          "Login response was successful but token, user data, or role is missing."
        );
      }
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
