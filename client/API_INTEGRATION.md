# API Integration Summary

## ✅ Completed Integration

### Core Infrastructure
- ✅ API client with error handling (`client/src/lib/api/client.ts`)
- ✅ TypeScript types matching backend DTOs (`client/src/lib/api/types.ts`)
- ✅ API service functions for all endpoints (`client/src/lib/api/services.ts`)
- ✅ React Query hooks for data fetching/mutations (`client/src/lib/api/hooks.ts`)
- ✅ Type mappers between frontend and backend (`client/src/lib/api/mappers.ts`)
- ✅ Auth context/provider for session management (`client/src/lib/auth/AuthContext.tsx`)

### Auth Pages
- ✅ Login page - integrated with `/api/v1/auth/login`
- ✅ Signup page - integrated with `/api/v1/auth/register`
- ✅ Onboarding page - integrated with `/api/v1/onboarding/complete`

### Dashboard Pages
- ✅ Today page - fetches todos from `/api/v1/todos` filtered by due date
- ✅ Task components - create, update, toggle status, delete via API

## ⚠️ Known Limitations

### Version/ETag Handling
The backend uses optimistic concurrency control with version numbers and ETags. Currently:
- Version is hardcoded to `1` in TaskItem and TaskFormModal
- **TODO**: Store version in Task type or fetch full todo when editing
- **TODO**: Handle 412 Precondition Failed errors for version conflicts

### Missing Backend Endpoints
1. **List Organisation Members** - No endpoint to get all members of an organisation
   - Current: Can only see user's own memberships
   - Needed: `GET /api/v1/organisations/{orgId}/members`
   
2. **Get User Details** - No endpoint to get user info by ID
   - Needed for displaying member names/emails in members list

### Frontend-Only Concepts
- **Projects**: Frontend has "projects" concept but backend only has "organisations"
  - Current: Projects are stored locally
  - Consider: Map projects to organisations or keep as frontend-only grouping

## 🔄 Integration Status by Page

| Page | Status | Notes |
|------|--------|-------|
| `/auth/login` | ✅ Complete | Uses API, handles errors |
| `/auth/signup` | ✅ Complete | Uses API, navigates to onboarding |
| `/auth/onboarding` | ✅ Complete | Uses API, completes profile |
| `/dashboard/today` | ✅ Complete | Fetches todos, filters by date |
| `/dashboard/tasks` | ⚠️ Partial | Needs API integration |
| `/dashboard/upcoming` | ⚠️ Pending | Needs API integration |
| `/dashboard/completed` | ⚠️ Pending | Needs API integration |
| `/dashboard/org/home` | ⚠️ Pending | Needs API integration for stats |
| `/dashboard/org/members` | ⚠️ Partial | Can add members, but can't list them |
| `/dashboard/org/projects` | ⚠️ Pending | Projects are frontend-only concept |
| `/dashboard/org/activity` | ⚠️ Pending | Needs audit log API integration |

## 🚀 Next Steps

1. **Fix Version Handling**
   - Add `version` and `eTag` fields to Task type
   - Store version when fetching todos
   - Handle version conflicts gracefully

2. **Complete Remaining Pages**
   - Integrate Tasks, Upcoming, Completed pages
   - Integrate Org Dashboard with real stats
   - Integrate Activity page with audit log

3. **Add Missing Backend Endpoints**
   - List organisation members endpoint
   - Get user details endpoint

4. **Error Handling**
   - Add retry logic for network errors
   - Handle 401/403 errors with redirect to login
   - Show user-friendly error messages

5. **Performance**
   - Add pagination for large todo lists
   - Implement optimistic updates
   - Cache organisation data

## 📝 Environment Variables

Add to `.env`:
```
VITE_API_BASE_URL=http://localhost:5078/api/v1
```

## 🔧 Testing

To test the integration:
1. Start the backend server (port 5078)
2. Start the frontend dev server
3. Register a new user
4. Complete onboarding
5. Create todos and verify they appear in Today view
6. Test toggle/delete operations
