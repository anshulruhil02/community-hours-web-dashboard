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
  Checkbox, // Import Checkbox
  Toolbar, // Import Toolbar for bulk actions
  Tooltip, // Import Tooltip
  Dialog, // Import Dialog for rejection reason
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField, // Import TextField for rejection reason
  Snackbar, // Import Snackbar for feedback
  Alert, // Import Alert for Snackbar
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  ArrowBack,
  Email,
  School,
  Person,
  CheckCircle,
  Cancel,
  Delete,
} from "@mui/icons-material";
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
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]); // State for selected IDs
  const [openRejectDialog, setOpenRejectDialog] = useState(false); // State for reject dialog
  const [rejectionReason, setRejectionReason] = useState(""); // State for rejection reason
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info"); // Snackbar severity

  useEffect(() => {
    if (userId) {
      fetchUserDetail(userId);
    }
  }, [userId]);

  const fetchUserDetail = async (id: string) => {
    setLoading(true);
    try {
      const userData = await userService.getUserById(id);
      setUser(userData);
      setSelectedSubmissionIds([]); // Clear selection on new user load/refresh
    } catch (error) {
      console.error("Error fetching user:", error);
      setSnackbarMessage("Failed to load user details.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionClick = (submission: Submission) => {
    // Navigate to submission detail page
    navigate(`/submissions/${submission.id}`);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (user) {
      if (event.target.checked) {
        // Select all SUBMITTED submissions
        const newSelecteds = user.Submissions.filter(s => s.status === 'SUBMITTED').map((s) => s.id);
        setSelectedSubmissionIds(newSelecteds);
      } else {
        setSelectedSubmissionIds([]);
      }
    }
  };

  const handleCheckboxClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selectedSubmissionIds.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedSubmissionIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedSubmissionIds.slice(1));
    } else if (selectedIndex === selectedSubmissionIds.length - 1) {
      newSelected = newSelected.concat(selectedSubmissionIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedSubmissionIds.slice(0, selectedIndex),
        selectedSubmissionIds.slice(selectedIndex + 1),
      );
    }
    setSelectedSubmissionIds(newSelected);
  };

  const isSelected = (id: string) => selectedSubmissionIds.indexOf(id) !== -1;

  const numSelected = selectedSubmissionIds.length;
  const rowCount = user?.Submissions.filter(s => s.status === 'SUBMITTED').length || 0; // Only count submitted for select all

  const handleBulkApprove = async () => {
    if (numSelected === 0) return;

    setLoading(true); // Indicate loading for the action
        console.log("Attempting to approve IDs:", selectedSubmissionIds); // <--- ADD THIS LINE

    try {
      await userService.bulkApproveSubmissions(selectedSubmissionIds);
      setSnackbarMessage(`Successfully approved ${numSelected} submission(s).`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      await fetchUserDetail(user!.id); // Refetch user data to update statuses
    } catch (error: any) {
      console.error("Error bulk approving submissions:", error);
      setSnackbarMessage(`Failed to approve submission(s): ${error.message || 'Unknown error'}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRejectDialog = () => {
    if (numSelected === 0) return;
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectionReason(""); // Clear reason on close
  };

  const handleConfirmBulkReject = async () => {
    if (numSelected === 0) return;

    setLoading(true); // Indicate loading for the action
    try {
      await userService.bulkRejectSubmissions(selectedSubmissionIds, rejectionReason);
      setSnackbarMessage(`Successfully rejected ${numSelected} submission(s).`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseRejectDialog(); // Close dialog
      await fetchUserDetail(user!.id); // Refetch user data to update statuses
    } catch (error: any) {
      console.error("Error bulk rejecting submissions:", error);
      setSnackbarMessage(`Failed to reject submission(s): ${error.message || 'Unknown error'}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom component="div">
                  Community Hours Submissions ({user.Submissions.length})
                </Typography>
                {numSelected > 0 && (
                  <Toolbar
                    sx={{
                      pl: { sm: 2 },
                      pr: { xs: 1, sm: 1 },
                      ...(numSelected > 0 && {
                        bgcolor: (theme) =>
                          theme.palette.action.hover,
                      }),
                    }}
                  >
                    <Typography
                      sx={{ flex: '1 1 100%' }}
                      color="inherit"
                      variant="subtitle1"
                      component="div"
                    >
                      {numSelected} selected
                    </Typography>
                    <Tooltip title="Approve Selected">
                      <IconButton color="success" onClick={handleBulkApprove} disabled={loading}>
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject Selected">
                      <IconButton color="error" onClick={handleOpenRejectDialog} disabled={loading}>
                        <Cancel />
                      </IconButton>
                    </Tooltip>
                  </Toolbar>
                )}
              </Box>

              {user.Submissions.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={handleSelectAllClick}
                            inputProps={{
                              'aria-label': 'select all submissions',
                            }}
                          />
                        </TableCell>
                        <TableCell>Organization</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Submission Date</TableCell>
                        <TableCell align="center">Actions</TableCell> {/* Renamed from View */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {user.Submissions.map((submission) => {
                        const isItemSelected = isSelected(submission.id);
                        const isSubmitted = submission.status === "SUBMITTED";
                        return (
                          <TableRow
                            key={submission.id}
                            hover
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            selected={isItemSelected}
                            sx={{
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isItemSelected}
                                onClick={(event) => handleCheckboxClick(event, submission.id)}
                                disabled={!isSubmitted} // Only allow selection of 'SUBMITTED' items
                                inputProps={{
                                  'aria-labelledby': `submission-checkbox-${submission.id}`,
                                }}
                              />
                            </TableCell>
                            <TableCell onClick={() => handleSubmissionClick(submission)}>
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
                                {/* Removed OpenInNewIcon here to make entire cell clickable for detail */}
                              </Box>
                            </TableCell>
                            <TableCell onClick={() => handleSubmissionClick(submission)}>{submission.hours ?? 0}</TableCell>
                            <TableCell onClick={() => handleSubmissionClick(submission)}>
                              <Chip
                                label={submission.status}
                                color={
                                  submission.status === "SUBMITTED"
                                    ? "info" // Changed to info for pending, success for approved etc.
                                    : submission.status === "APPROVED"
                                    ? "success"
                                    : "error"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell onClick={() => handleSubmissionClick(submission)}>
                              {submission.submissionDate
                                ? formatDate(submission.submissionDate)
                                : "Not submitted"}
                            </TableCell>
                            <TableCell align="center">
                               {/* Individual action buttons for convenience, only for SUBMITTED status */}
                               {isSubmitted && (
                                   <>
                                    <Tooltip title="Approve Individual">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Assuming you have approveSubmission method in userService
                                                // Call userService.approveSubmission(submission.id) and refetch
                                                alert(`Approving individual submission: ${submission.orgName}`);
                                            }}
                                            sx={{ color: "success.main" }}
                                        >
                                            <CheckCircle fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Reject Individual">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Call individual reject modal or function
                                                alert(`Rejecting individual submission: ${submission.orgName}`);
                                            }}
                                            sx={{ color: "error.main" }}
                                        >
                                            <Cancel fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                   </>
                               )}
                                <Tooltip title="View Details">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent row click
                                        window.open(`/submissions/${submission.id}`, "_blank");
                                    }}
                                    sx={{ color: "primary.main" }}
                                >
                                    <OpenInNewIcon fontSize="small" />
                                </IconButton>
                                </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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

        {/* Rejection Reason Dialog */}
        <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog}>
          <DialogTitle>Reject Submissions</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to reject the selected {numSelected} submission(s)?
              Optionally, provide a reason for rejection.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="rejection-reason"
              label="Rejection Reason (Optional)"
              type="text"
              fullWidth
              variant="standard"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={3}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRejectDialog}>Cancel</Button>
            <Button onClick={handleConfirmBulkReject} color="error" variant="contained">
              Reject
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for feedback */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};