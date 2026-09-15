# Phase 2: Swagger/API to Frontend Feature Mapping

Date: 2026-09-14
Source of truth: `src/routes/*.js`, controllers, services, repositories, Prisma schema, generated Swagger, and `frontend/src`.

## Coverage Summary

- Swagger paths found: **28**
- HTTP operations found in generated Swagger: **45**
- Additional runtime route not represented as a distinct Swagger operation: `DELETE /api/users/{id}/force`.
- Frontend API service methods available after the current Phase 1 work: **33**
- Frontend feature surfaces: Login, Signup, password recovery, Dashboard, Workspace modules, Profile, Attachments
- Fully covered operation families: authentication, projects, tickets, attachments, core organization CRUD, core roles/permissions CRUD
- Partial operation families: organization member/owner actions, role assignment actions, user detail/delete variants, ticket assignment UI
- Backend-only operations with no complete dedicated UI: user detail/delete variants, some relationship-management operations, role/user and organization/member relationship detail views
- No query parameters are defined by Swagger. All request inputs are path parameters, JSON bodies, or multipart form data.

## Runtime Conventions

- API base path: `/api`.
- Swagger server: `http://localhost:3000`.
- JSON success envelope: usually `{ success: true, data: ... }`, with `message` on mutations.
- JSON error envelope: `{ success: false, message: string }`.
- Users list also returns `count`.
- JWT is sent as `Authorization: Bearer <token>`.
- Frontend `api.ts` injects the JWT and redirects on `401`; `403` displays an access-denied alert.
- Backend `authMiddleware` is the final authentication boundary.
- Backend permission middleware is the final authorization boundary.
- Role and permission routes are protected by `authMiddleware + adminMiddleware` at router level.
- Organization GET routes require authentication but currently do not require a named permission.
- User `GET /api/users/:id` requires authentication but is not admin-protected; list/delete/force-delete are admin-protected.

## Permission Source of Truth

### Named permissions from `prisma/seed.js`

`CREATE_ORGANIZATION`, `UPDATE_ORGANIZATION`, `DELETE_ORGANIZATION`, `ASSIGN_USER`, `REMOVE_USER`, `TRANSFER_OWNER`, `CREATE_PROJECT`, `VIEW_PROJECT`, `UPDATE_PROJECT`, `DELETE_PROJECT`, `CREATE_TICKET`, `VIEW_TICKET`, `UPDATE_TICKET`, `DELETE_TICKET`, `ASSIGN_TICKET`, `UPLOAD_ATTACHMENT`, `VIEW_ATTACHMENT`.

### Route-level mapping

| Module/action | Actual backend guard |
|---|---|
| Organization create | `CREATE_ORGANIZATION` |
| Organization list/detail | Authenticated only, no named permission |
| Organization update | `UPDATE_ORGANIZATION` |
| Organization delete | `DELETE_ORGANIZATION` |
| Organization assign member | `ASSIGN_USER` |
| Organization remove member | `REMOVE_USER` |
| Organization transfer owner | `TRANSFER_OWNER` |
| Project list/detail | `VIEW_PROJECT` |
| Project create | `CREATE_PROJECT` |
| Project update | `UPDATE_PROJECT` |
| Project delete | `DELETE_PROJECT` |
| Ticket list/detail | `VIEW_TICKET` |
| Ticket create | `CREATE_TICKET` |
| Ticket update | `UPDATE_TICKET` |
| Ticket delete | `DELETE_TICKET` |
| Ticket assignment | `ASSIGN_TICKET` |
| Attachment upload | `UPLOAD_ATTACHMENT` |
| Attachment list | `VIEW_ATTACHMENT` |
| Roles and role relationships | Authenticated Admin role via `adminMiddleware`; no named permission |
| Permissions CRUD | Authenticated Admin role via `adminMiddleware`; no named permission |
| User list/delete/force-delete | Authenticated Admin role via `adminMiddleware` |
| User detail | Authentication only |

The frontend must use the exact named permissions above for action-level UI. It must use the actual `Admin` role for role/permission/user-management surfaces because that is what the backend currently enforces.

