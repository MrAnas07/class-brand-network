# Class Brand Network Platform

A production-ready web application for students to create, manage, and showcase their personal brands.

## 🚀 Features

- **Secure Authentication**: Email & Password registration and login
- **Brand Management**: Create, edit, and delete personal brands
- **Public Discovery**: View all student brands on a public homepage
- **Secure Links**: All external links open safely in new tabs
- **Responsive Design**: Works on all device sizes

## 🛠 Tech Stack

- **Frontend**: React (Vite + TypeScript)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Backend**: Firebase (Authentication & Firestore)
- **Deployment**: Firebase Hosting

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project

## 🔧 Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   cd D:\Class-Brand-Network-Pro
   npm install
   ```

2. **Set up Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firebase Authentication (Email/Password provider)
   - Enable Firestore Database

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values:
     ```env
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🚨 Security Rules

Firestore security rules have been set up to ensure:
- Public read access to all brands
- Users can only create/update/delete their own brand documents
- Proper authentication checks on all write operations

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── pages/          # Route components
├── services/       # Firebase and API services
├── utils/          # Utility functions
```

## 🧱 Database Structure

Firestore Collection: `brands`
- `userId` (string) - The ID of the user who created the brand
- `brandName` (string) - Name of the brand
- `description` (string) - Brand description
- `instagramUrl` (string) - Instagram link
- `facebookUrl` (string) - Facebook link
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last updated timestamp

## 📝 Usage

1. **Register/Login**: New users can register with email and password
2. **Create Brand**: Logged-in users can create their brand in the dashboard
3. **Manage Brands**: Edit or delete existing brands
4. **Discover**: Anyone can view all student brands on the homepage
5. **External Links**: Click Instagram/Facebook buttons to visit profiles

## 🏗️ Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🚀 Deployment to Firebase

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase project:
   ```bash
   firebase init hosting
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## 🛡️ Security Features

- Input validation on all fields
- URL validation (only https:// URLs allowed)
- Secure authentication with Firebase
- Proper Firestore security rules
- Safe external link handling

## 📱 Responsive Design

The application is fully responsive and works on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
"# class-brand-network" 
