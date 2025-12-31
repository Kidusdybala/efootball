# Feature Specification: Access to Admin Page after Deployment

The goal of this feature is to ensure that the admin page is accessible and fully functional on the deployed Vercel frontend, connecting to the backend deployed on Render.

## User Stories

### User Story 1 - Access Admin Login
As an administrator, I want to be able to access the admin login page by navigating to `/admin` on the deployed site.

**Acceptance Scenarios**:
1. **Given** the frontend is deployed at `https://efootball-97ku.vercel.app/`, **When** I navigate to `https://efootball-97ku.vercel.app/admin`, **Then** I should see the admin login page instead of a 404 or the home page.
2. **Given** I am on the admin login page, **When** I refresh the page, **Then** the page should reload correctly (client-side routing handled).

### User Story 2 - Admin Authentication
As an administrator, I want to be able to log in using my admin credentials.

**Acceptance Scenarios**:
1. **Given** the admin login page is open, **When** I enter valid admin credentials and click login, **Then** I should be redirected to the admin dashboard.
2. **Given** I enter invalid credentials, **When** I click login, **Then** I should see an error message.

### User Story 3 - Admin Dashboard Functionality
As an administrator, I want the dashboard to display data fetched from the deployed backend.

**Acceptance Scenarios**:
1. **Given** I am logged into the admin dashboard, **When** the dashboard loads, **Then** it should successfully fetch and display listings and orders from the backend API.
2. **Given** I am on the dashboard, **When** I perform administrative actions (e.g., adding a listing, updating an order), **Then** these actions should be sent to the correct backend URL.

---

## Requirements

1. **Client-Side Routing**: Configure the deployment (Vercel) to support client-side routing for `/admin` and other sub-routes, ensuring they don't return 404 on direct access or refresh.
2. **Dynamic Backend URL**: Replace hardcoded backend URLs (currently `https://efootball-3.onrender.com`) with a dynamic configuration (environment variables) to allow connecting to different backend deployments.
3. **Admin Access Visibility**: Ensure there is a way (even if subtle or manual) for the admin to reach the login page.
4. **Backend Connectivity**: Verify that the frontend can communicate with the Render-deployed backend, addressing any CORS or URL issues.

## Success Criteria

1. Navigating to `https://efootball-97ku.vercel.app/admin` displays the login page.
2. Logging in redirects to `https://efootball-97ku.vercel.app/admin/dashboard`.
3. The dashboard successfully loads data from the backend.
4. No backend URLs are hardcoded in the source code.
