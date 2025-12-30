# GrandHR Multi-Chatbot System

## 🎉 Implementation Complete!

GrandHR now features a **next-level multi-chatbot system** with specialized AI assistants for different HR functions.

## 🤖 Available Chatbots

### 1. **HR Assistant** 👔
- General HR questions and guidance
- Employee management help
- Document generation assistance
- Company policy information
- Profile and information queries

### 2. **Payroll Bot** 💰
- Salary and payslip queries
- Payroll processing information
- Deduction details (TDS, PF, etc.)
- Payroll schedule and dates
- Payslip generation help

### 3. **Leave Bot** 📅
- Leave application guidance
- Leave balance information
- Leave policy questions
- Leave approval status
- Leave type information

### 4. **Attendance Bot** ⏰
- Clock in/out assistance
- Attendance record queries
- Attendance reports
- Work hours tracking
- Today's attendance status

### 5. **General Support** 💬
- FAQs and general help
- Feature information
- Support and contact
- Navigation assistance
- Company information

## ✨ Features

### Smart Responses
- Context-aware responses based on user role (Employee/HR/Admin)
- Real-time data from database (payroll, leaves, attendance)
- Actionable suggestions with quick actions
- Navigation assistance (can navigate users to relevant pages)

### User Experience
- Floating chat button (bottom-right corner)
- Beautiful, modern UI with smooth animations
- Bot selection interface
- Message history per bot
- Quick suggestion buttons
- Loading indicators
- Auto-scroll to latest message

### Integration
- Fully integrated with backend API
- Role-based responses
- Company-specific data
- Secure authentication required

## 🚀 Usage

### For Employees
1. Log in to HR Management system
2. Click the floating chat button (💬) in bottom-right
3. Select a chatbot (e.g., "Leave Bot" for leave questions)
4. Ask questions and get instant help
5. Use suggestion buttons for quick actions

### For HR/Admin
- Access to all chatbots
- Get company-wide statistics
- Manage employee queries
- Navigate to management sections

## 📁 Files Created

### Backend
- `backend/src/services/chatbot.service.ts` - Chatbot logic and responses
- `backend/src/controllers/chatbot.controller.ts` - API controller
- `backend/src/routes/chatbot.routes.ts` - API routes

### Frontend
- `frontend/src/components/Chatbot.jsx` - Chatbot UI component
- `frontend/src/components/Footer.jsx` - Footer with Shah Works branding
- Updated `frontend/src/components/AppLayout.jsx` - Added chatbot integration

## 🔧 API Endpoints

### GET `/api/chatbot`
Get list of available chatbots

**Response:**
```json
{
  "success": true,
  "chatbots": [
    {
      "type": "HR_ASSISTANT",
      "name": "HR Assistant",
      "description": "General HR questions and employee management",
      "icon": "👔"
    }
  ]
}
```

### POST `/api/chatbot/message`
Send a message to a chatbot

**Request:**
```json
{
  "chatbotType": "LEAVE_BOT",
  "message": "How do I apply for leave?"
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "message": "To apply for leave:\n\n1. Go to the Leaves section...",
    "suggestions": ["Apply now", "View leave types"],
    "actionRequired": true,
    "actionType": "navigate",
    "actionData": { "path": "/hr/leaves" }
  }
}
```

## 🎨 Theme Enhancements

### Updated Color Scheme
- Modern primary colors (blue gradient)
- Accent colors (purple gradient)
- Professional and clean design
- Shah Works branding throughout

### Branding
- Footer component with Shah Works information
- Updated navbar with "by Shah Works" tag
- Landing page footer with company links
- Consistent branding across all pages

## 🔐 Security

- Authentication required for chatbot access
- User role-based responses
- Company data isolation
- Secure API endpoints with rate limiting

## 📝 Notes

- Chatbots only appear on HR Management pages when user is logged in
- Each chatbot maintains separate conversation history
- Responses are context-aware based on user's role and company
- Can navigate users to relevant pages automatically

## 🌐 Made by Shah Works

**GrandHR** - Complete HR Management Solution  
**Website:** www.shahworks.com  
**Email:** support@shahworks.com

---

*This implementation provides a next-level chatbot experience for both employers and employees, making HR management more accessible and user-friendly.*

