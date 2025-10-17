# LMS Embeddable HTML Blocks for Durable Site

**Matching your professional Elevate for Humanity branding**

Copy each block below and paste into Durable's Custom HTML sections.

---

## 🎨 Design System Extracted from Your Site

- **Primary Color**: #4D4B37 (Olive/Brown)
- **Background**: #FFFFFF (White)
- **Text**: #000000 (Black)
- **Accent**: Professional, clean typography
- **Layout**: Container-based, responsive grid
- **Buttons**: Rounded, solid colors with hover effects
- **Cards**: Clean white cards with subtle shadows

---

## 📝 BLOCK 1: Student Portal Navigation

**Purpose**: Top navigation bar for all LMS pages  
**Where to use**: Top of every LMS page

```html
<!-- STUDENT PORTAL NAVIGATION -->
<div
  style="background: linear-gradient(135deg, #4D4B37 0%, #6B6847 100%); padding: 2rem 0; text-align: center; color: white;"
>
  <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
    <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
      🎓 Student Portal
    </h1>
    <p style="font-size: 1.125rem; opacity: 0.95;">
      Elevate for Humanity Career & Training Institute
    </p>
  </div>
</div>

<nav
  style="background: white; padding: 1rem 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;"
>
  <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
    <div
      style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;"
    >
      <a
        href="/enrollment"
        style="padding: 0.75rem 1.5rem; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #333; font-weight: 600; transition: all 0.3s;"
        >📝 Enrollment</a
      >
      <a
        href="/dashboard"
        style="padding: 0.75rem 1.5rem; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #333; font-weight: 600; transition: all 0.3s;"
        >📊 Dashboard</a
      >
      <a
        href="/courses"
        style="padding: 0.75rem 1.5rem; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #333; font-weight: 600; transition: all 0.3s;"
        >📚 My Courses</a
      >
      <a
        href="/certificates"
        style="padding: 0.75rem 1.5rem; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #333; font-weight: 600; transition: all 0.3s;"
        >🏆 Certificates</a
      >
      <a
        href="/profile"
        style="padding: 0.75rem 1.5rem; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #333; font-weight: 600; transition: all 0.3s;"
        >👤 Profile</a
      >
      <a
        href="/support"
        style="padding: 0.75rem 1.5rem; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #333; font-weight: 600; transition: all 0.3s;"
        >💬 Support</a
      >
    </div>
  </div>
</nav>

<style>
  nav a:hover {
    background: #4d4b37 !important;
    color: white !important;
  }
</style>
```

---

## 📝 BLOCK 2: Enrollment Form

**Purpose**: Course enrollment page  
**Page**: Create new page called "Enrollment" or "Enroll"

