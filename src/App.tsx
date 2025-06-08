import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Person,
  Refresh,
  Groups,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";

import { DatabaseUser } from "./types/User";
import { userService } from "./services/userService";
import { theme } from "./styles/theme";
import { getTotalHours } from "./utils/formatters";
import { UserCard } from "./components/dashboard/UserCard";
import { StatsCards } from "./components/dashboard/StatsCards";
import { SearchBar } from "./components/dashboard/SearchBar";

const CommunityHoursDashboard = () => {
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.schoolId &&
        user.schoolId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.oen && user.oen.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate statistics
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

  return (
    <ThemeProvider theme={theme}>
      <Box bgcolor="background.default" minHeight="100vh" py={3}>
        <Container maxWidth="xl">
          {/* Header */}
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
                  Manage and view all registered students ({totalUsers} total)
                </Typography>
              </Box>
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

            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </Box>

          {/* Statistics Cards */}
          <StatsCards
            totalUsers={totalUsers}
            totalSubmissions={totalSubmissions}
            totalSubmittedSubmissions={totalSubmittedSubmissions}
            totalHours={totalHours}
            usersWithSignatures={usersWithSignatures}
          />

          {/* Student Cards */}
          <Grid container spacing={3}>
            {filteredUsers.map((user) => (
              <Grid item xs={12} sm={6} lg={4} key={user.id} {...({} as any)}>
                <UserCard user={user} />
              </Grid>
            ))}
          </Grid>

          {/* No results */}
          {filteredUsers.length === 0 && searchTerm && (
            <Paper sx={{ p: 4, textAlign: "center", mt: 4 }}>
              <Person sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No students found matching "{searchTerm}"
              </Typography>
            </Paper>
          )}

          {users.length === 0 && !loading && (
            <Paper sx={{ p: 4, textAlign: "center", mt: 4 }}>
              <Groups sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No students registered yet
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CommunityHoursDashboard;