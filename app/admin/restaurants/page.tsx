"use client";

import { Title, Container, Button, Group } from "@mantine/core";
import Link from "next/link";

export default function AdminRestaurantsPage() {
  return (
    <Container>
      <Group justify="space-between" my="lg">
        <Title order={1}>Manage Restaurants</Title>
        <Link href="/admin/restaurants/create" passHref legacyBehavior>
          <Button component="a">Create Restaurant</Button>
        </Link>
      </Group>
      <p>List of restaurants will be displayed here.</p>
      {/* Placeholder for restaurant list/table */}
    </Container>
  );
}
