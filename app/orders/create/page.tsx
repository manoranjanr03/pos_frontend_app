"use client";

import { Container, Title, Paper } from "@mantine/core";
import { useRouter } from "next/navigation";
import OrderForm from "@/components/OrderForm";
import { notifications } from "@mantine/notifications";

export default function CreateOrderPage() {
  const router = useRouter();

  const handleCreateSuccess = (orderId: string) => {
    notifications.show({
      title: "Order Created",
      message: `Successfully created order ${orderId}. Redirecting to order details...`,
      color: "green",
    });
    router.push(`/orders/${orderId}`);
  };

  return (
    <Container size="md" my="xl">
      <Paper p="lg" shadow="sm" withBorder>
        <Title order={1} mb="xl" ta="center">
          Create New Order
        </Title>
        <OrderForm onSubmitSuccess={handleCreateSuccess} />
      </Paper>
    </Container>
  );
}
