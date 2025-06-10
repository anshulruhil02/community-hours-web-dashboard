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
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  CalendarToday,
  Schedule,
  Business,
  Person,
  Phone,
  Email,
  LocationOn,
  Description,
  Assignment,
  CheckCircle,
  Pending,
  Edit,
  Download,
  Share,
} from "@mui/icons-material";
import { userService } from "../services/userService";
import { Submission } from "../types/User";

const SubmissionDetail: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        return <CheckCircle />;
      default:
        return <Pending />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton
            variant="rectangular"
            width={100}
            height={40}
            sx={{ mb: 2 }}
          />
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" height={30} />
        </Box>

        <Grid container spacing={3}>
          {/* @ts-ignore */}
          <Grid xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          {/* @ts-ignore */}

          <Grid xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

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
      {/* Header */}
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

      <Grid container spacing={3}>
        {/* Main Content */}
        {/* @ts-ignore */}

        <Grid xs={12} md={8}>
          {/* Service Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* @ts-ignore */}

                <Grid xs={12} sm={6}>
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
                {/* @ts-ignore */}

                <Grid xs={12} sm={6}>
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

                {/* @ts-ignore */}
                <Grid xs={12} sm={6}>
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
                {/* @ts-ignore */}

                <Grid xs={12} sm={6}>
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

                {/* @ts-ignore */}
                <Grid xs={12} sm={6}>
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

                {/* @ts-ignore */}
                <Grid xs={12} sm={6}>
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

          {/* Description */}
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
        </Grid>

        {/* Sidebar */}
        {/* @ts-ignore */}

        <Grid xs={12} md={4}>
          

          {/* Signatures Status */}

{/* Signatures and Timeline - Horizontal Stack */}
<Stack direction="row" spacing={3} sx={{ mb: 3 , width: '100%' }}>
    {/* Submission Information */}
          <Card sx={{ flex: 1 }}>
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
  <Card sx={{ flex: 1 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Signatures
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">Pre-Approved Signature</Typography>
          <Chip
            label={submission.preApprovedSignatureUrl ? "Signed" : "Pending"}
            color={submission.preApprovedSignatureUrl ? "success" : "warning"}
            size="small"
          />
        </Box>
      </Box>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">Supervisor Signature</Typography>
          <Chip
            label={submission.supervisorSignatureUrl ? "Signed" : "Pending"}
            color={submission.supervisorSignatureUrl ? "success" : "warning"}
            size="small"
          />
        </Box>
      </Box>
    </CardContent>
  </Card>

  {/* Submission Timeline */}
  <Card sx={{ flex: 1 }}>
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
</Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SubmissionDetail;
