# RegXperience Frontend - Complete Project Structure

## Directory Tree

```
regxperience-frontend/
│
├── 📁 app/                              # Next.js App Router
│   ├── 📁 api/                         # Backend-for-Frontend API Layer
│   │   ├── 📁 templates/
│   │   │   ├── route.ts                # GET /api/templates
│   │   │   ├── 📁 [id]/
│   │   │   │   └── route.ts            # GET /api/templates/[id]
│   │   │   └── 📁 upload/
│   │   │       └── route.ts            # POST /api/templates/upload
│   │   │
│   │   ├── 📁 assessments/
│   │   │   ├── route.ts                # GET/POST /api/assessments
│   │   │   └── 📁 [id]/
│   │   │       └── route.ts            # GET /api/assessments/[id]
│   │   │
│   │   └── 📁 submissions/
│   │       ├── route.ts                # PUT /api/submissions
│   │       └── 📁 [id]/
│   │           └── 📁 review/
│   │               └── route.ts        # PUT /api/submissions/[id]/review
│   │
│   ├── 📁 templates/
│   │   └── page.tsx                    # /templates - Template browser
│   │
│   ├── 📁 assessments/
│   │   ├── page.tsx                    # /assessments - My assessments list
│   │   └── 📁 [id]/
│   │       └── page.tsx                # /assessments/[id] - Assessment detail
│   │
│   ├── layout.tsx                      # Root layout (QueryProvider)
│   ├── page.tsx                        # / - Home page
│   └── globals.css                     # Global styles
│
├── 📁 components/                      # Reusable React Components
│   ├── 📁 templates/
│   │   ├── templates-list.tsx          # Display templates grid
│   │   │   ├─ Uses: useTemplates hook
│   │   │   ├─ Props: none
│   │   │   └─ Features: Status badges, Loading states, Error handling
│   │   │
│   │   └── upload-template.tsx         # Drag & drop PDF upload
│   │       ├─ Uses: useUploadTemplate hook
│   │       ├─ Props: none
│   │       └─ Features: File validation, Drag & drop, Toast notifications
│   │
│   ├── 📁 assessments/
│   │   ├── assessments-list.tsx        # List user assessments
│   │   │   ├─ Uses: useAssessments hook
│   │   │   ├─ Props: none
│   │   │   └─ Features: Status badges, Links to detail
│   │   │
│   │   └── assessment-form.tsx         # Assessment submission form
│   │       ├─ Uses: useAssessment, useTemplate, useUpdateSubmission
│   │       ├─ Props: assessmentId: string
│   │       └─ Features: Multi-category form, Save responses, Loading states
│   │
│   └── 📁 ui/                          # shadcn/ui Base Components
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── textarea.tsx
│       └── ... (all shadcn components)
│
├── 📁 hooks/                           # Custom React Query Hooks
│   ├── useTemplates.ts
│   │   ├─ useTemplates()              # Query: List all templates
│   │   ├─ useTemplate(id)             # Query: Single template with categories
│   │   ├─ useUploadTemplate()         # Mutation: Upload PDF file
│   │   └─ Types: Template, Category, Requirement, TemplateDetail
│   │
│   ├── useAssessments.ts
│   │   ├─ useAssessments()            # Query: User's assessments
│   │   ├─ useAssessment(id)           # Query: Single assessment with submissions
│   │   ├─ useCreateAssessment()       # Mutation: Create new assessment
│   │   ├─ useUpdateSubmission()       # Mutation: Save/update submission
│   │   ├─ useReviewSubmission()       # Mutation: Review submission (admin)
│   │   └─ Types: Assessment, Submission
│   │
│   └── use-mobile.tsx                 # Built-in hook for responsive design
│
├── 📁 providers/                       # Context Providers
│   └── query-provider.tsx              # React Query client provider
│       ├─ Exports: QueryProvider component
│       ├─ Configuration:
│       │  ├─ staleTime: 5 minutes
│       │  ├─ gcTime: 10 minutes
│       │  ├─ retry: 1
│       └─ Used in: Root layout (app/layout.tsx)
│
├── 📁 lib/                             # Utility Functions
│   └── utils.ts                        # Tailwind classname utilities
│       └─ cn() function for combining Tailwind classes
│
├── 📁 public/                          # Static Assets
│   ├── icon.svg
│   ├── icon-light-32x32.png
│   └── icon-dark-32x32.png
│
├── 📄 .env.example                     # Environment template
├── 📄 .env.local                       # Local environment (not tracked)
├── 📄 .gitignore
├── 📄 package.json                     # Dependencies
├── 📄 tsconfig.json                    # TypeScript config
├── 📄 next.config.mjs                  # Next.js config
├── 📄 tailwind.config.ts               # Tailwind config
├── 📄 postcss.config.js                # PostCSS config
│
├── 📄 README.md                        # Main documentation
├── 📄 ARCHITECTURE.md                  # Detailed architecture guide
├── 📄 DEVELOPER_GUIDE.md               # Quick reference for developers
└── 📄 PROJECT_STRUCTURE.md            # This file
```

