# 🔐 Test Login Credentials

## Academic Manager (EMS) Login

### **Primary Test Account:**
```
📧 Email: ems.admin@dipl.edu
🔑 Password: admin@123
👤 Role: Academic Manager (EMS)
🏢 Company: DIPL (Durkkas Institute of Professional Learning)
```

---

## Other Test Accounts

### **Platform Admin (Level 5)**
```
📧 Email: admin@durkkas.com
🔑 Password: durkkas@2026
👤 Role: Platform Admin
🎯 Access: Full system access
```

### **Company Admin (Level 4)**
```
📧 Email: admin@durkkas.in
🔑 Password: Admin@123
👤 Role: Company Admin
🏢 Company: DIPL
```

### **Alternative Company Admin**
```
📧 Email: admin@dipl.edu
🔑 Password: admin@123
👤 Role: Company Admin
🏢 Company: DIPL Academy
```

---

## 🚀 How to Test Academic Manager Dashboard

### **Step 1: Login**
1. Navigate to: `http://localhost:3001/login`
2. Enter credentials:
   - Email: `ems.admin@dipl.edu`
   - Password: `admin@123`
3. Click "Login"

### **Step 2: Access Dashboard**
After login, you should be redirected to:
```
http://localhost:3001/ems/academic-manager/dashboard
```

### **Step 3: Test Navigation**

#### **Top Navbar:**
- ✅ Click search icon (mobile)
- ✅ Click notifications bell
- ✅ Click profile icon → dropdown should open
- ✅ Click any quick action in dropdown

#### **Dashboard:**
- ✅ Click any stat card (Courses, Batches, Students, Tutors)
- ✅ Click any quick action button
- ✅ Click "Create First Course"
- ✅ Click "View Analytics Dashboard"

#### **Bottom Nav (Mobile):**
1. Resize browser to mobile width (< 768px)
2. Bottom navigation should appear
3. Click each icon:
   - Dashboard
   - Students
   - Courses
   - Batches
   - Tasks
   - Analytics

### **Step 4: Test All Pages**

Navigate to each page and verify no 404 errors:

```
✅ /ems/academic-manager/dashboard
✅ /ems/academic-manager/students
✅ /ems/academic-manager/courses
✅ /ems/academic-manager/batches
✅ /ems/academic-manager/assignments
✅ /ems/academic-manager/quizzes
✅ /ems/academic-manager/live-classes
✅ /ems/academic-manager/attendance
✅ /ems/academic-manager/analytics
✅ /ems/academic-manager/materials
✅ /ems/academic-manager/certificates
✅ /ems/academic-manager/progress
✅ /ems/academic-manager/timetable
✅ /ems/academic-manager/announcements
✅ /ems/academic-manager/tutors
✅ /ems/academic-manager/settings
```

---

## 🎨 What to Look For

### **Design Elements:**
- ✅ Purple theme (#9333EA) throughout
- ✅ Gradient headings (purple-600 to purple-800)
- ✅ Professional cards with shadows
- ✅ Smooth animations on page load
- ✅ Hover effects on buttons/cards

### **Responsive Behavior:**
- ✅ Desktop (> 1024px): Full layout, no bottom nav
- ✅ Tablet (768-1024px): Adjusted spacing
- ✅ Mobile (< 768px): Bottom nav visible, compact layout

### **Navigation:**
- ✅ All links work (no 404)
- ✅ Back buttons navigate correctly
- ✅ Profile dropdown opens/closes
- ✅ Active states on bottom nav

---

## 🐛 Troubleshooting

### **Issue: Login fails**
**Solution:** Check if backend is running on port 3000
```bash
# Check backend status
curl http://localhost:3000/health
```

### **Issue: 404 on dashboard**
**Solution:** Verify frontend is running on port 3001
```bash
# Check frontend status
curl http://localhost:3001
```

### **Issue: User not found**
**Solution:** Run the EMS seed script
```bash
cd backend
psql -U postgres -d durkkas_erp -f database/seed_ems_admin_user.sql
```

### **Issue: Wrong redirect after login**
**Solution:** Check user role level in database
```sql
SELECT u.email, r.name, r.level 
FROM app_auth.users u
JOIN app_auth.user_roles ur ON u.id = ur.user_id
JOIN app_auth.roles r ON ur.role_id = r.id
WHERE u.email = 'ems.admin@dipl.edu';
```

---

## 📊 Expected Behavior

### **After Login:**
1. User is authenticated
2. Redirected to `/ems/academic-manager/dashboard`
3. Top navbar shows:
   - "Academic Manager" logo
   - Search bar
   - Notifications bell (with red dot)
   - Profile icon

4. Dashboard shows:
   - Welcome message
   - 4 stat cards (all showing "0")
   - 4 quick action buttons
   - Course management section
   - Analytics overview

5. Bottom nav (mobile only):
   - 6 navigation items
   - Active state on "Dashboard"

### **Navigation Flow:**
```
Login → Dashboard → Click "Students" → Students Page
                  → Click "Courses" → Courses Page
                  → Click Profile → Dropdown Menu
                  → Click "Settings" → Settings Page
```

---

## 🎯 Testing Checklist

### **Basic Functionality:**
- [ ] Login successful
- [ ] Dashboard loads
- [ ] No 404 errors on any page
- [ ] All 16 pages accessible

### **UI/UX:**
- [ ] Purple theme consistent
- [ ] Animations smooth
- [ ] Cards have shadows
- [ ] Hover effects work

### **Navigation:**
- [ ] Top navbar functional
- [ ] Bottom nav visible on mobile
- [ ] Profile dropdown works
- [ ] Back buttons work

### **Responsive:**
- [ ] Desktop view correct
- [ ] Tablet view correct
- [ ] Mobile view correct
- [ ] Bottom nav hidden on desktop

---

## 🚀 Quick Start Command

```bash
# 1. Ensure backend is running
cd D:\ERP\Clown\foundation_durkkas\backend
npm run dev

# 2. Ensure frontend is running
cd D:\ERP\Clown\foundation_durkkas\frontend
npm run dev

# 3. Open browser
# Navigate to: http://localhost:3001/login

# 4. Login with:
# Email: ems.admin@dipl.edu
# Password: admin@123

# 5. You should land on:
# http://localhost:3001/ems/academic-manager/dashboard
```

---

**Created:** 2026-02-01  
**Status:** ✅ Ready for Testing  
**All Pages:** 16/16 Created  
**404 Errors:** 0