## Complete Endpoint Inventory

Status meanings: ✅ covered by a frontend service and UI surface; ⚠️ partially covered or missing a dedicated detail/action experience; 🔧 integration mismatch or backend contract issue; ❌ no frontend use.

### Authentication: 5 paths

| Method/path | Purpose and input | Auth/permission | Response and errors | Frontend mapping/status |
|---|---|---|---|---|
| `POST /api/auth/signup` | JSON: `name`, `email`, `password`, `dateOfBirth`, `acceptedTerms` (the route Swagger omits the last two, but controller/service uses them) | Public | `201 { success, message, data: user }`; `400` validation; `409` duplicate email; `500` | Signup form; submit button; inline error + popup; redirect to login on success. ✅ |
| `POST /api/auth/login` | JSON: `email`, `password` | Public | `200 { success, message, token, user }`; `404` user not found; `401` invalid password; `500` | Login form; stores token/session; `401` returns to login. 🔧 Login controller does not currently serialize service-produced `roles`/`permissions`; frontend refreshes `/auth/me` to recover them. |
| `GET /api/auth/me` | No params/body | JWT | `200 { success, data: { user, roles, permissions } }`; `401`; `404`; `500` | Protected route/session bootstrap; drives permission-aware UI and profile. ✅ |
| `POST /api/auth/forgot-password` | JSON: `email` | Public | `200 { success, message, data: { resetToken } }`; `404`; `500` | Forgot-password form; shows success and routes to reset URL. ✅ |
| `POST /api/auth/reset-password` | JSON: `resetToken`, `newPassword` | Public reset token | `200 { success, message }`; `400` invalid/expired token; `500` | Reset form; success redirects login; inline error. ✅ |

### Users: 4 runtime routes / 3 generated Swagger operations

| Method/path | Purpose and input | Auth/permission | Response and errors | Frontend mapping/status |
|---|---|---|---|---|
| `GET /api/users` | No params/body | JWT + Admin role | `200 { success, count, data: [{ UserID, Name, Email, DateOfBirth, Roles }] }`; `401`; `403`; `500` | Workspace Users table, search, empty/loading/error states. ✅ |
| `GET /api/users/{id}` | Path `id` integer | JWT only | `200 { success, data: user }`; `401`; `404`; `500` | No dedicated user detail route/modal yet; list data is displayed. ⚠️ |
| `DELETE /api/users/{id}` | Path `id` integer | JWT + Admin role | `200 { success, message }`; `401`; `403`; `409` relationship constraint; `500` | Users table delete action should use confirmation and refresh. Workspace has delete service/action. ⚠️ No dedicated blocked-relationship explanation UI yet. |
| `DELETE /api/users/{id}/force` | Path `id` integer | JWT + Admin role | `200 { success, message }`; `401`; `403`; `500` | No separate force-delete UI. ❌ |

### Organizations: 8 paths

| Method/path | Purpose and input | Auth/permission | Response and errors | Frontend mapping/status |
|---|---|---|---|---|
| `POST /api/organizations` | JSON: `name`, `email`, `contactNo`, optional `logo`, `theme`, `ownerID` | JWT + `CREATE_ORGANIZATION` | `201 { success, message, data: organization }`; `409` duplicate email; `500` | Organizations Workspace create form; success reload. ✅ |
| `GET /api/organizations` | No params/body | JWT only | `200 { success, data: organization[] }`; `500` | Dashboard and Workspace organization list. ✅ |
| `POST /api/organizations/assign-user` | JSON: `organizationId`, `userId`, `role` | JWT + `ASSIGN_USER` | `201 { success, message, data: membership }`; `500` | Organization action strip exists; should select real users/organizations instead of requiring raw IDs. ⚠️ |
| `DELETE /api/organizations/remove-user` | JSON: `organizationId`, `userId` | JWT + `REMOVE_USER` | `200 { success, message }`; `404` not a member; `500` | Service method exists; dedicated remove-member UI is incomplete. ⚠️ |
| `PUT /api/organizations/transfer-owner` | JSON: `organizationId`, `newOwnerId` | JWT + `TRANSFER_OWNER` | `200 { success, message, data: organization }`; `404`; `500` | Organization action strip exposes transfer control; needs user selector and confirmation. ⚠️ |
| `GET /api/organizations/{id}` | Path `id` integer | JWT only | `200 { success, data: organization }`; `404`; `500` | No dedicated organization detail page/modal. ⚠️ |
| `PUT /api/organizations/{id}` | Path `id`; JSON `name`, `email`, `contactNo`, `logo`, `theme` | JWT + `UPDATE_ORGANIZATION` | `200 { success, message, data: organization }`; `500` | Organization edit modal. ✅ |
| `DELETE /api/organizations/{id}` | Path `id` integer | JWT + `DELETE_ORGANIZATION` | `200 { success, message }`; `500` | Workspace delete with browser confirmation and reload. ✅ |

