# Folder Structure Reorganization Plan

## Current Structure Analysis

### Existing Routes:
```
app/
├── (browser)/          # Public landing pages
├── (dashboard)/        # Already exists (empty)
├── admin/              # Admin dashboard (role: admin)
│   ├── page.tsx
│   ├── appointments/
│   ├── patients/
│   ├── doctors/
│   └── ...
├── dietitian/         # Dietitian dashboard (role: doctor)
│   ├── page.tsx
│   ├── appointments/
│   ├── availability/
│   └── profile/
├── patient/           # Patient dashboard (role: patient)
│   ├── page.tsx
│   ├── appointments/
│   ├── book/
│   └── profile/
├── doctors/[id]/      # Public doctor profiles
├── messages/          # Shared messages
└── api/
    └── appointments/dietitians/  # Uses "dietitian" naming
```

### Issues Identified:
1. **Role Inconsistency**: `AuthContext` uses `'dietitian'` but sidebar uses `'doctor'` role
2. **Separate dietitian routes**: `/dietitian/*` should be unified under `/doctors/*`
3. **Dashboard folder exists but unused**: `(dashboard)` route group is empty
4. **API naming**: `api/appointments/dietitians` should be `api/appointments/doctors`

---

## Proposed Folder Structure

```
app/
├── (auth)/             # Authentication pages (login, signup, etc.)
├── (public)/           # Public pages (landing, doctor profiles)
│   ├── page.tsx        # Landing page
│   └── doctors/
│       └── [id]/       # Public doctor profiles
├── @(dashboard)/       # Dashboard route group
│   ├── layout.tsx      # Shared dashboard layout (sidebar, header)
│   ├── admin/          # Admin section
│   │   ├── page.tsx    # Admin dashboard
│   │   ├── appointments/
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── reports/
│   │   ├── staff/
│   │   ├── audit-logs/
│   │   ├── settings/
│   │   └── messages/
│   ├── doctors/        # Doctor section (unified from dietitian)
│   │   ├── page.tsx    # Doctor dashboard
│   │   ├── appointments/
│   │   ├── availability/
│   │   ├── patients/
│   │   ├── profile/
│   │   └── messages/
│   └── patient/        # Patient section
│       ├── page.tsx    # Patient dashboard
│       ├── appointments/
│       ├── book/
│       ├── profile/
│       └── messages/
└── api/
    └── appointments/
        ├── doctors/    # Renamed from dietitians
        └── ...
```

---

## Implementation Plan

### Phase 1: Unify Role Naming
1. Update `AuthContext.tsx`: Change `'dietitian'` role to `'doctor'`
2. Update `DashboardLayout.tsx`: Use consistent role type
3. Update sidebar navigation links to use `/doctors/` instead of `/dietitian/`

### Phase 2: Reorganize Routes
1. Rename `app/dietitian/` → `app/@(dashboard)/doctors/`
2. Move all dietitian pages to the new location
3. Update all import statements and links

### Phase 3: Update API Routes
1. Rename `app/api/appointments/dietitians/` → `app/api/appointments/doctors/`
2. Update all service references

### Phase 4: Update Sidebar Navigation
Update `AppSidebar.tsx` navigation items with correct paths:
```typescript
// Before
{ title: "My Appointments", url: "/dietitian/appointments", roles: ["doctor"] }

// After
{ title: "My Appointments", url: "/doctors/appointments", roles: ["doctor"] }
```

### Phase 5: Verify Role-Based Access
- Admin sees: `/admin/*` routes
- Doctor sees: `/doctors/*` routes
- Patient sees: `/patient/*` routes

---

## Files to Modify

### Authentication
- `contexts/AuthContext.tsx` - Update role type from 'dietitian' to 'doctor'

### Components
- `components/DashboardLayout.tsx` - Update role type
- `components/AppSidebar.tsx` - Update navigation URLs

### Routes
- Rename `app/dietitian/` to `app/@(dashboard)/doctors/`
- Update `app/api/appointments/dietitians/` to `app/api/appointments/doctors/`

### Pages to Update
- `app/admin/*` - May need route group wrapper
- `app/patient/*` - May need route group wrapper

---

## Role-Based Navigation Matrix

| Page/Feature | Admin | Doctor | Patient |
|--------------|-------|--------|---------|
| Dashboard | /admin | /doctors | /patient |
| Appointments | /admin/appointments | /doctors/appointments | /patient/appointments |
| Book Appointment | - | - | /patient/book |
| Availability | - | /doctors/availability | - |
| Patients | /admin/patients | /doctors/patients | - |
| Doctors | /admin/doctors | - | /doctors |
| Messages | /admin/messages | /doctors/messages | /patient/messages |
| Profile | /admin/profile | /doctors/profile | /patient/profile |
| Reports | /admin/reports | /doctors/reports | - |
| Staff | /admin/staff | - | - |
| Audit Logs | /admin/audit-logs | - | - |
| Settings | /admin/settings | /doctors/settings | /patient/settings |