```html
<!-- ENROLLMENT FORM -->
<div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
  <div
    style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
  >
    <h2
      style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: #4D4B37;"
    >
      📝 Course Enrollment
    </h2>
    <p style="margin-bottom: 2rem; color: #6b7280;">
      Select and enroll in professional certification programs. All courses
      include hybrid learning with online modules and hands-on skills
      validation.
    </p>

    <form style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div>
        <label
          style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
          >Select Training Program *</label
        >
        <select
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
          required
        >
          <option value="">Choose a program...</option>
          <optgroup label="Healthcare & Public Safety">
            <option value="hha">Home Health Aide (HHA) Training - $299</option>
            <option value="cpr">CPR & OSHA Safety Technician - $89</option>
            <option value="dsp">
              Direct Support Professional (DSP) - $199
            </option>
          </optgroup>
          <optgroup label="Technology & Digital Tools">
            <option value="microsoft">
              Microsoft Office Specialist - $149
            </option>
            <option value="google">Google Workspace Productivity - $99</option>
            <option value="digital-literacy">
              Digital Literacy & IC3 - $129
            </option>
          </optgroup>
          <optgroup label="Food Service & Business">
            <option value="servsafe">ServSafe Food Handler - $69</option>
            <option value="servsafe-manager">ServSafe Manager - $149</option>
            <option value="entrepreneurship">
              Youth Entrepreneurship - $199
            </option>
          </optgroup>
        </select>
      </div>

      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;"
      >
        <div>
          <label
            style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
            >First Name *</label
          >
          <input
            type="text"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
            required
          />
        </div>
        <div>
          <label
            style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
            >Last Name *</label
          >
          <input
            type="text"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
            required
          />
        </div>
      </div>

      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;"
      >
        <div>
          <label
            style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
            >Email Address *</label
          >
          <input
            type="email"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
            required
          />
        </div>
        <div>
          <label
            style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
            >Phone Number *</label
          >
          <input
            type="tel"
            style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
            required
          />
        </div>
      </div>

      <div>
        <label
          style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
          >Funding Source</label
        >
        <select
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
        >
          <option value="">Select funding source...</option>
          <option value="self-pay">Self Pay</option>
          <option value="wioa">WIOA (Workforce Innovation)</option>
          <option value="employer">Employer Sponsored</option>
          <option value="grant">Grant/Scholarship</option>
          <option value="va-benefits">VA Benefits</option>
        </select>
      </div>

      <button
        type="submit"
        style="width: 100%; background: #4D4B37; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s;"
      >
        Submit Enrollment Application
      </button>
    </form>
  </div>
</div>

<style>
  button:hover {
    background: #3a3629 !important;
  }
  input:focus,
  select:focus {
    outline: none;
    border-color: #4d4b37;
    box-shadow: 0 0 0 3px rgba(77, 75, 55, 0.1);
  }
</style>
```

---

## 📊 BLOCK 3: Dashboard

**Purpose**: Student dashboard with progress  
**Page**: Create new page called "Dashboard"

```html
<!-- DASHBOARD -->
<div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
  <div
    style="background: #d1fae5; border: 1px solid #a7f3d0; color: #065f46; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;"
  >
    <strong>Welcome back, Student!</strong> You have 2 active courses and 1
    completed certification.
  </div>

  <div
    style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;"
  >
    <div
      style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;"
    >
      <h3
        style="color: #4D4B37; margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600;"
      >
        Overall Progress
      </h3>
      <div
        style="background: #e5e7eb; border-radius: 10px; height: 20px; margin: 1rem 0; overflow: hidden;"
      >
        <div
          style="background: linear-gradient(90deg, #059669, #10b981); height: 100%; width: 68%; border-radius: 10px;"
        ></div>
      </div>
      <p>68% Complete - 2 of 3 courses finished</p>
    </div>

    <div
      style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;"
    >
      <h3
        style="color: #4D4B37; margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600;"
      >
        Quick Stats
      </h3>
      <p><strong>Enrolled Courses:</strong> 3</p>
      <p><strong>Completed:</strong> 1</p>
      <p><strong>Certificates Earned:</strong> 1</p>
      <p><strong>Next Deadline:</strong> March 15, 2024</p>
    </div>
  </div>

  <div
    style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
  >
    <h3 style="margin-bottom: 1rem; font-size: 1.5rem; font-weight: 600;">
      Recent Activity
    </h3>
    <ul style="list-style: none; padding: 0;">
      <li style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
        <strong>March 10:</strong> Completed CPR Skills Assessment
      </li>
      <li style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
        <strong>March 8:</strong> Submitted Module 3 Assignment - Microsoft
        Excel
      </li>
      <li style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
        <strong>March 5:</strong> Started OSHA 10 Hour Training
      </li>
      <li style="padding: 0.75rem 0;">
        <strong>March 1:</strong> Earned ServSafe Food Handler Certificate
      </li>
    </ul>
  </div>
</div>
```

---

## 📚 BLOCK 4: My Courses

**Purpose**: Course list with progress tracking  
**Page**: Create new page called "My Courses" or "Courses"