### Roles: 9 paths

All role routes use router-level JWT + Admin role. They do not use named permissions.

| Method/path | Purpose and input | Response/errors | Frontend mapping/status |
|---|---|---|---|
| `POST /api/roles` | JSON `name` | `201 { success, message, data: role }`; `400`; `500` | Roles create form. ✅ |
| `GET /api/roles` | None | `200 { success, data: role[] }`; `500` | Roles table. ✅ |
| `POST /api/roles/assign-permission` | JSON `roleId`, `permissionName` | `201 { success, message, data }`; `400`; `500` | Role action strip; uses raw IDs/name. ⚠️ |
| `DELETE /api/roles/remove-permission` | JSON `roleId`, `permissionId` | `200 { success, message }`; `404`; `500` | Service exists; UI action should use selected permission rather than raw ID. ⚠️ |
| `POST /api/roles/assign-user` | JSON `userId`, `roleId` | `201 { success, message, data }`; `500` | No complete dedicated user-role assignment UI. ⚠️ |
| `DELETE /api/roles/remove-user` | JSON `userId`, `roleId` | `200 { success, message }`; `404`; `500` | No complete dedicated removal UI. ⚠️ |
| `GET /api/roles/user/{userId}/permissions` | Path `userId` integer | `200 { success, data: permission[] }`; `500` | Session/profile uses `/auth/me`; no admin user-permission detail page. ⚠️ |
| `GET /api/roles/{roleId}/permissions` | Path `roleId` integer | `200 { success, data: permission[] }`; `500` | Role permissions can be loaded by service; dedicated role detail view missing. ⚠️ |
| `GET/PUT/DELETE /api/roles/{id}` | Path `id`; PUT JSON `name` | GET `200 data`; PUT `200 message,data`; DELETE `200 message`; `400/404/500` | GET is not separately called by Workspace; PUT/DELETE are connected. ⚠️ |

### Permissions: 5 paths

All permission routes use router-level JWT + Admin role.

| Method/path | Purpose and input | Response/errors | Frontend mapping/status |
|---|---|---|---|
| `POST /api/permissions` | JSON `name` | `201 { success, message, data }`; `400`; controller maps other errors to `500` | Permission create form. ✅ |
| `GET /api/permissions` | None | `200 { success, data: permission[] }`; `500` | Permission table. ✅ |
| `GET /api/permissions/{id}` | Path `id` | `200 { success, data }`; `404`; `500` | No detail modal. ⚠️ |
| `PUT /api/permissions/{id}` | Path `id`; JSON `name` | `200 { success, message, data }`; `400`; `500` | Permission edit action. ✅ |
| `DELETE /api/permissions/{id}` | Path `id` | `200 { success, message }`; `500` | Permission delete confirmation/action. ✅ |

### Projects: 5 paths

