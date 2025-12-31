# Technical Specification: Access to Admin Page after Deployment

## Technical Context
- **Frontend**: React 18 with Vite, TypeScript.
- **Routing**: `react-router-dom` v6.
- **Backend**: Node.js/Express.
- **Deployment**: Vercel (Frontend), Render (Backend).
- **Environment Management**: Vite environment variables (`VITE_*`).

## Technical Implementation Brief

The primary issue is the hardcoded backend URL in multiple frontend files and potential routing issues on Vercel.

1.  **Environment Variables**: Introduce `VITE_API_URL` to the frontend.
2.  **Centralized API Config**: Create a utility to handle base URL and API calls to avoid repetition and hardcoding.
3.  **Vercel Configuration**: Ensure `vercel.json` is in the correct directory (the one deployed as root by Vercel) and has the correct SPA rewrite rules.
4.  **CORS/Backend**: Ensure the backend is configured to accept requests from the Vercel URL.

## Source Code Structure

- `frontend/src/config/api.ts`: New file for API configuration.
- `frontend/src/pages/`: All pages currently using `https://efootball-3.onrender.com` will be updated.
- `frontend/vercel.json`: Move or create to ensure SPA routing.

## Contracts

### Environment Variables
- `VITE_API_URL`: The full URL of the backend API (e.g., `https://efootball-backend.onrender.com/api`).

### API Utility
```typescript
// frontend/src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

## Delivery Phases

1.  **Phase 1: Environment & Config**: Set up the environment variable and the centralized configuration.
2.  **Phase 2: Refactoring**: Replace all hardcoded URLs in the frontend with the new configuration.
3.  **Phase 3: Vercel Setup**: Ensure `vercel.json` is correctly configured for the Vercel deployment.
4.  **Phase 4: Backend Check**: Verify backend `cors` configuration (if accessible).

## Verification Strategy

### Deliverable 1: Environment & Config
- **Verification**: Run `npm run build` and check if `import.meta.env.VITE_API_URL` is correctly used in the bundle.
- **Tool**: `grep` on the `dist` folder.

### Deliverable 2: Refactoring
- **Verification**: Run `grep -r "onrender.com" frontend/src` to ensure no hardcoded URLs remain.
- **Tool**: `grep`.

### Deliverable 3: Vercel Setup
- **Verification**: Check if `vercel.json` exists in the `frontend` directory (or wherever Vercel root is).
- **Tool**: `ls`.

### General Verification
- **Linting**: `npm run lint` in the `frontend` directory.
- **Type Checking**: `npm run typecheck` (or `tsc --noEmit`) in the `frontend` directory.