---

## File Details

### Core Pages (`app/`)

| File                        | Route               | Purpose                                    |
| --------------------------- | ------------------- | ------------------------------------------ |
| `page.tsx`                  | `/`                 | Home page - feature overview & quick links |
| `templates/page.tsx`        | `/templates`        | Browse templates & upload PDFs             |
| `assessments/page.tsx`      | `/assessments`      | View user's assessments                    |
| `assessments/[id]/page.tsx` | `/assessments/[id]` | Assessment detail & submission form        |
| `layout.tsx`                | Global              | Root layout with QueryProvider             |

### API Routes (`app/api/`)

| File                               | Endpoint                       | Method    | Purpose                   |
| ---------------------------------- | ------------------------------ | --------- | ------------------------- |
| `templates/route.ts`               | `/api/templates`               | GET       | Fetch all templates       |
| `templates/[id]/route.ts`          | `/api/templates/[id]`          | GET       | Fetch single template     |
| `templates/upload/route.ts`        | `/api/templates/upload`        | POST      | Upload PDF for processing |
| `assessments/route.ts`             | `/api/assessments`             | GET, POST | List/create assessments   |
| `assessments/[id]/route.ts`        | `/api/assessments/[id]`        | GET       | Fetch assessment details  |
| `submissions/route.ts`             | `/api/submissions`             | PUT       | Save/update submission    |
| `submissions/[id]/review/route.ts` | `/api/submissions/[id]/review` | PUT       | Review submission (admin) |

### Custom Hooks (`hooks/`)

#### useTemplates.ts

```
Exports:
├── useTemplates()              // Get all templates
├── useTemplate(id)             // Get single template
├── useUploadTemplate()         // Upload & process PDF
└── Types: Template, Category, Requirement, TemplateDetail
```

#### useAssessments.ts

```
Exports:
├── useAssessments()            // Get user's assessments
├── useAssessment(id)           // Get assessment details
├── useCreateAssessment()       // Create new assessment
├── useUpdateSubmission()       // Save submission
├── useReviewSubmission()       // Review submission
└── Types: Assessment, Submission
```

### Components (`components/`)

#### templates/ (Template Management)

- **templates-list.tsx** - Grid of templates with status
  - Props: none
  - Uses: `useTemplates()` hook
  - Features: Status badges, Loading/error states, Links to start assessment

- **upload-template.tsx** - Drag & drop PDF upload
  - Props: none
  - Uses: `useUploadTemplate()` hook
  - Features: File validation, Drag & drop, Success/error toasts

#### assessments/ (Assessment Management)

- **assessments-list.tsx** - List of user assessments
  - Props: none
  - Uses: `useAssessments()` hook
  - Features: Status badges, Links to detail pages, Loading/error states