| Method/path | Purpose and input | Auth/permission | Response/errors | Frontend mapping/status |
|---|---|---|---|---|
| `POST /api/projects` | JSON `Name`, optional `Description`, `OrganizationID`, `OwnerID`; controller validates positive IDs and required fields | JWT + `CREATE_PROJECT` | `201 { success, message, data: project }`; `400`; `403`; `500` | Workspace create modal; refresh and success notice. ✅ |
| `GET /api/projects` | None | JWT + `VIEW_PROJECT` | `200 { success, data: project[] }`; `403`; `500` | Dashboard and Workspace project list. ✅ |
| `GET /api/projects/{id}` | Path integer `id` | JWT + `VIEW_PROJECT` | `200 { success, data: project }`; `400`; `403`; `404`; `500` | Workspace list exists; no dedicated project details page. ⚠️ |
| `PUT /api/projects/{id}` | Path integer; partial JSON `Name`, `Description`, `OrganizationID`, `OwnerID` | JWT + `UPDATE_PROJECT` | `200 { success, message, data: project }`; `400`; `403`; `404`; `500` | Edit modal and refresh. ✅ |
| `DELETE /api/projects/{id}` | Path integer | JWT + `DELETE_PROJECT` | `200 { success, message, data: deletedProject }`; `400`; `403`; `404`; `500` | Delete confirmation and refresh. ✅ |

### Tickets/tasks: 6 paths

| Method/path | Purpose and input | Auth/permission | Response/errors | Frontend mapping/status |
|---|---|---|---|---|
| `POST /api/tickets` | JSON passed to Prisma: `Title`, `Description`, `Status`, `Priority`, `ProjectID`, and effectively `AssignedTo` required by schema | JWT + `CREATE_TICKET` | `201 { success, message, data: task }`; Prisma/validation errors become `500` unless service sets status | Workspace create form; current payload adds `AssignedTo` current user. ⚠️ Swagger does not document all required schema fields. |
| `GET /api/tickets` | None | JWT + `VIEW_TICKET` | `200 { success, data: task[] }`; `403`; `500` | Dashboard and Workspace task table. ✅ |
| `GET /api/tickets/{id}` | Path integer `id` | JWT + `VIEW_TICKET` | `200 { success, data: task }`; `404`; `500` | No dedicated task detail page/modal. ⚠️ |
| `PUT /api/tickets/{id}` | Path integer; JSON `Title`, `Description`, optional `Status`, `Priority` | JWT + `UPDATE_TICKET` | `200 { success, message, data: task }`; `400` invalid status transition; `404`; `500` | Workspace edit form; status options currently allow values but backend workflow may reject invalid transitions. ⚠️ |
| `PATCH /api/tickets/{id}/assign` | Path integer; JSON `userId` | JWT + `ASSIGN_TICKET` | `200 { success, message, data: task }`; `404` ticket/user; `500` | Service exists; dedicated assignee selector is missing. ⚠️ |
| `DELETE /api/tickets/{id}` | Path integer | JWT + `DELETE_TICKET` | `200 { success, message, data: deletedTask }`; `404`; `500` | Workspace delete confirmation/action. ✅ |

Ticket status workflow enforced in `ticketService.js`: `Ready to Do -> In Progress/Blocked`, `In Progress -> Ready to Do/Blocked/Testing`, `Blocked -> In Progress`, `Testing -> Done/In Progress`, `Done -> In Progress`.

### Attachments: 2 paths

| Method/path | Purpose and input | Auth/permission | Response/errors | Frontend mapping/status |
|---|---|---|---|---|
| `POST /api/tickets/{ticketId}/attachments` | Path `ticketId`; multipart form field `image` | JWT + `UPLOAD_ATTACHMENT` | `201 { success, message, data: attachment }`; `400` missing file; `500` | Attachments Workspace file picker; upload success notice and reload. ✅ |
| `GET /api/tickets/{ticketId}/attachments` | Path `ticketId` | JWT + `VIEW_ATTACHMENT` | `200 { success, data: attachment[] }`; `404`; `500` | Attachments Workspace ticket selector/list. ✅ |

## Frontend Page and Action Mapping

