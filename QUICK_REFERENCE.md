# RegXperience Frontend - Quick Reference Card

**Print this page or keep it open while developing!**

---

## 🚀 Quick Start

```bash
npm install              # Install dependencies
cp .env.example .env.local  # Setup config
npm run dev             # Start dev server
# Open: http://localhost:3000
```

---

## 📁 File Locations

| What       | Where         | Example                                    |
| ---------- | ------------- | ------------------------------------------ |
| Pages      | `app/`        | `/app/templates/page.tsx`                  |
| API Routes | `app/api/`    | `/app/api/templates/route.ts`              |
| Components | `components/` | `/components/templates/templates-list.tsx` |
| Hooks      | `hooks/`      | `/hooks/useTemplates.ts`                   |
| Config     | Root          | `.env.local`, `package.json`               |

---

## 🪝 Custom Hooks

### useTemplates

```typescript
import {
  useTemplates,
  useTemplate,
  useUploadTemplate,
} from "@/hooks/useTemplates";

const { data, isLoading, error } = useTemplates();
const { data, isLoading, error } = useTemplate(id);
const { mutate, isPending } = useUploadTemplate();
```

### useAssessments

```typescript
import {
  useAssessments,
  useAssessment,
  useCreateAssessment,
  useUpdateSubmission,
  useReviewSubmission,
} from "@/hooks/useAssessments";

const { data, isLoading, error } = useAssessments();
const { data, isLoading, error } = useAssessment(id);
const { mutate, isPending } = useCreateAssessment();
const { mutate, isPending } = useUpdateSubmission();
const { mutate, isPending } = useReviewSubmission();
```

---

## 📡 API Endpoints

```
GET    /api/templates              Fetch all templates
GET    /api/templates/[id]         Fetch template details
POST   /api/templates/upload       Upload PDF

GET    /api/assessments            Fetch user assessments
POST   /api/assessments            Create assessment
GET    /api/assessments/[id]       Fetch assessment details

PUT    /api/submissions            Save submission
PUT    /api/submissions/[id]/review Review submission
```

---

## 🎨 Common Components

### Button

```tsx
<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button disabled>Disabled</Button>
<Button size="sm">Small</Button>
```

### Card

```tsx
<Card className="p-6">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### Badge

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### Input

```tsx
<Input placeholder="Type here..." />
<Input type="email" />
<Input type="url" />
```

### Textarea

```tsx
<Textarea placeholder="Long text..." rows={3} />
```

### Loading Spinner

```tsx
import { Loader2 } from "lucide-react";
<Loader2 className="animate-spin" />;
```

---

## 💾 Component Template

```typescript
'use client'

import { useHook } from '@/hooks/useHook'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function MyComponent() {
  const { data, isLoading, error } = useHook()

  if (isLoading) return <Loader2 className="animate-spin" />
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {/* Your content */}
    </div>
  )
}
```

---

## 🪝 Hook Template

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useMyData() {
  return useQuery({
    queryKey: ["mydata"],
    queryFn: () => fetch("/api/mydata").then((r) => r.json()),
  });
}

export function useCreateData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      fetch("/api/mydata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mydata"] });
    },
  });
}
```

---

## 🌐 API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/endpoint`, {
      headers: {
        Authorization: request.headers.get("authorization") || "",
      },
    });

    if (!response.ok) throw new Error("Backend error");
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
```

---

## 📝 Page Template

```typescript
import { MyComponent } from '@/components/my-component'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'My Page - RegXperience',
  description: 'Page description',
}

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <h1>My Page</h1>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <MyComponent />
      </main>
    </div>
  )
}
```

---

## 🎯 Query Keys Pattern

```typescript
// Simple list
["items"][
  // List with filter
  ("items", filterStatus)
][
  // Single item
  ("item", id)
][
  // Nested data
  ("items", id, "details")
];
```

---

## 🔄 Mutation Pattern

```typescript
const { mutate, isPending, error } = useMutation(...)

