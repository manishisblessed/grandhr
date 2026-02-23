# GrandHR – Add Employee & Email Offer Letter (from noreply@grandhr.in)

This guide explains how **all confirmations** are sent from **noreply@grandhr.in**, how a company **adds an employee**, and how to **email an offer letter** to a candidate from that address.

---

## 1. All confirmations from noreply@grandhr.in

GrandHR sends these emails **from noreply@grandhr.in** (when `EMAIL_FROM` is set in the backend):

| Email type | When it’s sent |
|------------|----------------|
| Password reset | User requests “Forgot password” → reset link |
| Forgot username | User requests “Forgot username” → login details |
| Password changed | After user changes password successfully |
| Employee welcome | After company adds a new employee (login credentials) |
| Leave status | When leave is approved/rejected (if implemented) |
| **Offer letter to candidate** | When you use “Email to candidate” on the Offer Letter page |

**Backend setup:** In `backend/.env` set:

```env
EMAIL_FROM=noreply@grandhr.in
```

(Plus your SMTP settings; see `docs/NOREPLY_EMAIL_SETUP.md` for full setup.)

---

## 2. How a company adds an employee

1. **Log in** to GrandHR as a company admin (e.g. after onboarding).
2. Go to **Dashboard** (HR dashboard at `/hr/dashboard`).
3. **Option A – Quick action**  
   - Click the **“Add Employee”** button in the Quick Actions section.
4. **Option B – Sidebar**  
   - In the left sidebar, under **MAIN MENU**, click **Employees**  
   - Then use **“Add Employee”** (or the equivalent action on the Employees page).
5. **Fill the Add Employee form**  
   - Email (required), password, first name, last name  
   - Optional: phone, DOB, address, department, designation, salary, etc.
6. **Submit** the form.
7. The system will:
   - Create the employee and linked user account.
   - Send a **welcome email** with login credentials **from noreply@grandhr.in** to the employee’s email.

The new employee can then log in with the email and password set by the company.

---

## 3. How to email an offer letter to a candidate (from noreply@grandhr.in)

1. **Log in** to GrandHR and open **Documents** in the sidebar.
2. Click **Offer Letter**.
3. **Select or create a company** (company & template section at the top).
4. **Fill the form**  
   - Company details, **candidate name and email**, job (position, department, joining date, etc.), compensation, terms.
5. Click **“Preview”** to generate the offer letter.
6. In the **preview card** you will see:
   - **“Email offer letter to candidate (from noreply@grandhr.in)”**
   - An email input (pre-filled with the candidate’s email from the form).
   - A **“Send to email”** button.
7. **Check or edit the email address**, then click **“Send to email”**.
8. The system sends the offer letter **from noreply@grandhr.in** to the candidate’s email. You’ll see a success message when it’s sent.
9. You can also **Download PDF** from the same preview if you need a file.

**Note:** Candidate name and position must be filled before sending; otherwise you’ll see a validation message.

---

## Summary

| Action | Where | Result |
|--------|--------|--------|
| Set sender for all system emails | Backend `EMAIL_FROM=noreply@grandhr.in` | All confirmations and offer letters sent from noreply@grandhr.in |
| Add employee | Dashboard → Add Employee (or Employees → Add Employee) | Employee created; welcome email from noreply@grandhr.in |
| Email offer letter to candidate | Documents → Offer Letter → Preview → “Send to email” | Offer letter email from noreply@grandhr.in to candidate’s address |

For noreply mailbox and SMTP setup (Gmail/Google Workspace or other), see **docs/NOREPLY_EMAIL_SETUP.md**.
