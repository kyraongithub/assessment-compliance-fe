# RegXperience Frontend - Use Cases & Workflows

This document describes the primary use cases and workflows supported by the RegXperience frontend.

## Use Case 1: Admin Uploads Compliance Document

### Scenario

An administrator has a PDF containing compliance requirements and wants to process it through the system.

### Workflow

**1. Navigate to Templates**

```
Home → Click "Templates" button
        OR
Home → "Browse Templates" card
        OR
Direct URL: /templates
```

**2. Upload PDF**

```
On Templates page:
1. See "Upload Compliance Template" section on left
2. Either:
   - Drag & drop PDF onto the box
   - Click "Select File" button and choose PDF
3. File is validated (must be .pdf)
4. Upload starts
5. See "Uploading..." state with spinner
```

**3. Wait for AI Processing**

```
Once uploaded:
- Mutation completes: "Template uploaded successfully!"
- Toast shows template ID
- Templates list refreshes automatically
- New template appears with status: "PROCESSING"
```

**4. View Processing Status**

```
Back on Templates page:
- See new template in grid with "PROCESSING" badge
- Backend processes PDF via BullMQ queue
- AI extracts requirements
- Status changes to "AVAILABLE" when done
- OR status changes to "FAILED" if there was an error

Admin can refresh page to see updated status
(React Query will refresh data after 5 minutes or manual refresh)
```

**Data Flow:**

```
Upload Form (Client)
    ↓ fetch with FormData
Next.js API Route: POST /api/templates/upload
    ↓ forward FormData
Backend: POST /templates/upload
    ↓ save file, queue job
BullMQ Queue (Background)
    ↓ process file
OpenAI API
    ↓ extract requirements
Backend Database
    ↓ save categories & requirements
Pusher Event: Template ready
    ↓ optionally notify admins
Frontend: React Query invalidates cache
    ↓ refetch templates list
UI Updates: New template visible with AVAILABLE status
```

---

## Use Case 2: User Creates Assessment from Template

### Scenario

A compliance officer wants to assess their organization's compliance with a standard.

### Workflow

**1. View Available Templates**

```
Home → Click "Templates" button
       OR
Left header navigation → "Templates"
       OR
Direct URL: /templates
```

**2. Find Template**

```
On Templates page:
1. See list of templates in grid
2. Look for template with status "AVAILABLE" (not PROCESSING or FAILED)
3. Can see:
   - Template title
   - Status badge (green = AVAILABLE)
   - Number of categories & requirements
   - Date created
```

**3. Start Assessment**

```
Click "Start Assessment" button on template card
    ↓ Navigation to: /assessments/new?templateId={id}
    ↓ OR Direct: Click template to view details
    ↓ Then: Click "Create Assessment" button
```

**4. Assessment Created**

```
Behind the scenes:
1. Component calls: useCreateAssessment()
2. Sends: POST /api/assessments { templateId }
3. API route forwards to backend
4. Backend creates Assessment record in DB
5. Backend returns: { id, userId, templateId, status: "IN_PROGRESS" }
6. React Query invalidates ['assessments'] cache
7. Navigate to: /assessments/{assessmentId}

User sees:
- Redirect to assessment detail page
- Assessment form loads with all requirements
- Ready to fill in responses
```

**Data Flow:**

```
Start Assessment Button (Client)
    ↓ useCreateAssessment() mutation
Next.js API Route: POST /api/assessments
    ↓ forward request with templateId
Backend: POST /assessments
    ↓ create Assessment record
PostgreSQL Database
    ↓ save record
Backend Response: { id, userId, templateId, ... }
    ↓ return to client
React Query: Invalidate ['assessments']
    ↓ refetch assessments list
Navigation: /assessments/{id}
    ↓ load assessment detail
Assessment Form Loads: Display all requirements
```

---

## Use Case 3: User Fills Assessment Form

### Scenario

Compliance officer is filling out the assessment for their organization.

### Workflow

**1. View Assessment**

```
URL: /assessments/[id]
Assessment Detail Page loads:
1. Shows template title (e.g., "ISO 27001 Requirements")
2. Assessment status badge (e.g., "IN_PROGRESS")
3. All requirements organized by category
```

**2. View Requirements**

```
Page structure:
- Category 1 (e.g., "Information Security Governance")
  ├─ Requirement 1.1
  │  ├─ Title
  │  ├─ Description
  │  ├─ Input: Implementation Details (textarea)
  │  ├─ Input: Evidence Link (URL)
  │  └─ Button: "Save Response"
  ├─ Requirement 1.2
  │  └─ ... same structure
  └─ Requirement 1.3
- Category 2
  └─ ... more requirements
```

