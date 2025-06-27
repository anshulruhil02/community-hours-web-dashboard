// src/components/dashboard/CommunityHoursDashboard.tsx
import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import {
  Container,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";

import { DatabaseUser } from "../../types/User";
import { userService } from "../../services/userService";
import { theme } from "../../styles/theme";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import BoardAdminDashboardContent from "./admin/BoardAdminDashboardContent";
import SchoolAdminDashboardContent from "./admin/SchoolAdminDashboardContent";
import { getTotalHours } from "../../utils/formatters";
import { useAuth, useUser } from "@clerk/clerk-react";

enum UserRole {
  SchoolAdmin = "SCHOOL_ADMIN",
  BoardAdmin = "BOARD_ADMIN",
}

const CommunityHoursDashboard: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();

  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole: UserRole | undefined = user?.publicMetadata?.role as
    | UserRole
    | undefined;
  const userSchoolId: string | undefined = user?.publicMetadata?.schoolId as
    | string
    | undefined;

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUsers();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, userRole, userSchoolId]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      if (err.response) {
        if (err.response.status === 403) {
          setError(
            `Permission Denied: ${
              err.response.data?.message ||
              "You do not have permission to view this data."
            }`
          );
        } else if (err.response.status === 401) {
          // Check if this is likely a timing issue vs real auth failure
          const errorMessage = err.response.data?.message || "";
          if (
            errorMessage.includes("No token provided") ||
            errorMessage.includes("Authentication required")
          ) {
            // This is likely a timing issue - give user option to retry
            setError(
              "Authentication issue detected. This might be a timing issue. Please try refreshing."
            );

            // Only auto-logout after multiple failures or if explicitly told session is invalid
            const sessionErrors = sessionStorage.getItem("auth-errors") || "0";
            const errorCount = parseInt(sessionErrors) + 1;
            sessionStorage.setItem("auth-errors", errorCount.toString());

            if (errorCount >= 3) {
              console.log("Multiple auth failures, signing out for security");
              sessionStorage.removeItem("auth-errors");
              signOut();
            }
          } else {
            // This looks like a real auth failure (expired token, etc.)
            setError("Authentication expired. Please sign in again.");
            signOut();
          }
        } else {
          setError(
            `Error: ${err.response.status} - ${
              err.response.data?.message ||
              err.message ||
              "An unknown error occurred."
            }`
          );
        }
      } else if (err.request) {
        setError(
          "Network Error: Could not connect to the backend server. Please check your internet connection or backend server."
        );
      } else {
        setError(
          `Failed to fetch users: ${
            err.message || "An unexpected error occurred."
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Also add this useEffect to clear error count on successful auth
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Clear error count on successful load
      sessionStorage.removeItem("auth-errors");
      fetchUsers();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, userRole, userSchoolId]);

  const filteredSchoolAdminUsers = useMemo(() => {
    return users.filter((dbUser) => dbUser.role === "STUDENT");
  }, [users, userRole, user?.id]);

  // --- Conditional Rendering for Loading, Not Signed In, and Error States ---
  if (!isLoaded || loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
        >
          <Box textAlign="center">
            <CircularProgress size={60} color="primary" />
            <Typography variant="h6" sx={{ mt: 2, color: "text.primary" }}>
              Loading community hours data...
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (!isSignedIn) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
          p={3}
        >
          <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
            You are not authenticated. Please sign in.
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
          p={3}
        >
          <Card sx={{ maxWidth: 400, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                Error loading users: {error}
              </Alert>
              <Button
                variant="contained"
                onClick={fetchUsers}
                fullWidth
                startIcon={<Refresh />}
                sx={{ borderRadius: 2 }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  const currentDisplayedUsers =
    userRole === UserRole.SchoolAdmin ? filteredSchoolAdminUsers : users;

  const totalDisplayedUsers = currentDisplayedUsers.length;
  const totalDisplayedSubmissions = currentDisplayedUsers.reduce(
    (total, u) => total + (u.Submissions?.length || 0),
    0
  );
  const totalDisplayedHours = currentDisplayedUsers.reduce(
    (total, u) => total + (u.Submissions ? getTotalHours(u.Submissions) : 0),
    0
  );
  const displayedUsersWithSignatures = currentDisplayedUsers.filter(
    (u) => u.studentSignatureUrl || u.parentSignatureUrl
  ).length;
  const totalDisplayedSubmittedSubmissions = currentDisplayedUsers.reduce(
    (total, u) =>
      total +
      (u.Submissions
        ? u.Submissions.filter((s) => s.status === "SUBMITTED").length
        : 0),
    0
  );

  // --- Main Dashboard Layout and Conditional Role-Based Content ---
  return (
    <ThemeProvider theme={theme}>
      <Box bgcolor="background.default" minHeight="100vh" py={3}>
        <Container maxWidth="xl">
          {/* Dashboard Header (common to all roles) */}
          <Box mb={4}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  color="text.primary"
                >
                  🎓 Community Hours Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {userRole === UserRole.SchoolAdmin
                    ? `Welcome, ${
                        user?.firstName ||
                        user?.emailAddresses?.[0]?.emailAddress ||
                        "School Admin"
                      }! (Managing ${totalDisplayedUsers} students)` // Changed text
                    : userRole === UserRole.BoardAdmin
                    ? `Board Admin View: System-wide data (Total visible: ${totalDisplayedUsers} users)`
                    : `Welcome, ${
                        user?.firstName ||
                        user?.emailAddresses?.[0]?.emailAddress ||
                        "User"
                      }!`}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                {/* Refresh Button */}
                <IconButton
                  onClick={fetchUsers}
                  color="primary"
                  disabled={loading}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "primary.dark" },
                    mr: 1, // Add some margin to the right of refresh button
                  }}
                >
                  <Refresh />
                </IconButton>
                {/* Sign Out Button */}
                <Button
                  variant="contained"
                  onClick={() => signOut()} // Call Clerk's signOut function
                  startIcon={<ExitToAppIcon />} // Icon for sign out
                  sx={{
                    bgcolor: "error.main", // Red color for sign out
                    color: "white",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "error.dark" },
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Conditional rendering of the specific dashboard content based on user's role */}
          {userRole === UserRole.SchoolAdmin ? (
            <SchoolAdminDashboardContent
              users={filteredSchoolAdminUsers} // Pass the filtered list here
              totalUsers={totalDisplayedUsers} // Use calculated totals from filtered list
              totalSubmissions={totalDisplayedSubmissions}
              totalSubmittedSubmissions={totalDisplayedSubmittedSubmissions}
              totalHours={totalDisplayedHours}
              usersWithSignatures={displayedUsersWithSignatures}
            />
          ) : userRole === UserRole.BoardAdmin ? (
            <BoardAdminDashboardContent
              users={users} // Board admin still gets all users from backend
              totalUsers={totalDisplayedUsers}
              totalSubmissions={totalDisplayedSubmissions}
              totalHours={totalDisplayedHours}
            />
          ) : (
            <Box mt={4} textAlign="center">
              <Typography variant="h5" color="text.primary" gutterBottom>
                Hello,{" "}
                {user?.firstName ||
                  user?.emailAddresses?.[0]?.emailAddress ||
                  "Community Member"}
                !
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Your current role is:{" "}
                <span style={{ fontWeight: "bold" }}>
                  {userRole || "Student"}
                </span>
                .
              </Typography>
              <Alert
                severity="info"
                variant="outlined"
                sx={{ mt: 2, maxWidth: 600, mx: "auto", borderRadius: 2 }}
              >
                Content tailored for your role will appear here. For now, this
                is a placeholder for students or users without specific admin
                roles.
              </Alert>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CommunityHoursDashboard;
