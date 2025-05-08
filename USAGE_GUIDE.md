# POS Frontend Application Usage Guide

This guide provides instructions on how to run and use the POS (Point of Sale) frontend application.

## 1. Prerequisites

- Node.js and npm (or yarn) installed on your system.
- The project dependencies installed (run `npm install` or `yarn install` in the project root if you haven't already).

## 2. Running the Application

To start the development server, navigate to the project's root directory in your terminal and run:

```bash
npm run dev
```

Or, if you are using yarn:

```bash
yarn dev
```

Once the server starts, it will typically output the local URL where the application is accessible (usually `http://localhost:3000`).

## 3. Accessing the Application

Open your web browser and navigate to `http://localhost:3000`.

- The application will automatically redirect you to the **User Login** page (`/auth/login`).

## 4. User Login

- Navigate to `http://localhost:3000/auth/login` (or be redirected there automatically).
- You will see a login form with "Welcome back!" as the title.
- Enter your registered email and password.
- Click the "Sign in" button.
- Upon successful login, you will be redirected to the `/restaurants` page, where you can manage restaurant information.

## 5. Admin Login

- Navigate to `http://localhost:3000/auth/admin/login`.
- You will see a login form with "Admin Login" as the title.
- Enter your admin email and password.
- Click the "Sign in" button.
- Upon successful login, you will be redirected to the **Admin Dashboard** (`/admin/dashboard`).

## 6. Admin Dashboard

- The Admin Dashboard is accessible at `/admin/dashboard` after a successful admin login.
- This section is intended for administrative tasks and provides an overview or tools for managing the application.
- Currently, it's a basic page stating "Welcome to the admin dashboard."

## 7. Key Sections and Navigation

- **`/` (Root Path):** Redirects to `/auth/login`.
- **`/auth/login`:** User login page. Redirects to `/restaurants` on success.
- **`/auth/register`:** User registration page (if implemented and linked).
- **`/auth/admin/login`:** Admin login page. Redirects to `/admin/dashboard` on success.
- **`/restaurants`:** Main page for regular users after login, likely for viewing or managing restaurant data.
- **`/admin/dashboard`:** Main page for admin users after login.
- Other sections like `/customers`, `/menu-categories`, `/menu-items`, `/orders` are present in the application structure and likely represent different modules of the POS system, accessible via navigation within the application after login.

## 8. Troubleshooting

- **Hydration Errors in Console:** You might see "A tree hydrated but some attributes of the server rendered HTML didn't match..." errors in the browser console. These are common in Next.js/React development and usually don't break core functionality. They often relate to differences between server-side and client-side rendering of dynamic content (like dates) or browser extensions.
- **Page Not Found (404):** If you try to access a page that doesn't exist or requires authentication without being logged in, you might see a 404 error or be redirected.

This guide should help you get started with using the application.