**3. Fill In Response**

```
For each requirement:
1. Read title & description
2. Fill "Implementation Details" textarea with explanation
   Example: "We have documented security policies in..."
3. Fill "Evidence Link" with URL
   Example: "https://intranet.company.com/policies/security.pdf"
4. Click "Save Response" button
```

**4. Save Response**

```
Behind the scenes:
1. Component calls: updateSubmission() mutation
2. Sends: PUT /api/submissions with:
   {
     assessmentId: "...",
     requirementId: "...",
     implementationDetail: "...",
     evidenceLink: "..."
   }
3. API route forwards to backend
4. Backend creates/updates Submission record
5. Backend returns: Submission
6. React Query invalidates assessment queries
7. Assessment refreshes with new submission

User sees:
- Button goes to "Saving..." state
- Form fields are disabled
- After save: "Submission saved successfully!" toast
- Data persists (stays in form even after refresh)
- Can move to next requirement
```

**Data Flow:**

```
"Save Response" Button (Client)
    ↓ updateSubmission() mutation
Next.js API Route: PUT /api/submissions
    ↓ forward request
Backend: PUT /submissions
    ↓ create/update Submission
PostgreSQL Database
    ↓ save submission record
Backend Response: { id, status: "PENDING", ... }
    ↓ return to client
React Query: Invalidate ['assessments'] & ['assessment', id]
    ↓ automatic refetch
Assessment Form: Re-renders with saved data
    ↓ shows saved status
Toast: "Submission saved successfully!"
```

**5. Continue Filling Form**

```
User repeats for each requirement:
- Read requirement
- Fill implementation details
- Add evidence link
- Save

Can save partial assessments
Can come back later to continue (data is persisted)
```

---

## Use Case 4: User Reviews Assessment

### Scenario

An authorized user wants to review all submissions for an assessment.

### Workflow

**1. Navigate to Assessments**

```
Home → Click "My Assessments" button
       OR
Left header navigation → "My Assessments"
       OR
Direct URL: /assessments
```

**2. View Assessment List**

```
Page shows all user's assessments:
- Assessment ID
- Status (IN_PROGRESS, SUBMITTED, REVIEWED)
- Last updated date
- Click any assessment to view details
```

**3. View Assessment Details**

```
Click on assessment → /assessments/[id]
Shows:
- Template title
- Assessment status
- All categories with requirements
- Each requirement shows:
  - Current submission (if exists)
  - Status (PENDING, COMPLIANT, REJECTED)
  - Implementation details
  - Evidence link
```

**Data Flow:**

```
Navigate to Assessment (Client)
    ↓ useAssessment(id) hook
Next.js API Route: GET /api/assessments/[id]
    ↓ forward request
Backend: GET /assessments/[id]
    ↓ query with joins
PostgreSQL Database
    ↓ return assessment with submissions
Backend Response:
    {
      id, templateId, status,
      submissions: [
        { id, requirementId, detail, link, status },
        ...
      ]
    }
    ↓ return to client
React Query: Cache assessment data
    ↓ display in component
Assessment Detail Page: Shows all requirements with submissions
```

---

## Use Case 5: Admin Reviews & Approves Submissions

### Scenario

An authorized administrator reviews user submissions and approves or rejects them.

### Workflow

**1. Navigate to Assessments**

```
Admin views assessments (possibly through custom admin dashboard)
Or: Uses same /assessments view
```

**2. Review Submission**

```
Admin sees submission details:
- Implementation detail provided by user
- Evidence link provided by user
- Current status (PENDING, COMPLIANT, REJECTED)
```

**3. Review & Update Status**

```
Admin evaluates:
- Is implementation adequate?
- Is evidence provided?
- Does it meet compliance standard?

Admin can:
- Change status to "COMPLIANT" - approved
- Change status to "REJECTED" - needs revision
- Add comment/notes (if supported)
```

**4. Save Review Decision**

```
Behind the scenes:
1. Admin clicks approve/reject button
2. Component calls: useReviewSubmission() mutation
3. Sends: PUT /api/submissions/[id]/review with:
   {
     status: "COMPLIANT" or "REJECTED"
   }
4. API route forwards to backend
5. Backend updates Submission status
6. Backend updates Assessment status if all reviewed
7. React Query invalidates assessment queries
8. Pusher event sent: SUBMISSION_REVIEWED

User sees:
- Submission status updated
- Assessment status may change to REVIEWED
- Notifications sent to user (if configured)
```

**Data Flow:**

