// src/CommunityHoursDashboard.tsx (This will be your main entry point for the combined dashboard)
import React, { useState, useEffect } from "react";
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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";

import { DatabaseUser } from "../../types/User";
import { userService } from "../../services/userService";
import { theme } from "../../styles/theme";

// Import the new separated dashboard content components
import BoardAdminDashboardContent  from "./admin/BoardAdminDashboardContent" ;
import SchoolAdminDashboardContent from "./admin/SchoolAdminDashboardContent"
import { getTotalHours } from "../../utils/formatters";

// Define an enum for roles for clarity
enum UserRole {
  SchoolAdmin = "SCHOOL_ADMIN",
  BoardAdmin = "BOARD_ADMIN",
}

const CommunityHoursDashboard = () => {
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.SchoolAdmin); // Default to School Admin

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real scenario, you might fetch different data based on `currentRole`.
      // For this demo, we continue fetching all users, and the child components will filter/display relevant data.
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentRole(event.target.checked ? UserRole.BoardAdmin : UserRole.SchoolAdmin);
    // Potentially re-fetch data or reset filters if the role change significantly alters data needs
    // For this demo, we'll rely on the child components to adapt.
  };

  if (loading) {
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
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading community hours data...
            </Typography>
          </Box>
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
          <Card sx={{ maxWidth: 400 }}>
            <CardContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading users: {error}
              </Alert>
              <Button
                variant="contained"
                onClick={fetchUsers}
                fullWidth
                startIcon={<Refresh />}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  // Calculate statistics (these will be passed down, or recalculated in child components if filtered)
  const totalUsers = users.length;
  const totalSubmissions = users.reduce(
    (total, user) => total + user.Submissions.length,
    0
  );
  const totalHours = users.reduce(
    (total, user) => total + getTotalHours(user.Submissions),
    0
  );
  const usersWithSignatures = users.filter(
    (user) => user.studentSignatureUrl || user.parentSignatureUrl
  ).length;
  const totalSubmittedSubmissions = users.reduce(
    (total, user) =>
      total + user.Submissions.filter((s) => s.status === "SUBMITTED").length,
    0
  );


  return (
    <ThemeProvider theme={theme}>
      <Box bgcolor="background.default" minHeight="100vh" py={3}>
        <Container maxWidth="xl">
          {/* Header (common to both views) */}
          <Box mb={4}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  🎓 Community Hours Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {currentRole === UserRole.SchoolAdmin
                    ? `Manage and view all registered students (${totalUsers} total)`
                    : `View system-wide community hours data (${totalUsers} total users across all schools)`}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentRole === UserRole.BoardAdmin}
                      onChange={handleRoleToggle}
                      name="roleToggle"
                      color="primary"
                    />
                  }
                  label={currentRole === UserRole.BoardAdmin ? "Board Admin View" : "School Admin View"}
                  sx={{ mr: 2 }}
                />
                <IconButton
                  onClick={fetchUsers}
                  color="primary"
                  disabled={loading}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Conditional rendering of the specific dashboard content */}
          {currentRole === UserRole.SchoolAdmin ? (
            <SchoolAdminDashboardContent
              users={users}
              totalUsers={totalUsers}
              totalSubmissions={totalSubmissions}
              totalSubmittedSubmissions={totalSubmittedSubmissions}
              totalHours={totalHours}
              usersWithSignatures={usersWithSignatures}
            />
          ) : (
            <BoardAdminDashboardContent
              users={users} // Board admin might still need raw user data for aggregate calculations
              totalUsers={totalUsers}
              totalSubmissions={totalSubmissions}
              totalHours={totalHours}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CommunityHoursDashboard;