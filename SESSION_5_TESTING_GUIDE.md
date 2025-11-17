# Session 5: Maintenance System - Testing Guide 🧪

## Quick Testing Checklist

### ✅ Pre-Testing Setup
```bash
# Ensure your backend API is running
# Update .env.local with correct API URL
NEXT_PUBLIC_API_BASE_URL=http://your-api-url/api
```

### 1️⃣ View Maintenance Requests Page
**URL:** `/maintenance`

**What to Check:**
- [ ] Page loads without errors
- [ ] Statistics cards display (4 cards):
  - Total Requests
  - Open Requests
  - Resolved Requests
  - Average Resolution Time
- [ ] Request list displays in grid layout
- [ ] Each request card shows:
  - Request number
  - Title
  - Status badge (color-coded)
  - Priority badge (color-coded)
  - Category with icon
  - Created date
  - Description preview
  - Action buttons (View Details, Add Note)
- [ ] "New Request" button visible in header

**Expected API Calls:**
```
GET /api/tenant/maintenance/statistics
GET /api/tenant/maintenance/requests
```

---

### 2️⃣ Filter Requests
**On:** `/maintenance`

**What to Test:**
1. **Status Filter:**
   - [ ] Open status dropdown
   - [ ] Select "In Progress"
   - [ ] List updates to show only in-progress requests
   - [ ] Try other statuses (Received, Assigned, Resolved, Closed)

2. **Priority Filter:**
   - [ ] Open priority dropdown
   - [ ] Select "Urgent"
   - [ ] List updates to show only urgent requests
   - [ ] Try other priorities (Low, Normal, Emergency)

3. **Search:**
   - [ ] Type "leak" in search box
   - [ ] Press Enter
   - [ ] Results filter to matching requests
   - [ ] Clear search, results restore

4. **Combined Filters:**
   - [ ] Set status to "In Progress"
   - [ ] Set priority to "Urgent"
   - [ ] Enter search term
   - [ ] All filters apply simultaneously

**Expected API Calls:**
```
GET /api/tenant/maintenance/requests?status=in_progress
GET /api/tenant/maintenance/requests?priority=urgent
GET /api/tenant/maintenance/requests?search=leak
GET /api/tenant/maintenance/requests?status=in_progress&priority=urgent&search=leak
```

---

### 3️⃣ View Request Details
**On:** `/maintenance`

**What to Test:**
1. [ ] Click "View Details" on any request card
2. [ ] Dialog opens with full request information
3. [ ] Verify displayed information:
   - [ ] Request number and title
   - [ ] Status and priority badges
   - [ ] Full description
   - [ ] Category with icon
   - [ ] Reported date
   - [ ] Preferred start date (if set)
   - [ ] Assigned caretaker (if assigned)
   - [ ] Resolution note (if resolved)
   - [ ] Media attachments (if any)
   - [ ] Activity timeline with notes
4. [ ] "Add Note" button visible
5. [ ] Click outside or X to close dialog

**Expected API Calls:**
```
GET /api/tenant/maintenance/requests/{id}
```

**Edge Cases:**
- [ ] Request with no media
- [ ] Request with no notes
- [ ] Request without assigned caretaker
- [ ] Request without preferred date
- [ ] Resolved request with resolution note

---

### 4️⃣ Add Note to Request
**On:** `/maintenance` (with details dialog open)

**What to Test:**
1. [ ] Open request details
2. [ ] Click "Add Note" button
3. [ ] Add Note modal opens
4. [ ] Enter note text
5. [ ] Click "Add Note" button
6. [ ] Success toast appears
7. [ ] Modal closes automatically
8. [ ] Note appears in activity timeline
9. [ ] Note shows correct user and timestamp

**Expected API Calls:**
```
POST /api/tenant/maintenance/requests/{id}/notes
Body: { "note": "Your note text" }
```

**Validation Tests:**
- [ ] Try to submit empty note (should show error)
- [ ] Cancel button closes modal without saving
- [ ] Note persists after page refresh

---

### 5️⃣ Create New Maintenance Request
**URL:** `/maintenance/create`

**What to Test:**

#### Navigation:
1. [ ] Click "New Request" from main page
2. [ ] Navigates to create page
3. [ ] Back arrow navigates back

#### Form Fields:
1. **Title:**
   - [ ] Enter: "Kitchen faucet leaking"
   - [ ] Required field (error if empty)