```
Review Decision (Admin) (Client)
    ↓ useReviewSubmission() mutation
Next.js API Route: PUT /api/submissions/[id]/review
    ↓ forward request
Backend: PUT /submissions/[id]/review
    ↓ verify admin role
    ↓ update submission status
PostgreSQL Database
    ↓ save updated submission
Backend: Trigger Pusher event
    ↓ notify about status change
Backend Response: { id, status: "COMPLIANT", ... }
    ↓ return to client
React Query: Invalidate assessments cache
    ↓ refetch and update UI
Assessment Page: Updates show COMPLIANT status
```

---

## Use Case 6: View Assessment Progress

### Scenario

User wants to see the overall progress of an assessment.

### Workflow

**1. View Assessment**

```
Navigate to: /assessments/[id]
Assessment detail page shows:
- Template name & description
- Assessment status
- List of all categories
- For each category:
  - Category name
  - Number of requirements
  - Submission status breakdown
```

**2. Progress Metrics** (Ready for Enhancement)

```
Could show:
- Total requirements: 45
- Completed: 32 (71%)
- Pending review: 8
- Approved: 24
- Rejected: 0
- Progress bar: ████████░░ 71%
```

**3. Drill Down**

```
Click on category to see:
- All requirements in category
- Status of each requirement
- Implementation details
- Evidence links
```

---

## Use Case 7: Search & Filter Templates

### Scenario (Future Enhancement)

User wants to find templates by name or status.

### Workflow (Ready for Implementation)

**1. Search Templates**

```
Search box on /templates page
Type template name or keyword
React Query searches with:
/api/templates?search=term
```

**2. Filter by Status**

```
Filter buttons: "All" / "Available" / "Processing" / "Failed"
Updates query key: ['templates', filterStatus]
React Query refetches with filter
```

---

## Use Case 8: Export Assessment Results

### Scenario (Future Enhancement)

User wants to export assessment as PDF report.

### Workflow (Ready for Implementation)

**1. View Assessment**

```
Navigate to: /assessments/[id]
```

**2. Export**

```
Click "Export as PDF" button
Component calls: downloadAssessmentPDF(assessmentId)
```

**3. Generate Report**

```
Backend generates PDF with:
- Template information
- All requirements
- User responses
- Review status
- Timestamps
- Digital signature (optional)
```

**4. Download**

```
PDF downloaded to user's computer
Filename: assessment-{id}-{date}.pdf
```

---

## Caching & Performance

### How Caching Works

Each use case benefits from React Query caching:

```typescript
// First load of templates
GET /api/templates
→ Calls backend
→ Caches response with key ['templates']
→ Data is "fresh" for 5 minutes

// Second load within 5 minutes
GET /api/templates
→ Returns cached data immediately
→ No API call
→ Instant response

// After 5 minutes
GET /api/templates
→ Data becomes "stale"
→ Next time needed: refetch in background
→ Meanwhile show stale data (better UX)

// After mutation (save response)
POST /api/submissions
→ Success
→ Invalidate ['assessments'] cache
→ Invalidate ['assessment', id] cache
→ React Query automatically refetches
→ UI updates with fresh data
```

### Cache Invalidation Scenarios

```
When to refetch:
├─ After upload template
│  └─ Invalidate: ['templates']
├─ After create assessment
│  └─ Invalidate: ['assessments']
├─ After save submission
│  └─ Invalidate: ['assessments'], ['assessment', id]
├─ After review submission
│  └─ Invalidate: ['assessments'], ['assessment', id]
└─ User manually refreshes
   └─ All queries refetch
```

---

## Error Scenarios

### Scenario 1: Upload Fails

```
1. User uploads large PDF
2. Upload takes too long
3. Browser timeout or network error
4. API route catches error
5. Returns: { error: 'Upload failed' }
6. Component shows: "Failed to upload template"
7. User can retry
```

### Scenario 2: Backend Not Available

```
1. User clicks "Start Assessment"
2. API call to: POST /api/assessments
3. Next.js route tries: fetch(NEXT_PUBLIC_BACKEND_URL/assessments)
4. Backend not responding
5. Catch block: console.error, return 500
6. Frontend shows: "Failed to create assessment"
7. Advise user to try again
```

### Scenario 3: Network Interruption

```
1. User saving submission
2. Network connection lost mid-request
3. React Query retry: Retries 1 time automatically
4. Still fails: Shows error
5. Form data stays in component
6. User can retry when connection restored
```

---

## Performance Characteristics

### Load Times (Typical)