```html
<!-- MY COURSES -->
<div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
  <h2
    style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; color: #4D4B37;"
  >
    📚 My Courses
  </h2>

  <div
    style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; background: #f8fafc;"
  >
    <div
      style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;"
    >
      <h3 style="color: #4D4B37; font-size: 1.25rem; font-weight: 600;">
        CPR & OSHA Safety Technician
      </h3>
      <span
        style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; background: #d1fae5; color: #059669;"
        >Completed</span
      >
    </div>
    <div
      style="background: #e5e7eb; border-radius: 10px; height: 20px; margin: 1rem 0; overflow: hidden;"
    >
      <div
        style="background: linear-gradient(90deg, #059669, #10b981); height: 100%; width: 100%; border-radius: 10px;"
      ></div>
    </div>
    <p><strong>Completion Date:</strong> February 28, 2024</p>
    <p><strong>Grade:</strong> 94% (Pass)</p>
    <br />
    <a
      href="/certificates"
      style="display: inline-block; padding: 0.75rem 1.5rem; background: #059669; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;"
      >View Certificate</a
    >
  </div>

  <div
    style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; background: #f8fafc;"
  >
    <div
      style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;"
    >
      <h3 style="color: #4D4B37; font-size: 1.25rem; font-weight: 600;">
        Microsoft Office Specialist
      </h3>
      <span
        style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; background: #fef3c7; color: #d97706;"
        >In Progress</span
      >
    </div>
    <div
      style="background: #e5e7eb; border-radius: 10px; height: 20px; margin: 1rem 0; overflow: hidden;"
    >
      <div
        style="background: linear-gradient(90deg, #059669, #10b981); height: 100%; width: 75%; border-radius: 10px;"
      ></div>
    </div>
    <p><strong>Progress:</strong> 75% Complete</p>
    <p><strong>Next Module:</strong> PowerPoint Advanced Features</p>
    <p><strong>Due Date:</strong> March 15, 2024</p>
    <br />
    <button
      style="padding: 0.75rem 1.5rem; background: #4D4B37; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
    >
      Continue Course
    </button>
  </div>

  <div
    style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; background: #f8fafc;"
  >
    <div
      style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;"
    >
      <h3 style="color: #4D4B37; font-size: 1.25rem; font-weight: 600;">
        OSHA 10 Hour Certification
      </h3>
      <span
        style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; background: #fef3c7; color: #d97706;"
        >In Progress</span
      >
    </div>
    <div
      style="background: #e5e7eb; border-radius: 10px; height: 20px; margin: 1rem 0; overflow: hidden;"
    >
      <div
        style="background: linear-gradient(90deg, #059669, #10b981); height: 100%; width: 30%; border-radius: 10px;"
      ></div>
    </div>
    <p><strong>Progress:</strong> 30% Complete</p>
    <p><strong>Next Module:</strong> Hazard Recognition</p>
    <p><strong>Due Date:</strong> March 30, 2024</p>
    <br />
    <button
      style="padding: 0.75rem 1.5rem; background: #4D4B37; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
    >
      Continue Course
    </button>
  </div>
</div>
```

---

## 🏆 BLOCK 5: Certificates

**Purpose**: Display earned certificates  
**Page**: Create new page called "Certificates"

```html
<!-- CERTIFICATES -->
<div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
  <h2
    style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; color: #4D4B37;"
  >
    🏆 My Certificates
  </h2>

  <div
    style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 2px solid #059669; border-radius: 12px; padding: 2rem; text-align: center;"
  >
    <h3
      style="font-size: 1.75rem; font-weight: 700; color: #059669; margin-bottom: 1rem;"
    >
      🏥 CPR & OSHA Safety Technician
    </h3>
    <p style="margin-bottom: 0.5rem;">
      <strong>Issued:</strong> February 28, 2024
    </p>
    <p style="margin-bottom: 0.5rem;">
      <strong>Expires:</strong> February 28, 2026
    </p>
    <p style="margin-bottom: 1.5rem;">
      <strong>Certificate ID:</strong> EFH-CPR-2024-001247
    </p>
    <div
      style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;"
    >
      <button
        style="padding: 0.75rem 1.5rem; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
      >
        Download PDF
      </button>
      <button
        style="padding: 0.75rem 1.5rem; background: #4D4B37; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;"
      >
        Share Certificate
      </button>
    </div>
  </div>
</div>
```

