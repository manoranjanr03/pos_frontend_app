"use client";

import { useEffect, useState } from "react";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import {
  TextInput,
  Button,
  Group,
  Box,
  Select,
  NumberInput,
  Textarea,
  ActionIcon,
  Text,
  SimpleGrid,
  Paper,
  Title,
  LoadingOverlay,
  MultiSelect,
  Checkbox,
  Stack,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { components } from "@/types/swagger";
import {
  getMyRestaurant,
  getMenuItems,
  getCustomers,
  createOrder,
  // updateOrder, // TODO: Implement updateOrder
} from "@/lib/fetchers"; // Assuming updateOrder exists

type Order = components["schemas"]["Order"];
type OrderInput = components["schemas"]["OrderInput"];
type MenuItem = components["schemas"]["MenuItem"];
type Customer = components["schemas"]["Customer"];
type Restaurant = components["schemas"]["Restaurant"];
type OrderItemInput = OrderInput["items"][0]; // Helper type for individual item in form

// Zod schema for form validation, mirroring OrderInput
// Note: restaurant_id and created_by will be set programmatically
const orderItemSchema = z.object({
  menu_item_id: z.string().min(1, "Menu item is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number(), // Store price for calculation convenience
  name: z.string(), // Store name for display convenience
  tax_percentage: z.number().optional().default(0), // Store tax for calculation
  add_ons: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
      })
    )
    .optional()
    .default([]),
});

const orderFormSchema = z.object({
  customer_id: z.string().optional(),
  order_type: z.enum(["dine-in", "takeaway", "delivery", "online"]),
  table_no: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  total_amount: z.number(), // Will be calculated
  tax_amount: z.number().optional().default(0), // Will be calculated
  discount: z.number().min(0).optional().default(0),
  net_amount: z.number(), // Will be calculated
  payment_mode: z
    .enum(["Cash", "Card", "UPI", "Wallet", "Pending"])
    .optional()
    .default("Pending"),
  status: z
    .enum([
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "served",
      "completed",
      "cancelled",
    ])
    .optional()
    .default("pending"),
  notes: z.string().optional(),
  // restaurant_id and created_by are not in the form directly, added before submission
});

interface OrderFormProps {
  order?: Order;
  onSubmitSuccess?: (orderId: string) => void;
}