2. **Description:**
   - [ ] Enter detailed description
   - [ ] Required field (error if empty)
   - [ ] Multi-line textarea

3. **Category:**
   - [ ] Dropdown loads categories from API
   - [ ] Categories show icon + name
   - [ ] Required field (error if not selected)
   - [ ] Categories include: Plumbing, Electrical, HVAC, Appliances, etc.

4. **Priority:**
   - [ ] Dropdown has 4 options: Low, Normal, Urgent, Emergency
   - [ ] Default is "Normal"
   - [ ] Required field

5. **Preferred Start Date:**
   - [ ] Date picker allows future dates
   - [ ] Optional field (can be left empty)
   - [ ] Cannot select past dates

6. **File Upload:**
   - [ ] Click upload area
   - [ ] Select image file (JPG, PNG)
   - [ ] File appears in list with name
   - [ ] X button removes file
   - [ ] Upload multiple files (2-3)
   - [ ] All files listed
   - [ ] Can remove individual files

#### Submission:
1. [ ] Fill all required fields
2. [ ] Click "Create Request"
3. [ ] Loading state shows "Creating..."
4. [ ] Success toast appears
5. [ ] Redirects to `/maintenance`
6. [ ] New request appears in list

**Expected API Calls:**
```
GET /api/tenant/maintenance/categories (on page load)
POST /api/tenant/maintenance/requests (on submit)
Content-Type: multipart/form-data
```

#### Help Sidebar:
- [ ] Tips card displays
- [ ] Priority guide shows all 4 levels
- [ ] Response time info visible
- [ ] Common categories list visible

**Validation Tests:**
- [ ] Submit with empty title (shows error)
- [ ] Submit with empty description (shows error)
- [ ] Submit without category (shows error)
- [ ] Cancel button navigates back

---

### 6️⃣ Empty States
**What to Test:**

1. **No Requests:**
   - [ ] If no requests exist, shows empty state message
   - [ ] "Create Your First Request" CTA button visible
   - [ ] Clicking CTA navigates to create page

2. **No Filtered Results:**
   - [ ] Apply filters that match no requests
   - [ ] Shows "No maintenance requests found"
   - [ ] Showing "0 of X requests"

---

### 7️⃣ Loading States
**What to Test:**

1. **Initial Load:**
   - [ ] Statistics cards show skeleton loaders
   - [ ] Request list shows skeleton loaders (6 cards)

2. **Creating Request:**
   - [ ] Button shows "Creating..." text
   - [ ] Button is disabled
   - [ ] Form fields remain enabled

3. **Adding Note:**
   - [ ] Button shows "Adding..." text
   - [ ] Button is disabled

4. **Request Details:**
   - [ ] Dialog shows skeleton loaders while fetching

---

### 8️⃣ Error States
**What to Test:**

1. **API Error:**
   - [ ] Disconnect network/stop API
   - [ ] Try to load requests
   - [ ] Error alert displays
   - [ ] "Retry" button visible
   - [ ] Click retry re-attempts API call

2. **Form Submission Error:**
   - [ ] Submit form with API down
   - [ ] Error toast appears
   - [ ] Form remains filled (data not lost)
   - [ ] Can retry submission

3. **Note Submission Error:**
   - [ ] Try to add note with API error
   - [ ] Error toast appears
   - [ ] Modal remains open
   - [ ] Can retry

---

### 9️⃣ Responsive Design
**What to Test:**

**Desktop (1920px):**
- [ ] Statistics: 4 cards in row
- [ ] Request list: 3 columns
- [ ] Create page: 2/3 form, 1/3 sidebar

**Tablet (768px):**
- [ ] Statistics: 2 cards per row
- [ ] Request list: 2 columns
- [ ] Create page: Form and sidebar stack

**Mobile (375px):**
- [ ] Statistics: 1 card per row
- [ ] Request list: 1 column
- [ ] Create page: Single column layout
- [ ] All buttons full width
- [ ] Dialogs fill screen appropriately

---

### 🔟 Statistics Display
**On:** `/maintenance`

**What to Test:**

1. **Total Requests:**
   - [ ] Number matches total requests count
   - [ ] Shows "All time" label

2. **Open Requests:**
   - [ ] Number matches requests with status: received, assigned, in_progress, pending_approval, approved
   - [ ] Shows "Currently active" label
   - [ ] Blue clock icon

