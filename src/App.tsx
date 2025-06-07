import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Box,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  Search,
  Person,
  School,
  Assignment,
  Schedule,
  CheckCircle,
  Cancel,
  Refresh,
  Email,
  Groups,
  AssignmentTurnedIn
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a beautiful theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
  },
});

// Types
interface Submission {
  id: string;
  status: 'DRAFT' | 'SUBMITTED';
  submissionDate: string | null;
  hours: number | null;
  orgName: string | null;
  createdAt: string;
}

interface DatabaseUser {
  id: string;
  authProviderId: string;
  email: string;
  name: string;
  schoolId: string | null;
  oen: string | null;
  principal: string | null;
  dateOfBirth: string | null;
  parentSignatureUrl: string | null;
  parentSignatureDate: string | null;
  studentSignatureUrl: string | null;
  studentSignatureDate: string | null;
  createdAt: string;
  updatedAt: string;
  Submissions: Submission[];
}

const CommunityHoursDashboard = () => {
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = 'http://3.81.44.175:3000';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.schoolId && user.schoolId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.oen && user.oen.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalHours = (submissions: Submission[]) => {
    return submissions.reduce((total, sub) => total + (sub.hours || 0), 0);
  };

  const getSubmissionStats = (submissions: Submission[]) => {
    const submitted = submissions.filter(s => s.status === 'SUBMITTED').length;
    const draft = submissions.filter(s => s.status === 'DRAFT').length;
    return { submitted, draft, total: submissions.length };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate statistics
  const totalUsers = users.length;
  const totalSubmissions = users.reduce((total, user) => total + user.Submissions.length, 0);
  const totalHours = users.reduce((total, user) => total + getTotalHours(user.Submissions), 0);
  const usersWithSignatures = users.filter(user => user.studentSignatureUrl || user.parentSignatureUrl).length;
  const totalSubmittedSubmissions = users.reduce((total, user) => 
    total + user.Submissions.filter(s => s.status === 'SUBMITTED').length, 0
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <Refresh />
              </IconButton>
            </Box>

            {/* Search */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search students by name, email, school ID, or OEN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* @ts-ignore */}
            <Grid item xs={12} sm={6} md={2.4 as any}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <Groups />
                    </Avatar>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Total Students
                      </Typography>
                      <Typography variant="h5" component="div">
                        {totalUsers}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
              {/* @ts-ignore */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <Assignment />
                    </Avatar>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Total Submissions
                      </Typography>
                      <Typography variant="h5" component="div">
                        {totalSubmissions}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* @ts-ignore */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <AssignmentTurnedIn />
                    </Avatar>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Submitted
                      </Typography>
                      <Typography variant="h5" component="div">
                        {totalSubmittedSubmissions}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
              {/* @ts-ignore */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <Schedule />
                    </Avatar>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Total Hours
                      </Typography>
                      <Typography variant="h5" component="div">
                        {totalHours.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
             {/* @ts-ignore */} 
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <School />
                    </Avatar>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        With Signatures
                      </Typography>
                      <Typography variant="h5" component="div">
                        {usersWithSignatures}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Student Cards */}
          <Grid container spacing={3}>
            {filteredUsers.map((user) => {
              const stats = getSubmissionStats(user.Submissions);
              const totalHours = getTotalHours(user.Submissions);
              const completionRate = stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0;
              return (
                <Grid item xs={12} sm={6} lg={4} key={user.id} {...({} as any)}>
                  <Card>
                    <CardContent>
                      {/* User Header */}
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            width: 56, 
                            height: 56,
                            mr: 2,
                            fontSize: '1.25rem'
                          }}
                        >
                          {getInitials(user.name)}
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="h6" component="div">
                            {user.name}
                          </Typography>
                          <Box display="flex" alignItems="center" color="text.secondary">
                            <Email sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                        {totalHours > 0 && (
                          <Box textAlign="center">
                            <Typography variant="h5" color="primary">
                              {totalHours}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              hours
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* User Details */}
                      <Box mb={2}>
                        {user.schoolId && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>School ID:</strong> {user.schoolId}
                          </Typography>
                        )}
                        {user.oen && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>OEN:</strong> {user.oen}
                          </Typography>
                        )}
                        {user.principal && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Principal:</strong> {user.principal}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          <strong>Joined:</strong> {formatDate(user.createdAt)}
                        </Typography>
                      </Box>

                      {/* Signatures */}
                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          icon={user.studentSignatureUrl ? <CheckCircle /> : <Cancel />}
                          label="Student"
                          color={user.studentSignatureUrl ? "success" : "default"}
                          size="small"
                          variant={user.studentSignatureUrl ? "filled" : "outlined"}
                        />
                        <Chip
                          icon={user.parentSignatureUrl ? <CheckCircle /> : <Cancel />}
                          label="Parent"
                          color={user.parentSignatureUrl ? "success" : "default"}
                          size="small"
                          variant={user.parentSignatureUrl ? "filled" : "outlined"}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Submissions */}
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2">
                            Submissions
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stats.total} total
                          </Typography>
                        </Box>

                        {stats.total > 0 ? (
                          <>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2" color="success.main">
                                ✓ Submitted: {stats.submitted}
                              </Typography>
                              <Typography variant="body2" color="warning.main">
                                ⏳ Draft: {stats.draft}
                              </Typography>
                            </Box>
                            
                            <LinearProgress 
                              variant="determinate" 
                              value={completionRate}
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  bgcolor: completionRate === 100 ? 'success.main' : 'primary.main'
                                }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {Math.round(completionRate)}% completed
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            No submissions yet
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* No results */}
          {filteredUsers.length === 0 && searchTerm && (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
              <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No students found matching "{searchTerm}"
              </Typography>
            </Paper>
          )}

          {users.length === 0 && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
              <Groups sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
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