| Backend feature | Page/component | User action | Success behavior | Loading/error behavior | Status |
|---|---|---|---|---|---|
| Session | `Workspace`, `ProtectedRoute` | Page load | Store verified session and permissions | `401` clears token/redirects; other errors show notice | ✅ |
| Dashboard aggregates | `Dashboard` | Dashboard mount | Real organization/project/ticket counts | Promise-all-settled notice; permission-aware `-` for restricted stats | ⚠️ Counts are global API lists, not user-specific because API has no scoped list endpoints. |
| Projects | `Workspace` projects | Add/Edit/Delete | Reload list + notice | Modal saving state, API notice, 401/403 interceptor | ✅ |
| Tickets | `Workspace` tasks | Add/Edit/Delete | Reload list + notice | Modal saving state; status-transition error shown | ⚠️ Assignment/detail not complete. |
| Organizations | `Workspace` organizations | Add/Edit/Delete | Reload list + notice | Form/loading/error states | ⚠️ Detail/member UX incomplete. |
| Users | `Workspace` users | Search/Delete | Reload list + notice | Admin 403 handled | ⚠️ No detail/force-delete UI. |
| Roles | `Workspace` roles | Add/Edit/Delete and action strip | Reload/notice | Admin gate and error notice | ⚠️ Role detail/relationship selectors incomplete. |
| Permissions | `Workspace` permissions | Add/Edit/Delete | Reload/notice | Admin gate and error notice | ⚠️ No detail/category UI; backend only has name. |
| Attachments | `Workspace` attachments | Select ticket, Load, Upload | Reload attachments | Upload/list errors and success notice | ✅ |
| Password reset | Existing auth pages | Submit forms | Navigation/success message | Typed Axios error handling | ✅ |

## User Access Mapping

| User state | Frontend behavior | Backend behavior |
|---|---|---|
| Unauthenticated | `ProtectedRoute` redirects to `/login`; direct workspace URL cannot open | JWT middleware returns `401` |
| Admin | Workspace Users/Roles/Permissions visible and enabled; all assigned named-permission actions shown | Admin middleware plus named permission middleware enforce access |
| Normal user with project/ticket permissions | Projects/tasks visible; only actions matching `VIEW/CREATE/UPDATE/DELETE/ASSIGN` permissions enabled | Named middleware returns `403` when missing |
| User without a specific permission | Sidebar item remains visible but locked where module is represented; click shows Access Denied; action button is hidden/disabled | Backend remains authoritative and returns `403` |
| User with no role | Session can load with empty roles/permissions; protected named operations fail `403` | Permission middleware returns no-role `403` |

## Dashboard Data Mapping

| Widget | Real source | Calculation | Caveat |
|---|---|---|---|
| Organizations | `GET /api/organizations` | `data.length` | Endpoint returns all accessible organizations; no current-user filter. |
| Projects | `GET /api/projects` | `data.length` | Requires `VIEW_PROJECT`; endpoint returns all projects, not only owned/member projects. |
| Tasks | `GET /api/tickets` | `data.length` | Requires `VIEW_TICKET`; endpoint returns all tickets, not only assigned tickets. |
| Pending tasks | Ticket data | Count where `Status !== Done` | Status semantics are backend strings. |
| User identity | `GET /api/auth/me` | `data.user`, `data.roles` | Safe profile excludes password. |
| Admin user count | `GET /api/users` | `count` | Admin-only endpoint; not currently shown in Dashboard stats. |
| Completed tasks | Ticket data | Count where `Status === Done` | Can be added without inventing data. |
| My tasks/projects | No scoped backend endpoint | Must filter returned arrays by `AssignedTo`/`OwnerID` client-side, or backend must add scoped endpoints | Current data model supports fields but current Dashboard is not fully user-scoped. |

## Existing Frontend Gaps and Incomplete Integrations

### Missing or partial features

- Dedicated project details screen using `GET /api/projects/{id}`.
- Dedicated task details screen using `GET /api/tickets/{id}`.
- Organization details screen using `GET /api/organizations/{id}`.
- User detail screen using `GET /api/users/{id}`.
- Force-delete user action using `/api/users/{id}/force`.
- Organization member list/detail experience; only action inputs exist.
- Organization remove-member and transfer-owner selectors/confirmation.
- Role permission detail screen using `/api/roles/{roleId}/permissions`.
- User effective-permissions screen using `/api/roles/user/{userId}/permissions`.
- Role-to-user assignment and removal with user/role selectors.
- Ticket assignment selector using real users rather than raw IDs.
- Attachment preview thumbnails/modal; current UI provides preview link.
- Server-side pagination/filtering/search does not exist; current search is client-side.
- No profile edit endpoint exists, so profile is read-only correctly.
- No settings endpoint exists, so settings should not be fabricated.