mutate(data, {
  onSuccess: () => {
    toast.success('Success!')
    queryClient.invalidateQueries({ queryKey: ['items'] })
  },
  onError: () => {
    toast.error('Failed to save')
  },
})
```

---

## ⚡ Common Tailwind Classes

```html
<!-- Spacing -->
<div className="p-4 m-2 gap-4">
  <!-- Layout -->
  <div className="flex items-center justify-between">
    <div className="grid grid-cols-3 gap-4">
      <!-- Sizing -->
      <div className="w-full max-w-7xl h-screen">
        <!-- Text -->
        <div className="text-lg font-semibold text-muted-foreground">
          <!-- Responsive -->
          <div className="md:grid-cols-2 lg:grid-cols-3">
            <!-- Hover/Focus -->
            <button className="hover:bg-muted focus:outline-ring">
              <!-- Colors -->
              <div
                className="bg-background text-foreground border border-border"
              ></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 🐛 Debug Shortcuts

### Console Logging

```typescript
console.log("[Component Name] Variable:", variable);
console.log("[Hook Name] Data:", data);
console.log("[API] Request to:", BACKEND_URL);
```

### React Query DevTools

```typescript
// In provider
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
<ReactQueryDevtools initialIsOpen={false} />
```

### Network Tab

1. Open DevTools (F12)
2. Click Network tab
3. Make request
4. See all API calls

---

## 📋 Checklist for New Feature

- [ ] Created hook in `hooks/useFeature.ts`
- [ ] Created API route in `app/api/feature/route.ts`
- [ ] Created component in `components/feature/component.tsx`
- [ ] Created page in `app/feature/page.tsx`
- [ ] Tested in browser
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Updated documentation

---

## 🚨 Common Errors & Fixes

| Error                  | Fix                                     |
| ---------------------- | --------------------------------------- |
| "Failed to fetch"      | Check `NEXT_PUBLIC_BACKEND_URL` env var |
| Component not updating | Add `'use client'` directive            |
| Query not refetching   | Call `queryClient.invalidateQueries()`  |
| TypeScript error       | Check types match interfaces            |
| Infinite requests      | Add `enabled` condition                 |
| Page not found         | Check file name and path                |

---

## 🧪 Testing Commands

```bash
npm run build     # Check for build errors
npm run lint      # Check linting
npm run dev       # Start dev server
npm run start     # Start production server
```

---

## 🌍 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001    # Backend API URL
```

---

## 📚 Documentation Map

| Need Help With | Read                                    |
| -------------- | --------------------------------------- |
| Setup          | SETUP_CHECKLIST.md                      |
| Architecture   | ARCHITECTURE.md                         |
| Code Structure | PROJECT_STRUCTURE.md                    |
| Development    | DEVELOPER_GUIDE.md                      |
| New Feature    | DEVELOPER_GUIDE.md#adding-a-new-feature |
| Debugging      | DEVELOPER_GUIDE.md#debugging            |
| Navigation     | DOCS_INDEX.md                           |
| Use Cases      | USE_CASES.md                            |

---

## 🔗 Important Links

- **Main Docs**: [`README.md`](./README.md)
- **Quick Ref**: [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md)
- **Architecture**: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Setup**: [`SETUP_CHECKLIST.md`](./SETUP_CHECKLIST.md)
- **Navigation**: [`DOCS_INDEX.md`](./DOCS_INDEX.md)

---

## 💡 Pro Tips

1. **Keep React Query DevTools open** while developing
2. **Use browser DevTools Network tab** to see API calls
3. **Check Console tab** for errors first
4. **Bookmark `DEVELOPER_GUIDE.md`** for patterns
5. **Use type hints** - TypeScript catches errors early
6. **Test with real data** from your backend
7. **Monitor cache** with React Query DevTools
8. **Check query keys** when troubleshooting

---

## ⌨️ Keyboard Shortcuts

| Shortcut     | Action             |
| ------------ | ------------------ |
| F12          | Open DevTools      |
| Ctrl+Shift+M | Toggle mobile view |
| Ctrl+Alt+I   | Inspect element    |
| Ctrl+Shift+C | Select element     |
| Cmd+Shift+J  | Open console (Mac) |

---

## 🎓 Learning Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## ✅ Before Committing

- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Code is formatted
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No debugging logs left

---

**Save this card for quick reference! 📌**

---

**Last Updated**: Today
**Version**: 1.0.0
