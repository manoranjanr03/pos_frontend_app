"use client";

import { Title, Container } from "@mantine/core";
// import Link from "next/link"; // No longer needed for this specific link

export default function AdminDashboardPage() {
  return (
    <Container>
      <Title order={1} my="lg">
        Admin Dashboard
      </Title>
      <p>Welcome to the admin dashboard.</p>
      {/* The "Manage Restaurants" link has been removed. */}
      {/* Navigation to restaurant management is now handled by the main GlobalNav. */}
      {/* Add more admin-specific components and functionality here */}
    </Container>
  );
}
