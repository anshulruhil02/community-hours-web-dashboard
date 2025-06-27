// Enhanced SubmissionDetail Component with Student Audit Trail
// This shows the complete implementation with the audit trail accordion

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  Paper,
  Divider,
  Button,
  IconButton,
  Skeleton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  CalendarToday,
  Schedule,
  Business,
  Person,
  Phone,
  Description,
  Assignment,
  CheckCircle,
  Pending,
  Edit,
  Download,
  Share,
  Check,
  Close,
  Warning,
  ExpandMore,
  History,
  Create,
  Send,
  ThumbUp,
  ThumbDown,
  Info,
} from "@mui/icons-material";
import { userService } from "../services/userService";
import { Submission, AuditTrailEntry } from "../types/User";

const SubmissionDetail: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  
  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        if (submissionId) {
          const data = await userService.fetchUserSubmissionById(submissionId);
          setSubmission(data);
        }
      } catch (err) {
        setError("Failed to load submission details");
        console.error("Error fetching submission:", err);
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  // Function to fetch audit trail data
  const fetchAuditTrail = async () => {
    if (!submissionId) return;
    
    try {
      setAuditLoading(true);
      const auditData = await userService.getSubmissionAuditTrail(submissionId);
      setAuditTrail(auditData);
    } catch (err) {
      console.error("Error fetching audit trail:", err);
      setSnackbarMessage("Failed to load audit trail");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!submission) return;
    
    try {
      setActionLoading(true);
      const updatedSubmission = await userService.approveSubmission(submission.id);
      setSubmission(updatedSubmission);
      setSnackbarMessage("Submission approved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setApproveDialogOpen(false);
      // Refresh audit trail after approval
      fetchAuditTrail();
    } catch (err) {
      console.error("Error approving submission:", err);
      setSnackbarMessage("Failed to approve submission. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!submission) return;
    
    try {
      setActionLoading(true);
      const updatedSubmission = await userService.rejectSubmission(
        submission.id, 
        rejectionReason.trim() || undefined
      );
      setSubmission(updatedSubmission);
      setSnackbarMessage("Submission rejected successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setRejectDialogOpen(false);
      setRejectionReason("");
      // Refresh audit trail after rejection
      fetchAuditTrail();
    } catch (err) {
      console.error("Error rejecting submission:", err);
      setSnackbarMessage("Failed to reject submission. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Utility functions for formatting and display
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAuditDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "success";
      case "DRAFT":
        return "warning";
      case "APPROVED":
        return "info";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <CheckCircle />;
      case "DRAFT":
        return <Pending />;
      case "APPROVED":
        return <CheckCircle />;
      case "REJECTED":
        return <Close />;
      default:
        return <Pending />;
    }
  };

  // Audit trail helper functions
  const getAuditActionIcon = (action: string) => {
    switch (action) {
      case "CREATED":
        return <Create fontSize="small" />;
      case "SUBMITTED":
        return <Send fontSize="small" />;
      case "APPROVED":
        return <ThumbUp fontSize="small" />;
      case "REJECTED":
        return <ThumbDown fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  const getAuditActionColor = (action: string) => {
    switch (action) {
      case "CREATED":
        return "primary";
      case "SUBMITTED":
        return "info";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getAuditActionDescription = (entry: AuditTrailEntry): string => {
    switch (entry.action) {
      case "CREATED":
        return `Submission created by ${entry.performedByName}`;
      case "SUBMITTED":
        return `Submitted for review by ${entry.performedByName}`;
      case "APPROVED":
        return `Approved by ${entry.performedByName} (${entry.performedByRole})`;
      case "REJECTED":
        return `Rejected by ${entry.performedByName} (${entry.performedByRole})`;
      default:
        return `Action performed by ${entry.performedByName}`;
    }
  };

  const canMakeDecision = (status: string) => {
    return status === "SUBMITTED";
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" width={100} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" height={30} />
        </Box>
        <Grid container spacing={3}>
          <Grid xs={12} md={8} {...({} as any)}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid xs={12} md={4} {...({} as any)}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // No submission found
  if (!submission) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back
        </Button>
        <Alert severity="info">Submission not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {submission.orgName || "Untitled Organization"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Chip
                icon={getStatusIcon(submission.status)}
                label={submission.status}
                color={getStatusColor(submission.status) as any}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {submission.hours || 0} hours
              </Typography>
              {submission.submissionDate && (
                <Typography variant="body2" color="text.secondary">
                  Submitted {formatDate(submission.submissionDate)}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton color="primary" title="Edit">
              <Edit />
            </IconButton>
            <IconButton color="primary" title="Download">
              <Download />
            </IconButton>
            <IconButton color="primary" title="Share">
              <Share />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Admin Decision Actions */}
      {canMakeDecision(submission.status) && (
        <Card sx={{ mb: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Warning sx={{ mr: 2, color: "warning.main" }} />
              <Typography variant="h6" color="text.primary">
                Review Required
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This submission is awaiting your decision. Please review the details below and choose to approve or reject.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<Check />}
                onClick={() => setApproveDialogOpen(true)}
                disabled={actionLoading}
              >
                Approve Submission
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Close />}
                onClick={() => setRejectDialogOpen(true)}
                disabled={actionLoading}
              >
                Reject Submission
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid xs={12} md={8} {...({} as any)}>
          {/* Service Details Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid xs={12} sm={6} {...({} as any)}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Business sx={{ mr: 2, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Organization
                      </Typography>
                      <Typography variant="body1">
                        {submission.orgName || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} {...({} as any)}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Schedule sx={{ mr: 2, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Hours Completed
                      </Typography>
                      <Typography variant="body1">
                        {submission.hours || 0} hours
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} {...({} as any)}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Person sx={{ mr: 2, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Supervisor Name
                      </Typography>
                      <Typography variant="body1">
                        {submission.supervisorName || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} {...({} as any)}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Phone sx={{ mr: 2, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Telephone
                      </Typography>
                      <Typography variant="body1">
                        {submission.telephone || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} {...({} as any)}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CalendarToday sx={{ mr: 2, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Submission Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(submission.submissionDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid xs={12} sm={6} {...({} as any)}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Assignment sx={{ mr: 2, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="body1">
                        {submission.status}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Description sx={{ mr: 2, color: "text.secondary" }} />
                <Typography variant="h6">Activity Description</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {submission.description || "No description provided."}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="audit-trail-content"
                  id="audit-trail-header"
                  onClick={fetchAuditTrail}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <History sx={{ mr: 2, color: "text.secondary" }} />
                    <Typography variant="h6">Submission History</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {auditLoading ? (
                    <Box sx={{ py: 2 }}>
                      <Skeleton variant="text" height={40} />
                      <Skeleton variant="text" height={40} />
                      <Skeleton variant="text" height={40} />
                    </Box>
                  ) : auditTrail.length > 0 ? (
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      {auditTrail.map((entry, index) => (
                        <Box key={entry.id} sx={{ display: 'flex', gap: 2 }}>
                          {/* Timeline connector */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: entry.action === 'REJECTED' ? 'error.main' :
                                         entry.action === 'APPROVED' ? 'success.main' :
                                         entry.action === 'SUBMITTED' ? 'info.main' : 'primary.main',
                              }}
                            >
                              {getAuditActionIcon(entry.action)}
                            </Avatar>
                            {index < auditTrail.length - 1 && (
                              <Box
                                sx={{
                                  width: 2,
                                  height: 40,
                                  bgcolor: 'divider',
                                  mt: 1,
                                }}
                              />
                            )}
                          </Box>
                          
                          {/* Content */}
                          <Box sx={{ flex: 1 }}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                bgcolor: entry.action === 'REJECTED' ? 'error.50' : 
                                         entry.action === 'APPROVED' ? 'success.50' : 
                                         'background.paper'
                              }}
                            >
                              <Typography variant="subtitle1" component="h6" gutterBottom>
                                {getAuditActionDescription(entry)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {formatAuditDate(entry.timestamp)}
                              </Typography>
                              
                              {entry.rejectionReason && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: 'error.100', borderRadius: 1 }}>
                                  <Typography variant="body2" color="error.main">
                                    <strong>Rejection Reason:</strong> {entry.rejectionReason}
                                  </Typography>
                                </Box>
                              )}
                              
                              {entry.previousStatus && (
                                <Typography variant="caption" color="text.secondary">
                                  Status changed from <strong>{entry.previousStatus}</strong> to <strong>{entry.newStatus}</strong>
                                </Typography>
                              )}
                            </Paper>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No history available for this submission yet.
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid xs={12} md={4} {...({} as any)}>
          {/* Submission Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Submission Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Submission ID
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {submission.id}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Student ID
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {submission.studentId}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={submission.status}
                  color={getStatusColor(submission.status) as any}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Signatures Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Signatures
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">
                    Pre-Approved Signature
                  </Typography>
                  <Chip
                    label={
                      submission.preApprovedSignatureUrl ? "Signed" : "Pending"
                    }
                    color={
                      submission.preApprovedSignatureUrl ? "success" : "warning"
                    }
                    size="small"
                  />
                </Box>
              </Box>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">Supervisor Signature</Typography>
                  <Chip
                    label={
                      submission.supervisorSignatureUrl ? "Signed" : "Pending"
                    }
                    color={
                      submission.supervisorSignatureUrl ? "success" : "warning"
                    }
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Submission Timeline */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Timeline
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {formatDate(submission.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {formatDate(submission.updatedAt)}
                </Typography>
              </Box>
              {submission.submissionDate && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Submitted
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(submission.submissionDate)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this submission from{" "}
            <strong>{submission.orgName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={actionLoading}
            startIcon={<Check />}
          >
            {actionLoading ? "Approving..." : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Submission</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to reject this submission from{" "}
            <strong>{submission.orgName}</strong>? This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Provide feedback on why this submission is being rejected..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={<Close />}
          >
            {actionLoading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SubmissionDetail;