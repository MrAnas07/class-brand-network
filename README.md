# 🎓 Class Brand Network

A modern web platform designed for students to **create, showcase, and grow their personal brands** within their academic community.

---

## 🌟 What is Class Brand Network?

Class Brand Network is a social discovery platform where students can build their digital brand presence, connect with classmates, and get real followers and likes from people in their class. Think of it as a mini Instagram — but made specifically for student entrepreneurs and creators.

---

## ✨ Features

### 👤 User Authentication
- Secure Email & Password registration and login
- Google OAuth2 — Sign in instantly with Gmail
- Auto account creation for new Google users
- Protected routes — only logged-in users can manage brands

### 🏷️ Brand Management
- Create a personal brand with name, category, description, and social links
- Edit or delete your brand anytime
- Category dropdown with 19+ pre-defined categories
- Full form validation — all fields are required before submission

### 🌍 Public Discovery
- Browse all student brands on the homepage
- Real-time updates — new brands appear instantly
- Brands sorted by follower count
- Search and explore by category

### ❤️ Like & Follow System
- Like any brand (one like per user)
- Follow/unfollow brands
- Real-time like and follower count updates
- Prevent self-like and self-follow
- Firestore transactions for accurate counts

### 🔔 Smart Notifications
- Beautiful toast notifications for all actions
- Friendly error messages (no raw Firebase errors)
- Field-level validation with inline error highlighting
- Success confirmations for all user actions


### 📱 Responsive Design
- Works perfectly on mobile, tablet, and desktop
- Glassmorphism navbar with blur effect
- Smooth animations and transitions throughout
- Modern pink-purple gradient color theme

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + Custom CSS |
| Routing | React Router v6 |
| Authentication | Firebase Auth (Email + Google OAuth2) |
| Database | Firebase Firestore (Real-time) |
| Deployment | Vercel (Auto-deploy on push) |
| Version Control | Git + GitHub |

---

## 🔒 Security Features

- **Firebase Authentication** — industry-standard secure auth
- **Google OAuth2** — no passwords stored for Google users
- **Firestore Security Rules** — users can only edit their own brands
- **Input Validation** — all fields validated before saving to database
- **URL Validation** — only `https://` links are accepted
- **Self-interaction Prevention** — users cannot like or follow their own brands
- **Firestore Transactions** — prevents duplicate likes/follows with atomic operations
- **Protected Routes** — dashboard and admin panel require authentication
- **Environment Variables** — all Firebase credentials stored securely in `.env`
- **Admin Role Protection** — admin panel only accessible to users with admin role

---

## 💡 Why Class Brand Network?

| Problem | Solution |
|---------|----------|
| Students have no platform to showcase their brands | A dedicated space built just for student entrepreneurs |
| Hard to discover classmates' businesses | Public homepage with all brands in one place |
| No engagement system for student brands | Real-time likes and follows with live counts |
| Generic social media lacks academic focus | Platform designed specifically for class communities |

---


🌐 **Live URL**: [class-brand-network.vercel.app](https://class-brand-network.vercel.app)

---

## 📄 License

This project is open source and available under the **MIT License**.

---

<p align="center">Made with Muhammad Anas Founder Of Maan,s Hub ❤️ for student entrepreneurs</p>
