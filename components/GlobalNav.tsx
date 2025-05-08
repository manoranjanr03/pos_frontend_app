"use client";

import { AppShell, Burger, Group, NavLink, Title, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { useEffect, useState } from "react"; // For mock auth

// Mock auth hook - replace with your actual auth logic
const useAuth = () => {
  // Simulate fetching user role, e.g., from localStorage or context
  const [userRole, setUserRole] = useState<string | null>(null); // 'admin', 'manager', 'staff', or null
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname(); // Get pathname here for the effect
  const router = useRouter(); // For navigation

  useEffect(() => {
    // This is a placeholder. In a real app, you'd check a token, context, etc.
    // For testing, you can manually set it in localStorage and read here.
    const storedRole =
      typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (token && storedRole) {
      setUserRole(storedRole);
      setIsAuthenticated(true);
    } else {
      setUserRole(null);
      setIsAuthenticated(false);
    }
  }, [pathname]); // Re-check on route change for login/logout simulation

  // Mock logout function to clear role (for testing)
  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole");
      localStorage.removeItem("authToken");
    }
    setUserRole(null);
    setIsAuthenticated(false);
    router.push("/auth/login"); // Redirect to main login page after logout
  };

  // Mock login function (for testing)
  // In a real app, role comes from backend upon login
  const loginAsAdmin = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("authToken", "fake-admin-token"); // Simulate token
    }
    setUserRole("admin");
    setIsAuthenticated(true);
    router.push("/auth/admin/login"); // Navigate to admin login
  };
  const loginAsRestaurantUser = () => {
    // Renamed from loginAsManager
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", "manager"); // Still using 'manager' role for simulation
      localStorage.setItem("authToken", "fake-manager-token");
    }
    setUserRole("manager"); // Simulate as manager
    setIsAuthenticated(true);
    router.push("/auth/login"); // Navigate to user login
  };

  return {
    userRole,
    isAuthenticated,
    logout,
    // loginAsAdmin, // No longer returning test functions
    // loginAsRestaurantUser, // No longer returning test functions
  };
};

const allNavLinks = [
  // Login links are removed from here as per feedback.
  // Unauthenticated users will not see any nav links from this list.
  // Authenticated: Restaurant User (manager/staff)
  { href: "/restaurants", label: "My Restaurant", roles: ["manager", "staff"] },
  {
    href: "/menu-categories",
    label: "Menu Categories",
    roles: ["manager", "staff"],
  },
  { href: "/menu-items", label: "Menu Items", roles: ["manager", "staff"] },
  { href: "/orders", label: "Orders", roles: ["manager", "staff"] },
  { href: "/customers", label: "Customers", roles: ["manager", "staff"] },
  // Authenticated: Super Admin
  { href: "/admin/dashboard", label: "Admin Dashboard", roles: ["admin"] },
  { href: "/admin/restaurants", label: "Restaurants", roles: ["admin"] },
];

export function GlobalNav({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const {
    userRole,
    isAuthenticated,
    logout,
    // loginAsAdmin, // Test functions no longer used here
    // loginAsRestaurantUser,
  } = useAuth(); // Use the mock auth hook

  const getVisibleNavLinks = () => {
    if (!isAuthenticated || !userRole) {
      return allNavLinks.filter((link) => link.roles === null);
    }
    return allNavLinks.filter(
      (link) => link.roles && link.roles.includes(userRole)
    );
  };

  const visibleNavLinks = getVisibleNavLinks();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Title order={3}>POS System</Title>
            </Link>
          </Group>
          <Group>
            {/* Test login/logout buttons removed */}
            {isAuthenticated && (
              <Button onClick={logout} size="xs" variant="outline">
                Logout
              </Button>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Conditionally render the Navbar only if authenticated */}
      {isAuthenticated && (
        <AppShell.Navbar p="md">
          {visibleNavLinks.length > 0 &&
            visibleNavLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                component={Link}
                active={pathname === link.href}
                onClick={toggle} // Close navbar on mobile after click
              />
            ))}
        </AppShell.Navbar>
      )}

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