- **assessment-form.tsx** - Compliance assessment form
  - Props: `assessmentId: string`
  - Uses: `useAssessment()`, `useTemplate()`, `useUpdateSubmission()` hooks
  - Features: Multi-category requirements, Text input for responses, Evidence link field

---

## Data Models

### Template

```typescript
interface Template {
  id: string;
  title: string;
  status: "PROCESSING" | "AVAILABLE" | "FAILED";
  categoriesCount?: number;
  requirementsCount?: number;
  createdAt?: string;
}
```

### TemplateDetail

```typescript
interface TemplateDetail extends Template {
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  requirements: Requirement[];
}

interface Requirement {
  id: string;
  title: string;
  description: string;
}
```

### Assessment

```typescript
interface Assessment {
  id: string;
  userId: string;
  templateId: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "REVIEWED";
  submissions?: Submission[];
  createdAt?: string;
  updatedAt?: string;
}
```

### Submission

```typescript
interface Submission {
  id: string;
  requirementId: string;
  implementationDetail?: string;
  evidenceLink?: string;
  status: "PENDING" | "COMPLIANT" | "REJECTED";
}
```

---

## Query Keys Strategy

React Query uses query keys to organize and identify cached data:

```typescript
// Template queries
["templates"][("template", templateId)][ // All templates // Single template
  // Assessment queries
  "assessments"
][("assessment", assessmentId)][ // User's assessments // Single assessment
  // Submission queries
  ("submission", submissionId)
]; // Single submission
```

Query invalidation happens after mutations:

```typescript
// After upload
queryClient.invalidateQueries({ queryKey: ["templates"] });

// After update
queryClient.invalidateQueries({ queryKey: ["assessments"] });
queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
```

---

## Environment Variables

```bash
# .env.local

# Backend API URL (required)
# Local development: http://localhost:3001
# Production: https://api.yourdomain.com
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

## Dependencies

### Core

- **next** (16.1.6) - React framework with App Router
- **react** (19.2.4) - UI library
- **react-dom** (19.2.4) - React DOM renderer

### Data & State

- **@tanstack/react-query** (5.51.0) - Data fetching & caching

### UI Components

- **@radix-ui/\*** - Headless UI components
- **lucide-react** - Icon library
- **shadcn/ui** - Pre-built components

### Styling

- **tailwindcss** (4.2.0) - Utility CSS framework
- **@tailwindcss/postcss** - PostCSS plugin
- **postcss** - CSS processor

### Forms & Validation

- **react-hook-form** (7.54.1) - Form state management
- **@hookform/resolvers** (3.9.1) - Form validation
- **zod** (3.24.1) - Schema validation

### Utilities

- **date-fns** (4.1.0) - Date utilities
- **sonner** (1.7.1) - Toast notifications
- **clsx** (2.1.1) - Class composition
- **class-variance-authority** (0.7.1) - Component variants

### Analytics

- **@vercel/analytics** (1.6.1) - Vercel analytics

---

## Component Hierarchy

```
RootLayout
├── QueryProvider
│   └── {children}
│
├── Home Page
│   ├── Header
│   ├── Hero Section
│   └── Feature Cards
│
├── Templates Page
│   ├── Header
│   ├── UploadTemplate
│   └── TemplatesList
│       └── TemplateCard (multiple)
│
├── Assessments Page
│   ├── Header
│   └── AssessmentsList
│       └── AssessmentCard (multiple)
│
└── Assessment Detail Page
    ├── Header
    └── AssessmentForm
        ├── TemplateInfo
        └── CategorySection (multiple)
            └── RequirementForm (multiple)