### Existing integration issues to track

- Swagger signup schema omits `dateOfBirth` and `acceptedTerms`, while backend validation requires them.
- Swagger ticket create schema omits schema-required `AssignedTo`; frontend supplies current user, but Swagger examples can fail.
- Login controller returns only `token` and raw `user`; it does not include the `roles`/`permissions` already assembled by `authService.login`. Frontend compensates with `/auth/me`, but login response and Swagger contract should be normalized in a later backend cleanup phase.
- Dashboard organization list is real, but organization create/edit/delete is only available from Workspace.
- Dashboard projects/tasks show global lists/counts rather than “my work”; the current API has no scoped list query.
- `permissionMiddleware.js` contains verbose debug logging; it does not change the contract but should be removed before production.
- Organization routes contain startup debug logging.
- Swagger security annotations are inconsistent on some role/permission/user/organization operations even when runtime middleware protects them.

## Hardcoded/Mock Data Audit

- Dashboard labels and empty-state copy are static UI text, not data mocks.
- Dashboard initial counts were previously hardcoded `0`; they are now derived from API state.
- Dashboard user display was previously hardcoded `User`; it now uses `/api/auth/me` session data.
- Project/task/organization lists in Dashboard and Workspace use API responses.
- Login/signup form examples and placeholder values are static examples only.
- No permanent hardcoded users, projects, tasks, roles, or permissions were found in the current frontend data layer.

## Error-State Contract for Frontend

| Backend status | Frontend behavior |
|---|---|
| `400` | Keep form open, show backend message in inline notice; validation should prevent obvious invalid submits. |
| `401` | API interceptor clears token and redirects to login. |
| `403` | API interceptor displays access-denied popup; page/action also shows locked/denied state. |
| `404` | Show resource-not-found notice and allow returning to list; currently list views mostly show generic request errors. |
| `409` | Show conflict message, especially duplicate email or user/owner relationship constraints. |
| `500` | Show generic retryable error; never expose stack traces. |

## Recommended Remaining Implementation Order

1. Normalize login response to include safe `roles` and `permissions`, and update Swagger schemas for signup/tickets.
2. Add reusable AccessDenied modal/toast instead of direct `window.alert` for all `403` responses.
3. Add dedicated detail routes for project, ticket, organization, and user resources.
4. Replace raw ID special-action fields with user/organization/role/permission selectors.
5. Add task assignment UI and use `GET /api/users` as the selector source for admins/authorized users.
6. Add role permission and user-role management panels with real list selections.
7. Add organization member management and owner transfer confirmation flows.
8. Add attachment thumbnails/preview modal and upload progress/error presentation.
9. Add user-scoped dashboard derivations from returned `OwnerID`/`AssignedTo` fields, documenting that this is client-side until scoped APIs exist.
10. Add integration tests for Admin, normal user, no-role user, expired token, `400`, `403`, `404`, `409`, and `500` paths.
11. Remove backend debug logging and align Swagger `security`/response documentation with runtime middleware.
12. Perform browser-level responsive checks at 1920, 1440, 1024, 768, 480, and 375 widths.

## Phase 2 Completion Report

- ✅ Complete Swagger/API inventory created for all **28 paths / 45 generated operations**, plus the runtime-only force-delete route.
- ✅ Actual auth and admin/permission middleware mapped.
- ✅ Actual request fields, response envelopes, path parameters, and error behavior mapped.
- ✅ Every current frontend service/page/action mapped to its backend operation.
- ✅ Missing and incomplete frontend features listed separately.
- ✅ Dashboard data sources and user/admin caveats documented.
- ✅ Mock/hardcoded data audit completed.
- ✅ Remaining implementation order defined.

**PHASE 2 COMPLETE**