---

## 👤 BLOCK 6: Profile

**Purpose**: Student profile management  
**Page**: Create new page called "Profile"

```html
<!-- PROFILE -->
<div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
  <div
    style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
  >
    <h2
      style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; color: #4D4B37;"
    >
      👤 My Profile
    </h2>

    <form style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div>
        <label
          style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
          >Full Name</label
        >
        <input
          type="text"
          value="John Doe"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
        />
      </div>
      <div>
        <label
          style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
          >Email</label
        >
        <input
          type="email"
          value="john.doe@example.com"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
        />
      </div>
      <div>
        <label
          style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
          >Phone</label
        >
        <input
          type="tel"
          value="(555) 123-4567"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
        />
      </div>
      <button
        type="submit"
        style="width: 100%; background: #4D4B37; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer;"
      >
        Update Profile
      </button>
    </form>
  </div>
</div>
```

---

## 💬 BLOCK 7: Support

**Purpose**: Support ticket system  
**Page**: Create new page called "Support"

```html
<!-- SUPPORT -->
<div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
  <div
    style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
  >
    <h2
      style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; color: #4D4B37;"
    >
      💬 Support
    </h2>

    <div
      style="background: #dbeafe; border: 1px solid #93c5fd; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;"
    >
      <h3
        style="font-size: 1.25rem; font-weight: 600; color: #1e40af; margin-bottom: 0.5rem;"
      >
        Need Help?
      </h3>
      <p style="margin-bottom: 1rem; color: #374151;">
        Our support team is here to assist you Monday-Friday, 9 AM - 5 PM EST
      </p>
      <p style="color: #374151;">
        <strong>Email:</strong> support@elevateforhumanity.org
      </p>
      <p style="color: #374151;"><strong>Phone:</strong> (555) 123-4567</p>
    </div>

    <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">
      Submit a Support Ticket
    </h3>
    <form style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div>
        <label
          style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
          >Subject</label
        >
        <input
          type="text"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
        />
      </div>
      <div>
        <label
          style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;"
          >Message</label
        >
        <textarea
          rows="5"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
        ></textarea>
      </div>
      <button
        type="submit"
        style="width: 100%; background: #4D4B37; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer;"
      >
        Submit Ticket
      </button>
    </form>
  </div>
</div>
```

---

## 🚀 How to Use These Blocks

### Step 1: Create Pages in Durable

1. Go to your Durable dashboard
2. Create these new pages:
   - Enrollment
   - Dashboard
   - My Courses
   - Certificates
   - Profile
   - Support

### Step 2: Add Custom HTML Blocks

1. On each page, add a "Custom HTML" section
2. Copy the corresponding block code above
3. Paste into the Custom HTML section
4. Add the Navigation block (Block 1) at the top of each page

### Step 3: Update Navigation Links

Replace the href values in Block 1 with your actual Durable page URLs:

- `/enrollment` → Your enrollment page URL
- `/dashboard` → Your dashboard page URL
- etc.

### Step 4: Customize

- Change colors if needed (search for `#4D4B37` to replace primary color)
- Update text content
- Add your logo
- Connect forms to your email/CRM

---

## 📋 Quick Reference

| Block   | Purpose         | Page Name    |
| ------- | --------------- | ------------ |
| Block 1 | Navigation      | All pages    |
| Block 2 | Enrollment Form | Enrollment   |
| Block 3 | Dashboard       | Dashboard    |
| Block 4 | Course List     | My Courses   |
| Block 5 | Certificates    | Certificates |
| Block 6 | Profile         | Profile      |
| Block 7 | Support         | Support      |

---

**All blocks match your professional Elevate for Humanity branding!** 🎨