```
Page loads:
├─ Home: 0.5s (mostly client-side)
├─ Templates: 1.2s (fetch list)
├─ Assessments: 1.5s (fetch list)
└─ Assessment Detail: 2.0s (fetch with joins)

After cache warm:
├─ Home: 0.5s (no change)
├─ Templates: 0.3s (cached)
├─ Assessments: 0.3s (cached)
└─ Assessment Detail: 0.5s (cached)
```

### API Response Times

```
GET /api/templates: 200-500ms
POST /api/templates/upload: 1-3s (depends on file size)
GET /api/assessments: 300-800ms
GET /api/assessments/[id]: 400-1000ms (has joins)
PUT /api/submissions: 200-500ms
```

---

## Concurrent Users

### System can handle:

```
Light Load (< 100 users):
├─ All operations smooth
├─ API calls instant
└─ No issues

Medium Load (100-1000 users):
├─ Slight delays possible
├─ Queue processing may slow down
└─ Monitor backend performance

Heavy Load (> 1000 users):
├─ Add caching layer (Redis)
├─ Add database optimization
├─ Consider scaling backend
└─ Load balancing recommended
```

---

## Summary of Data Flows

### Read Operations

```
Component
  ↓ useQuery()
React Query (check cache)
  ↓
  ├─ If cached & fresh: Return cached data
  └─ If stale or missing:
       ↓ fetch()
       ├─ Next.js API Route
       │   ↓ fetch(BACKEND_URL)
       │   ├─ Backend Processing
       │   ├─ Database Query
       │   └─ Return Response
       ├─ React Query caches response
       ├─ Component receives data
       └─ Component re-renders
```

### Write Operations

```
Component
  ↓ useMutation()
User Action (click button)
  ↓ mutate({data})
React Query
  ↓ fetch(method: POST/PUT)
Next.js API Route
  ↓ fetch(BACKEND_URL)
Backend
  ↓ Validate & Process
Database
  ↓ Save/Update
Backend Response
  ↓ Return Result
React Query
  ├─ Invalidate related caches
  ├─ Automatically refetch invalidated queries
  ├─ Show success/error
  └─ Component re-renders with new data
```

---

## Workflow Diagram

```
                          START
                           │
                    ┌──────┴──────┐
                    │             │
                  ADMIN         USER
                    │             │
         ┌──────────┴──────┐      │
         │                 │      │
      UPLOAD            NO UPLOAD │
      PDF                        │
         │                       │
    PROCESS               BROWSE
    (AI)                  TEMPLATES
         │                       │
      AVAILABLE            CREATE
      TEMPLATE             ASSESSMENT
         │                       │
         │                   FILL FORM
         │                       │
         │                SAVE RESPONSE
         │                       │
         │                   SUBMIT
         │                       │
      READY                 PENDING
      FOR                   REVIEW
      USE                       │
         │                   ADMIN
         │                   REVIEW
         │                       │
         │              ┌────────┴────────┐
         │              │                 │
         │           APPROVE            REJECT
         │              │                 │
         │          COMPLIANT         REQUEST
         │              │             REVISION
         │              │                 │
         └──────────────┴─────────────────┘
                        │
                   COMPLETED
                        │
                      END
```

---

## Next Steps for Implementation

### Phase 2 Enhancements

1. **Search & Filter**
   - Add search box on templates page
   - Filter templates by status, date range
   - Full-text search

2. **Dashboard**
   - Admin dashboard showing all assessments
   - Statistics and analytics
   - Recent activity

3. **Notifications**
   - Email notifications on status changes
   - In-app notifications via Pusher
   - User preferences for notifications

4. **Export**
   - PDF export of assessment
   - Excel export of requirements
   - Custom report templates

5. **Audit Trail**
   - Log all changes
   - View history
   - Rollback capability

6. **Collaboration**
   - Assign assessments to team members
   - Comments and discussions
   - Approval workflows

---

## Testing Checklist

Use this to verify each use case works:

- [ ] Admin can upload PDF
- [ ] Templates show in list after upload
- [ ] Status changes from PROCESSING to AVAILABLE
- [ ] User can see template details
- [ ] User can start assessment
- [ ] Assessment appears in user's list
- [ ] User can fill requirement responses
- [ ] Responses are saved
- [ ] Admin can see submissions to review
- [ ] Admin can mark as COMPLIANT/REJECTED
- [ ] Status updates in user's view
- [ ] Navigation works between pages
- [ ] Loading states show correctly
- [ ] Error messages display
- [ ] Can refresh page and data persists

---

**Ready to test? Start with Use Case 1 (Admin Upload)!**
