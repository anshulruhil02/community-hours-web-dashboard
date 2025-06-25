// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import CommunityHoursDashboard from "./components/dashboard/CommunityHoursDashboard";
import { UserDetail } from "./components/UserDetail";
import LoginPage from "./components/auth/LoginPage"; // Your custom login page
import SubmissionDetail from "./components/SubmissionDetail";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import CustomSignUpForm from "./components/auth/CustomSignUpForm";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "") {
  throw new Error("Missing Publishable Key");
}

// ProtectedRoute component - no changes here, it was correct
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

function App() {
  return (
    <Router>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        signInUrl="/sign-in" // <-- CRITICAL: Tell Clerk to redirect to YOUR /sign-in route
        signUpUrl="/sign-up" // Optional but good practice: matches your nested sign-up path
      >
        <Routes>
          {/* Public route for signing in and signing up.
              This is where ClerkProvider will redirect unauthenticated users. */}
          <Route path="/sign-in/*" element={<LoginPage />} />
          <Route path="/sign-up/*" element={<CustomSignUpForm />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CommunityHoursDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:userId"
            element={
              <ProtectedRoute>
                <UserDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions/:submissionId"
            element={
              <ProtectedRoute>
                <SubmissionDetail />
              </ProtectedRoute>
            }
          />
          {/* Add a catch-all route for unauthenticated access that you want to handle */}
          {/* For example, if someone tries to go to a protected route directly when logged out,
              this ensures they are redirected to your custom login page */}
          <Route path="*" element={<RedirectToSignIn />} />
        </Routes>
      </ClerkProvider>
    </Router>
  );
}

export default App;
