import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Skeleton,
  Alert,
  Button,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  History,
  Assessment,
  School,
  TrendingUp,
  CheckCircle,
  Cancel,
  Send,
  Create,
  Refresh,
  FilterList,
  DateRange,
} from "@mui/icons-material";
import { userService } from "../../../services/userService";
import { RecentActivityEntry, AuditStatistics } from "../../../types/User";

interface SchoolAuditDashboardProps {
  schoolId?: string;
  schoolName?: string;
}

const SchoolAuditDashboard: React.FC<SchoolAuditDashboardProps> = ({
  schoolId,
  schoolName,
}) => {
  const [recentActivity, setRecentActivity] = useState<RecentActivityEntry[]>([]);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activityLoading, setActivityLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<string>("30");
  const [activityLimit, setActivityLimit] = useState<number>(25);

  // Fetch school audit data
  const fetchSchoolAuditData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Fetch statistics and recent activity
      const [statsData, activityData] = await Promise.all([
        userService.getAuditStatistics(
          startDate.toISOString(),
          endDate.toISOString()
        ),
        userService.getRecentAuditActivity(activityLimit)
      ]);

      // Filter activity by school if schoolId is provided
      const filteredActivity = schoolId 
        ? activityData.filter(entry => entry.schoolName === schoolId)
        : activityData;

      setStatistics(statsData);
      setRecentActivity(filteredActivity);
      setError(null);
    } catch (err) {
      console.error("Error fetching school audit data:", err);
      setError("Failed to load audit data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh just the activity feed
  const refreshActivity = async () => {
    try {
      setActivityLoading(true);
      const activityData = await userService.getRecentAuditActivity(activityLimit);
      
      const filteredActivity = schoolId 
        ? activityData.filter(entry => entry.schoolName === schoolId)
        : activityData;
      
      setRecentActivity(filteredActivity);
    } catch (err) {
      console.error("Error refreshing activity:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolAuditData();
  }, [dateRange, activityLimit, schoolId]);

  // Helper functions
  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATED":
        return <Create fontSize="small" />;
      case "SUBMITTED":
        return <Send fontSize="small" />;
      case "APPROVED":
        return <CheckCircle fontSize="small" />;
      case "REJECTED":
        return <Cancel fontSize="small" />;
      default:
        return <History fontSize="small" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATED":
        return "primary.main";
      case "SUBMITTED":
        return "info.main";
      case "APPROVED":
        return "success.main";
      case "REJECTED":
        return "error.main";
      default:
        return "text.secondary";
    }
  };

  const getActionDescription = (entry: RecentActivityEntry): string => {
    switch (entry.action) {
      case "CREATED":
        return `${entry.studentName} created a new submission`;
      case "SUBMITTED":
        return `${entry.studentName} submitted for review`;
      case "APPROVED":
        return `${entry.performedByName} approved ${entry.studentName}'s submission`;
      case "REJECTED":
        return `${entry.performedByName} rejected ${entry.studentName}'s submission`;
      default:
        return `${entry.performedByName} performed ${entry.action}`;
    }
  };

  // Filter activity based on selected filters
  const filteredActivity = recentActivity.filter(entry => {
    return actionFilter === "ALL" || entry.action === actionFilter;
  });

  // Statistics cards data
  const statsCards = [
    {
      title: "Total Actions",
      value: statistics?.summary.totalActions || 0,
      icon: <Assessment />,
      color: "primary.main",
    },
    {
      title: "New Submissions",
      value: statistics?.summary.totalSubmissions || 0,
      icon: <Create />,
      color: "info.main",
    },
    {
      title: "Approvals",
      value: statistics?.summary.totalApprovals || 0,
      icon: <CheckCircle />,
      color: "success.main",
    },
    {
      title: "Rejections",
      value: statistics?.summary.totalRejections || 0,
      icon: <Cancel />,
      color: "error.main",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i} {...({} as any)}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ mt: 3 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchSchoolAuditData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <School sx={{ mr: 2, verticalAlign: "middle" }} />
          {schoolName ? `${schoolName} Audit Dashboard` : "School Audit Dashboard"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor submission activity and track performance for the past {dateRange} days
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} {...({} as any)}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" component="div" gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters and Recent Activity */}
      <Card>
        <CardContent>
          {/* Header with filters */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" component="h2">
              <History sx={{ mr: 1, verticalAlign: "middle" }} />
              Recent Activity
            </Typography>
            
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {/* Action Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Actions</MenuItem>
                  <MenuItem value="CREATED">Created</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>

              {/* Date Range Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={dateRange}
                  label="Period"
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <MenuItem value="7">Last 7 days</MenuItem>
                  <MenuItem value="30">Last 30 days</MenuItem>
                  <MenuItem value="90">Last 90 days</MenuItem>
                </Select>
              </FormControl>

              {/* Refresh Button */}
              <IconButton 
                onClick={refreshActivity} 
                disabled={activityLoading}
                title="Refresh activity"
              >
                <Refresh />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Activity Feed */}
          {activityLoading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={80} />
              ))}
            </Stack>
          ) : filteredActivity.length > 0 ? (
            <Stack spacing={2}>
              {filteredActivity.map((entry, index) => (
                <Box key={entry.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  {/* Timeline connector */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: getActionColor(entry.action),
                      }}
                    >
                      {getActionIcon(entry.action)}
                    </Avatar>
                    {index < filteredActivity.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          height: 20,
                          bgcolor: 'divider',
                          mt: 1,
                        }}
                      />
                    )}
                  </Box>
                  
                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {getActionDescription(entry)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(entry.timestamp)}
                      </Typography>
                      
                      {entry.orgName && (
                        <>
                          <Typography variant="caption" color="text.secondary">•</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.orgName}
                          </Typography>
                        </>
                      )}
                      
                      {entry.submissionHours && (
                        <>
                          <Typography variant="caption" color="text.secondary">•</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.submissionHours} hours
                          </Typography>
                        </>
                      )}
                      
                      <Chip
                        label={entry.action}
                        size="small"
                        color={
                          entry.action === 'APPROVED' ? 'success' :
                          entry.action === 'REJECTED' ? 'error' :
                          entry.action === 'SUBMITTED' ? 'info' : 'default'
                        }
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recent activity found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {actionFilter !== "ALL" 
                  ? `No ${actionFilter.toLowerCase()} actions in the selected period`
                  : "No submission activity in the selected period"
                }
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={refreshActivity}
                sx={{ mt: 2 }}
              >
                Refresh
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SchoolAuditDashboard;