export default function OrderForm({ order, onSubmitSuccess }: OrderFormProps) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [userId, setUserId] = useState<string | null>("placeholder_user_id"); // Replace with actual auth user ID
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<Omit<OrderInput, "restaurant_id" | "created_by">>({
    initialValues: {
      customer_id: order?.customer_id || "",
      order_type: order?.order_type || "dine-in",
      table_no: order?.table_no || "",
      items:
        order?.items?.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: item.price, // Assuming OrderItem has price
          name: item.name, // Assuming OrderItem has name
          tax_percentage:
            menuItems.find((mi) => mi._id === item.menu_item_id)
              ?.tax_percentage || 0,
          add_ons:
            item.add_ons?.map((ao) => ({
              name: ao.name || "",
              price: ao.price || 0,
            })) || [],
        })) || [],
      total_amount: order?.total_amount || 0,
      tax_amount: order?.tax_amount || 0,
      discount: order?.discount || 0,
      net_amount: order?.net_amount || 0,
      payment_mode: order?.payment_mode || "Pending",
      status: order?.status || "pending",
      notes: order?.notes || "",
    },
    validate: zodResolver(orderFormSchema),
  });

  useEffect(() => {
    async function fetchData() {
      setInitialLoading(true);
      try {
        const restaurantRes = await getMyRestaurant();
        if (restaurantRes.data?.restaurant) {
          const currentRestaurant = restaurantRes.data.restaurant;
          setRestaurant(currentRestaurant);

          if (currentRestaurant._id) {
            const menuItemsRes = await getMenuItems(currentRestaurant._id);
            setMenuItems(menuItemsRes.data?.menuItems || []);

            const customersRes = await getCustomers(); // Fetches for the user's restaurant
            setCustomers(customersRes.data?.customers || []);
          }
        } else {
          notifications.show({
            title: "Error",
            message:
              "Could not load restaurant data. Please ensure you are associated with a restaurant.",
            color: "red",
          });
        }
        // TODO: Fetch actual user ID once auth is implemented
        // setUserId(actualUserId);
      } catch (error) {
        notifications.show({
          title: "Error fetching initial data",
          message:
            error instanceof Error
              ? error.message
              : "Could not load required data for the form.",
          color: "red",
        });
      } finally {
        setInitialLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (order && menuItems.length > 0) {
      form.setValues({
        customer_id: order.customer_id || "",
        order_type: order.order_type || "dine-in",
        table_no: order.table_no || "",
        items:
          order.items?.map((item) => {
            const menuItem = menuItems.find(
              (mi) => mi._id === item.menu_item_id
            );
            return {
              menu_item_id: item.menu_item_id,
              quantity: item.quantity,
              price: menuItem?.price || 0, // Get price from full menu item
              name: menuItem?.name || "Unknown Item", // Get name from full menu item
              tax_percentage: menuItem?.tax_percentage || 0,
              add_ons:
                item.add_ons?.map((ao) => ({
                  name: ao.name || "",
                  price: ao.price || 0,
                })) || [],
            };
          }) || [],
        total_amount: order.total_amount || 0,
        tax_amount: order.tax_amount || 0,
        discount: order.discount || 0,
        net_amount: order.net_amount || 0,
        payment_mode: order.payment_mode || "Pending",
        status: order.status || "pending",
        notes: order.notes || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, menuItems]); // Rerun when order or menuItems are loaded/changed

  useEffect(() => {
    const { items, discount = 0 } = form.values;
    let currentTotal = 0;
    let currentTax = 0;

    items.forEach((item) => {
      const menuItem = menuItems.find((mi) => mi._id === item.menu_item_id);
      if (menuItem) {
        let itemPrice = menuItem.price * (item.quantity || 1); // Added fallback for quantity
        item.add_ons?.forEach((addon) => {
          itemPrice += (addon.price || 0) * (item.quantity || 1); // Added fallback for quantity
        });
        currentTotal += itemPrice;
        currentTax += itemPrice * ((menuItem.tax_percentage || 0) / 100);
      }
    });

    form.setFieldValue("total_amount", parseFloat(currentTotal.toFixed(2)));
    form.setFieldValue("tax_amount", parseFloat(currentTax.toFixed(2)));
    form.setFieldValue(
      "net_amount",
      parseFloat((currentTotal + currentTax - discount).toFixed(2))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.items, form.values.discount, menuItems]);

  const handleAddItem = () => {
    if (menuItems.length > 0) {
      const firstMenuItem = menuItems[0];
      form.insertListItem("items", {
        menu_item_id: firstMenuItem?._id || "",
        quantity: 1,
        price: firstMenuItem?.price || 0,
        name: firstMenuItem?.name || "Select Item",
        tax_percentage: firstMenuItem?.tax_percentage || 0,
        add_ons: [],
      });
    } else {
      notifications.show({
        title: "Cannot Add Item",
        message: "No menu items available to add.",
        color: "yellow",
      });
    }
  };

  const handleSubmit = async (
    values: Omit<OrderInput, "restaurant_id" | "created_by">
  ) => {
    if (!restaurant?._id || !userId) {
      notifications.show({
        title: "Error",
        message: "Restaurant ID or User ID is missing. Cannot submit order.",
        color: "red",
      });
      return;
    }

    const orderData: OrderInput = {
      ...values,
      restaurant_id: restaurant._id,
      created_by: userId,
      // API expects items to be { menu_item_id, quantity, add_ons }
      // total_amount, tax_amount, net_amount are already calculated and part of `values`
      items: values.items.map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        add_ons:
          item.add_ons?.map((ao) => ({ name: ao.name, price: ao.price })) || [],
      })),
    };

    setIsSubmitting(true);
    try {
      let response;
      if (order?._id) {
        // response = await updateOrder(order._id, orderData); // TODO: Implement updateOrder in fetchers.ts
        notifications.show({
          title: "Info",
          message: "Update functionality not yet fully implemented.",
          color: "blue",
        });
        // For now, let's assume update is similar to create for testing
        response = await createOrder(orderData); // Replace with actual update call
      } else {
        response = await createOrder(orderData);
      }

      notifications.show({
        title: order?._id ? "Order Updated" : "Order Created",
        message: `Order ${
          order?._id ? "updated" : "created"
        } successfully! Order ID: ${response.data?.order?._id}`,
        color: "green",
      });
      if (onSubmitSuccess && response.data?.order?._id) {
        onSubmitSuccess(response.data.order._id);
      } else {
        router.push("/orders"); // Fallback redirect
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : `Failed to ${order?._id ? "update" : "create"} order.`,
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerData = customers.map((c) => ({
    value: c._id || "",
    label: `${c.name} (${c.phone})`,
  }));
  const menuItemData = menuItems.map((item) => ({
    value: item._id || "",
    label: item.name || "Unnamed Item",
  }));

  return (
    <Box
      component="form"
      onSubmit={form.onSubmit(handleSubmit)}
      style={{ position: "relative" }}
    >
      <LoadingOverlay visible={initialLoading || isSubmitting} />
      <Paper p="lg" shadow="sm" withBorder>
        <Title order={2} mb="lg">
          {order ? "Edit Order" : "Create New Order"}
        </Title>

        <SimpleGrid
          cols={2}
          spacing="lg"
          breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        >
          <Select
            label="Customer"
            placeholder="Select a customer (optional)"
            data={customerData}
            searchable
            clearable
            {...form.getInputProps("customer_id")}
          />
          <Select
            label="Order Type"
            placeholder="Select order type"
            data={[
              { value: "dine-in", label: "Dine-In" },
              { value: "takeaway", label: "Takeaway" },
              { value: "delivery", label: "Delivery" },
              { value: "online", label: "Online" },
            ]}
            required
            {...form.getInputProps("order_type")}
          />
        </SimpleGrid>

        {form.values.order_type === "dine-in" && (
          <TextInput
            label="Table Number"
            placeholder="Enter table number"
            mt="md"
            {...form.getInputProps("table_no")}
          />
        )}

        <Title order={3} mt="xl" mb="md">
          Order Items
        </Title>
        {form.values.items.map((item, index) => {
          const selectedMenuItem = menuItems.find(
            (mi) => mi._id === item.menu_item_id
          );
          const availableItemAddOns =
            selectedMenuItem?.add_ons?.map((ao) => ({
              value: JSON.stringify(ao), // Store object as string to retrieve both name and price
              label: `${ao.name} (+${ao.price})`,
            })) || [];

          return (
            <Paper key={index} p="md" shadow="xs" withBorder mt="sm">
              <SimpleGrid
                cols={3}
                spacing="sm"
                breakpoints={[{ maxWidth: "md", cols: 1 }]}
              >
                <Select
                  label={`Item ${index + 1}`}
                  placeholder="Select menu item"
                  data={menuItemData}
                  required
                  searchable
                  {...form.getInputProps(`items.${index}.menu_item_id`)}
                  onChange={(value) => {
                    const chosenItem = menuItems.find((mi) => mi._id === value);
                    form.setFieldValue(
                      `items.${index}.menu_item_id`,
                      value || ""
                    );
                    form.setFieldValue(
                      `items.${index}.price`,
                      chosenItem?.price || 0
                    );
                    form.setFieldValue(
                      `items.${index}.name`,
                      chosenItem?.name || "Unknown"
                    );
                    form.setFieldValue(
                      `items.${index}.tax_percentage`,
                      chosenItem?.tax_percentage || 0
                    );
                    form.setFieldValue(`items.${index}.add_ons`, []); // Reset add-ons on item change
                  }}
                />
                <NumberInput
                  label="Quantity"
                  placeholder="Enter quantity"
                  min={1}
                  required
                  {...form.getInputProps(`items.${index}.quantity`)}
                />
                <Box>
                  {" "}
                  {/* Placeholder for item total or actions */}
                  <Text size="sm" fw={500} mt={30}>
                    Price: {selectedMenuItem?.price?.toFixed(2) || "N/A"}
                  </Text>
                </Box>
              </SimpleGrid>
              {selectedMenuItem &&
                selectedMenuItem.add_ons &&
                selectedMenuItem.add_ons.length > 0 && (
                  <Box mt="sm">
                    <Text size="sm" fw={500} mb="xs">
                      Add-ons for {selectedMenuItem.name}:
                    </Text>
                    <Checkbox.Group
                      value={
                        form.values.items[index].add_ons?.map((ao) =>
                          JSON.stringify(ao)
                        ) || []
                      }
                      onChange={(selectedAddOnStrings) => {
                        const selectedFullAddOns = selectedAddOnStrings.map(
                          (s) =>
                            JSON.parse(s) as { name: string; price: number }
                        );
                        form.setFieldValue(
                          `items.${index}.add_ons`,
                          selectedFullAddOns
                        );
                      }}
                    >
                      <Stack>
                        {selectedMenuItem.add_ons.map((addOn, addOnIndex) => (
                          <Checkbox
                            key={addOnIndex}
                            value={JSON.stringify(addOn)}
                            label={`${addOn.name} (+${addOn.price?.toFixed(
                              2
                            )})`}
                          />
                        ))}
                      </Stack>
                    </Checkbox.Group>
                  </Box>
                )}
              <Group position="right" mt="xs">
                <ActionIcon
                  color="red"
                  onClick={() => form.removeListItem("items", index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          );
        })}
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={handleAddItem}
          mt="md"
          variant="outline"
        >
          Add Item
        </Button>

        <Title order={3} mt="xl" mb="md">
          Order Summary
        </Title>
        <Paper p="md" shadow="xs" withBorder>
          <SimpleGrid cols={2}>
            <Text>Subtotal:</Text>
            <Text ta="right">₹{form.values.total_amount.toFixed(2)}</Text>
            <Text>Tax:</Text>
            <Text ta="right">
              ₹{form.values.tax_amount?.toFixed(2) || "0.00"}
            </Text>
          </SimpleGrid>
          <NumberInput
            label="Discount (₹)"
            placeholder="Enter discount amount"
            min={0}
            precision={2}
            mt="sm"
            {...form.getInputProps("discount")}
          />
          <SimpleGrid cols={2} mt="sm">
            <Text fw={700} size="lg">
              Net Amount:
            </Text>
            <Text fw={700} size="lg" ta="right">
              ₹{form.values.net_amount.toFixed(2)}
            </Text>
          </SimpleGrid>
        </Paper>

        <SimpleGrid
          cols={2}
          spacing="lg"
          mt="lg"
          breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        >
          <Select
            label="Payment Mode"
            placeholder="Select payment mode"
            data={[
              { value: "Pending", label: "Pending" },
              { value: "Cash", label: "Cash" },
              { value: "Card", label: "Card" },
              { value: "UPI", label: "UPI" },
              { value: "Wallet", label: "Wallet" },
            ]}
            {...form.getInputProps("payment_mode")}
          />
          <Select
            label="Order Status"
            placeholder="Select order status"
            data={[
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "preparing", label: "Preparing" },
              { value: "ready", label: "Ready for Pickup/Serve" },
              { value: "served", label: "Served (Dine-In)" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            required
            {...form.getInputProps("status")}
          />
        </SimpleGrid>

        <Textarea
          label="Notes"
          placeholder="Any special instructions or notes for the order"
          mt="md"
          minRows={3}
          {...form.getInputProps("notes")}
        />

        <Group position="right" mt="xl">
          <Button variant="default" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {order ? "Update Order" : "Create Order"}
          </Button>
        </Group>
      </Paper>
    </Box>
  );
}