3. **Resolved Requests:**
   - [ ] Number matches requests with status: resolved, closed
   - [ ] Shows "Successfully completed" label
   - [ ] Green checkmark icon

4. **Average Resolution Time:**
   - [ ] Shows number of days (or "N/A" if no resolved requests)
   - [ ] Format: "X days"
   - [ ] Shows "Time to resolve" label

**Data Verification:**
- [ ] Create new request, verify Total Requests increases
- [ ] Filter by status "Open", count matches Open Requests stat
- [ ] Check if averages make sense based on request history

---

## 🎯 Quick Smoke Test (5 minutes)

Run this quick test to verify everything works:

1. [ ] Navigate to `/maintenance`
2. [ ] Verify page loads without console errors
3. [ ] Click "New Request"
4. [ ] Fill form with test data:
   - Title: "Test - Kitchen Sink Leak"
   - Description: "Water dripping from under sink"
   - Category: Plumbing
   - Priority: Urgent
5. [ ] Submit form
6. [ ] Verify redirect to main page
7. [ ] Find new request in list
8. [ ] Click "View Details"
9. [ ] Click "Add Note"
10. [ ] Add note: "Please fix ASAP"
11. [ ] Verify note appears in timeline
12. [ ] Close dialog
13. [ ] Test filters (pick any status)
14. [ ] Verify filtering works

**If all 14 steps pass, Session 5 is working! ✅**

---

## 🐛 Common Issues & Solutions

### Issue 1: "Categories not loading"
**Symptom:** Category dropdown shows "Loading..." forever
**Solution:**
- Check API endpoint: `GET /api/tenant/maintenance/categories`
- Verify API returns correct format
- Check browser console for errors

### Issue 2: "File upload fails"
**Symptom:** Files selected but request fails
**Solution:**
- Ensure backend accepts `multipart/form-data`
- Check file size (max 5MB)
- Verify file type (images/videos only)
- Check backend file upload configuration

### Issue 3: "Statistics show N/A"
**Symptom:** All stats show N/A or 0
**Solution:**
- Check API endpoint: `GET /api/tenant/maintenance/statistics`
- Verify tenant has maintenance requests in database
- Check API response format

### Issue 4: "Filters not working"
**Symptom:** Filtering doesn't update list
**Solution:**
- Check query parameter format in API calls
- Verify backend accepts filter parameters
- Check browser Network tab for API calls

### Issue 5: "Images not displaying"
**Symptom:** Media section empty despite having attachments
**Solution:**
- Check media URL format in API response
- Verify URLs are absolute and accessible
- Check CORS settings if images are on different domain
- Verify image URLs return valid images

---

## 📊 API Response Examples

### Successful Request Creation
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "id": "req_abc123",
    "request_number": "MNT-2024-001",
    "title": "Kitchen faucet leaking",
    "status": "received",
    "priority": "urgent",
    "created_at": "2024-11-12T10:30:00Z"
  }
}
```

### Request Details Response
```json
{
  "success": true,
  "data": {
    "id": "req_abc123",
    "request_number": "MNT-2024-001",
    "title": "Kitchen faucet leaking",
    "description": "Water dripping from under sink",
    "status": "in_progress",
    "priority": "urgent",
    "category": {
      "id": "cat_123",
      "name": "Plumbing",
      "icon": "🔧"
    },
    "assigned_to": {
      "id": "user_456",
      "name": "John Smith",
      "role": "caretaker"
    },
    "media": [
      {
        "type": "image",
        "url": "https://example.com/uploads/image1.jpg"
      }
    ],
    "notes": [
      {
        "note": "Please fix ASAP",
        "user": {
          "name": "Jane Tenant",
          "role": "tenant"
        },
        "created_at": "2024-11-12T11:00:00Z"
      }
    ],
    "created_at": "2024-11-12T10:30:00Z",
    "preferred_start_date": "2024-11-15"
  }
}
```

---

## ✅ Testing Completion Checklist

- [ ] All 10 test sections completed
- [ ] Quick smoke test passed
- [ ] Responsive design verified (3 breakpoints)
- [ ] All error states tested
- [ ] All loading states tested
- [ ] All empty states tested
- [ ] File upload tested
- [ ] API integration verified
- [ ] No console errors
- [ ] No linting errors

**When all items are checked, Session 5 testing is complete! 🎉**

---

**Happy Testing! 🧪✨**

