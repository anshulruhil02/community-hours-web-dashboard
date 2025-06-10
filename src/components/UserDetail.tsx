import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Button,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { ArrowBack, Email, School, Person } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { DatabaseUser, Submission } from "../types/User";
import { userService } from "../services/userService";
import { theme } from "../styles/theme";
import { formatDate, getTotalHours, getInitials } from "../utils/formatters";

export const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserDetail(userId);
    }
  }, [userId]);

  const fetchUserDetail = async (id: string) => {
    try {
      const userData = await userService.getUserById(id);
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionClick = (submission: Submission) => {
    // Navigate to submission detail page
    navigate(`/submissions/${submission.id}`);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h5">User not found</Typography>
          <Button
            onClick={() => navigate("/")}
            startIcon={<ArrowBack />}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  const totalHours = getTotalHours(user.Submissions);

  return (
    <ThemeProvider theme={theme}>
      <Box bgcolor="background.default" minHeight="100vh" py={3}>
        <Container maxWidth="lg">
          {/* Header with Back Button */}
          <Box mb={4}>
            <Button
              onClick={() => navigate("/")}
              startIcon={<ArrowBack />}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>

            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 80,
                      height: 80,
                      mr: 3,
                      fontSize: "2rem",
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h4" component="h1" gutterBottom>
                      {user.name}
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      color="text.secondary"
                      mb={1}
                    >
                      <Email sx={{ fontSize: 20, mr: 1 }} />
                      <Typography variant="h6">{user.email}</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      Total Community Hours: <strong>{totalHours}</strong>
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* User Information */}
                <Typography variant="h6" gutterBottom>
                  Student Information
                </Typography>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                  gap={2}
                  mb={3}
                >
                  {user.schoolId && (
                    <Typography variant="body1">
                      <strong>School ID:</strong> {user.schoolId}
                    </Typography>
                  )}
                  {user.oen && (
                    <Typography variant="body1">
                      <strong>OEN:</strong> {user.oen}
                    </Typography>
                  )}
                  {user.principal && (
                    <Typography variant="body1">
                      <strong>Principal:</strong> {user.principal}
                    </Typography>
                  )}
                  <Typography variant="body1">
                    <strong>Joined:</strong> {formatDate(user.createdAt)}
                  </Typography>
                </Box>

                {/* Signature Status */}
                <Typography variant="h6" gutterBottom>
                  Signature Status
                </Typography>
                <Box display="flex" gap={2} mb={3}>
                  <Chip
                    icon={<Person />}
                    label={`Student: ${
                      user.studentSignatureUrl ? "Signed" : "Not Signed"
                    }`}
                    color={user.studentSignatureUrl ? "success" : "default"}
                    variant={user.studentSignatureUrl ? "filled" : "outlined"}
                  />
                  <Chip
                    icon={<School />}
                    label={`Parent: ${
                      user.parentSignatureUrl ? "Signed" : "Not Signed"
                    }`}
                    color={user.parentSignatureUrl ? "success" : "default"}
                    variant={user.parentSignatureUrl ? "filled" : "outlined"}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
          {/* Submissions Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Community Hours Submissions ({user.Submissions.length})
              </Typography>
              {user.Submissions.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Organization</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Submission Date</TableCell>
                        <TableCell align="center">View</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {user.Submissions.map((submission) => (
                        <TableRow
                          key={submission.id}
                          hover
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                          onClick={() => handleSubmissionClick(submission)}
                        >
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body2">
                                {submission.orgName ?? "N/A"}
                              </Typography>
                              <OpenInNewIcon
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>{submission.hours ?? 0}</TableCell>
                          <TableCell>
                            <Chip
                              label={submission.status}
                              color={
                                submission.status === "SUBMITTED"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {submission.submissionDate
                              ? formatDate(submission.submissionDate)
                              : "Not submitted"}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `/submission/${submission.id}`,
                                  "_blank"
                                );
                              }}
                              sx={{ color: "primary.main" }}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontStyle="italic"
                >
                  No submissions yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