```

---

## Request/Response Flow

### Example: Load Templates

1. User visits `/templates`
2. TemplatesList component mounts
3. `useTemplates()` hook called
4. React Query checks cache
5. If not cached, sends GET `/api/templates`
6. Next.js API route receives request
7. API route forwards to `${BACKEND_URL}/templates`
8. Backend returns template list
9. API route returns to browser
10. React Query caches response
11. Component re-renders with data
12. User sees templates

### Example: Save Submission

1. User fills form and clicks "Save"
2. AssessmentForm calls `updateSubmission()` mutation
3. useMutation sends PUT `/api/submissions`
4. Next.js API route receives request
5. API route validates and forwards to backend
6. Backend saves submission
7. API route returns updated submission
8. useMutation invalidates `['assessments']` cache
9. Related queries automatically refetch
10. Components re-render with updated data
11. Toast notification shows success

---

## Performance Characteristics

| Operation            | Cache Duration | Refetch Trigger              |
| -------------------- | -------------- | ---------------------------- |
| Get templates        | 5 min          | Manual invalidation          |
| Get template details | 5 min          | Manual invalidation          |
| Get assessments      | 5 min          | After mutation               |
| Get assessment       | 5 min          | After mutation               |
| Upload template      | -              | Invalidates template list    |
| Create assessment    | -              | Invalidates assessments list |
| Save submission      | -              | Invalidates assessment       |
| Review submission    | -              | Invalidates all assessments  |

---

## Development Workflow

### 1. Add New Hook

```
hooks/useNewFeature.ts
├── Define interfaces
├── Export useQuery hook
└── Export useMutation hook (if needed)
```

### 2. Add API Route

```
app/api/new-feature/route.ts
├── Receive request
├── Forward to backend
└── Return response
```

### 3. Add Component

```
components/new-feature/component.tsx
├── Import hook
├── Use hook for data
└── Render UI
```

### 4. Add Page

```
app/new-feature/page.tsx
├── Import component
├── Render page layout
└── Include navigation
```

---

## Common Patterns

### Fetching Related Data

```typescript
const { data: assessment } = useAssessment(id);
const { data: template } = useTemplate(assessment?.templateId);
// Second query waits for first (conditional with enabled)
```

### Form with Validation

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();
const { mutate } = useUpdateSubmission();
// Use register to bind inputs, handleSubmit to validate & mutate
```

### Pagination

```typescript
const [page, setPage] = useState(1);
const { data } = useQuery({
  queryKey: ["items", page],
  queryFn: () => fetch(`/api/items?page=${page}`),
});
```

### Search

```typescript
const [search, setSearch] = useState("");
const { data } = useQuery({
  queryKey: ["search", search],
  queryFn: () => fetch(`/api/search?q=${search}`),
  enabled: search.length > 0,
});
```

---

## Debugging Guide

### Enable React Query DevTools

Add to `providers/query-provider.tsx`:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

### Console Debugging

```typescript
console.log("[useTemplates] Data:", data);
console.log("[API] Request to:", `${BACKEND_URL}/templates`);
```

### Network Tab

Open DevTools → Network tab to see:

- API route calls (`/api/...`)
- Backend responses
- Request/response headers

---

## Maintenance

### Update Dependencies

```bash
npm outdated                # Check outdated packages
npm update                  # Update to latest compatible
npm install @package@latest # Update specific package
```

### Build & Deploy

```bash
npm run build              # Build for production
npm run start              # Start production server
```

### Monitoring

- Check error logs in production
- Monitor API response times
- Track cache hit rates
- Monitor bundle size

---

## Next Steps

1. **Authentication** - Add user login/logout
2. **Real-time Updates** - Connect WebSocket for live notifications
3. **Export** - Add PDF export functionality
4. **Analytics** - Track user metrics
5. **Search** - Full-text search templates
6. **Filters** - Filter by status, category, etc.
7. **Offline** - Service worker for offline access

---

## Resources

- **Architecture Details**: `ARCHITECTURE.md`
- **Developer Quick Ref**: `DEVELOPER_GUIDE.md`
- **Main Documentation**: `README.md`
