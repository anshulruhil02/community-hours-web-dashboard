import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import CommunityHoursDashboard from "./components/dashboard/CommunityHoursDashboard";
import { UserDetail } from "./components/UserDetail";
import LoginPage from "./components/auth/LoginPage";
import SubmissionDetail from "./components/SubmissionDetail";
import {
  ClerkProvider,
  useAuth,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import CustomSignUpForm from "./components/auth/CustomSignUpForm";
import { useGlobalAuth } from "./hooks/useAxiosAuth";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "") {
  throw new Error("Missing Publishable Key");
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isLoaded } = useGlobalAuth();

  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading authentication...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/sign-in/*" element={<LoginPage />} />
      <Route path="/sign-up/*" element={<CustomSignUpForm />} />
      <Route path="/" element={
        <ProtectedRoute>
          <CommunityHoursDashboard />
        </ProtectedRoute>
      } />
      <Route path="/user/:userId" element={
        <ProtectedRoute>
          <UserDetail />
        </ProtectedRoute>
      } />
      <Route path="/submissions/:submissionId" element={
        <ProtectedRoute>
          <SubmissionDetail />
        </ProtectedRoute>
      } />
      <Route path="*" element={<RedirectToSignIn />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
      >
        <AppContent />
      </ClerkProvider>
    </Router>
  );
}

export default App;