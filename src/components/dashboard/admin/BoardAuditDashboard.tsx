// src/components/dashboards/BoardAuditDashboard.tsx
import React, { useState, useEffect, useMemo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  History,
  Assessment,
  TrendingUp,
  School,
  CheckCircle,
  Cancel,
  Send,
  Create,
  Refresh,
  FilterList,
  DateRange,
  Analytics,
  CompareArrows,
  Download,
  Visibility,
  Warning,
  Info,
} from "@mui/icons-material";
import { userService } from "../../../services/userService";
import { RecentActivityEntry, AuditStatistics } from "../../../types/User";

interface BoardAuditDashboardProps {
  schools?: string[]; // List of schools under this board
}

const BoardAuditDashboard: React.FC<BoardAuditDashboardProps> = ({ schools = [] }) => {
  const [recentActivity, setRecentActivity] = useState<RecentActivityEntry[]>([]);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activityLoading, setActivityLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [schoolFilter, setSchoolFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<string>("30");
  const [activityLimit, setActivityLimit] = useState<number>(50);
  const [viewMode, setViewMode] = useState<string>("FEED"); // FEED, TABLE, ANALYTICS

  // Fetch system-wide audit data
  const fetchSystemAuditData = async () => {
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

      setStatistics(statsData);
      setRecentActivity(activityData);
      setError(null);
    } catch (err) {
      console.error("Error fetching system audit data:", err);
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
      setRecentActivity(activityData);
    } catch (err) {
      console.error("Error refreshing activity:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemAuditData();
  }, [dateRange, activityLimit]);

  // Process data for analytics
  const analyticsData = useMemo(() => {
    const schoolStats = recentActivity.reduce((acc, entry) => {
      const school = entry.schoolName || 'Unknown School';
      if (!acc[school]) {
        acc[school] = {
          totalActions: 0,
          created: 0,
          submitted: 0,
          approved: 0,
          rejected: 0,
          totalHours: 0,
          lastActivity: entry.timestamp,
        };
      }
      
      acc[school].totalActions++;
      acc[school][entry.action.toLowerCase() as keyof typeof acc[string]]++;
      if (entry.submissionHours) {
        acc[school].totalHours += entry.submissionHours;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(schoolStats).map(([school, data]) => ({
      school,
      ...data,
      approvalRate: data.submitted > 0 ? (data.approved / (data.approved + data.rejected)) * 100 : 0,
      activityScore: data.totalActions,
    })).sort((a, b) => b.activityScore - a.activityScore);
  }, [recentActivity]);

  // Get unique schools from activity data
  const availableSchools = useMemo(() => {
    const schoolSet = new Set(recentActivity.map(entry => entry.schoolName).filter(Boolean));
    return Array.from(schoolSet).sort();
  }, [recentActivity]);

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
    const schoolText = entry.schoolName ? ` at ${entry.schoolName}` : '';
    switch (entry.action) {
      case "CREATED":
        return `${entry.studentName} created a new submission${schoolText}`;
      case "SUBMITTED":
        return `${entry.studentName} submitted for review${schoolText}`;
      case "APPROVED":
        return `${entry.performedByName} approved ${entry.studentName}'s submission${schoolText}`;
      case "REJECTED":
        return `${entry.performedByName} rejected ${entry.studentName}'s submission${schoolText}`;
      default:
        return `${entry.performedByName} performed ${entry.action}${schoolText}`;
    }
  };

  // Filter activity based on selected filters
  const filteredActivity = recentActivity.filter(entry => {
    const actionMatch = actionFilter === "ALL" || entry.action === actionFilter;
    const schoolMatch = schoolFilter === "ALL" || entry.schoolName === schoolFilter;
    return actionMatch && schoolMatch;
  });

  // Statistics cards data
  const statsCards = [
    {
      title: "System Actions",
      value: statistics?.summary.totalActions || 0,
      icon: <Assessment />,
      color: "primary.main",
      trend: "+12%",
    },
    {
      title: "New Submissions",
      value: statistics?.summary.totalSubmissions || 0,
      icon: <Create />,
      color: "info.main",
      trend: "+8%",
    },
    {
      title: "Total Approvals",
      value: statistics?.summary.totalApprovals || 0,
      icon: <CheckCircle />,
      color: "success.main",
      trend: "+15%",
    },
    {
      title: "Total Rejections",
      value: statistics?.summary.totalRejections || 0,
      icon: <Cancel />,
      color: "error.main",
      trend: "-3%",
    },
  ];

  const exportData = () => {
    const csvData = filteredActivity.map(entry => ({
      timestamp: entry.timestamp,
      school: entry.schoolName,
      student: entry.studentName,
      action: entry.action,
      performer: entry.performedByName,
      role: entry.performedByRole,
      organization: entry.orgName,
      hours: entry.submissionHours,
    }));
    
    console.log("Exporting audit data:", csvData);
    alert("Export functionality would download CSV with filtered audit data");
  };

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
          <Button color="inherit" size="small" onClick={fetchSystemAuditData}>
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
          <Analytics sx={{ mr: 2, verticalAlign: "middle" }} />
          System-Wide Audit Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor submission activity across all schools for the past {dateRange} days
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
                      {stat.value.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Chip 
                      label={stat.trend} 
                      size="small" 
                      color={stat.trend.startsWith('+') ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    />
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

      {/* School Performance Overview */}
      {analyticsData.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <School sx={{ mr: 1, verticalAlign: "middle" }} />
              School Performance Overview
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>School</TableCell>
                    <TableCell align="right">Total Actions</TableCell>
                    <TableCell align="right">Submissions</TableCell>
                    <TableCell align="right">Approved</TableCell>
                    <TableCell align="right">Approval Rate</TableCell>
                    <TableCell align="right">Total Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.slice(0, 10).map((school) => (
                    <TableRow key={school.school}>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <School sx={{ mr: 1, fontSize: 16 }} />
                          {school.school}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Badge badgeContent={school.totalActions} color="primary">
                          <Box sx={{ width: 20 }} />
                        </Badge>
                      </TableCell>
                      <TableCell align="right">{school.submitted}</TableCell>
                      <TableCell align="right">{school.approved}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={school.approvalRate} 
                            sx={{ width: 60, mr: 1 }}
                            color={school.approvalRate > 80 ? 'success' : school.approvalRate > 60 ? 'warning' : 'error'}
                          />
                          {school.approvalRate.toFixed(1)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">{school.totalHours.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed with Advanced Filters */}
      <Card>
        <CardContent>
          {/* Header with filters */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" component="h2">
              <History sx={{ mr: 1, verticalAlign: "middle" }} />
              System Activity Feed
            </Typography>
            
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: 'wrap' }}>
              {/* School Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>School</InputLabel>
                <Select
                  value={schoolFilter}
                  label="School"
                  onChange={(e) => setSchoolFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Schools</MenuItem>
                  {availableSchools.map(school => (
                    <MenuItem key={school} value={school}>{school}</MenuItem>
                  ))}
                </Select>
              </FormControl>

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

              {/* Export Button */}
              <Button
                startIcon={<Download />}
                onClick={exportData}
                variant="outlined"
                size="small"
              >
                Export
              </Button>

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

          {/* Results Summary */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredActivity.length} of {recentActivity.length} activities
            </Typography>
            {(actionFilter !== "ALL" || schoolFilter !== "ALL") && (
              <Button
                size="small"
                onClick={() => {
                  setActionFilter("ALL");
                  setSchoolFilter("ALL");
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          {/* Activity Feed */}
          {activityLoading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={80} />
              ))}
            </Stack>
          ) : filteredActivity.length > 0 ? (
            <Stack spacing={2} sx={{ maxHeight: 600, overflow: 'auto' }}>
              {filteredActivity.map((entry, index) => (
                <Box key={entry.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
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
                      
                      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        {entry.schoolName && (
                          <Chip
                            label={entry.schoolName}
                            size="small"
                            variant="outlined"
                            icon={<School />}
                          />
                        )}
                        <Chip
                          label={entry.action}
                          size="small"
                          color={
                            entry.action === 'APPROVED' ? 'success' :
                            entry.action === 'REJECTED' ? 'error' :
                            entry.action === 'SUBMITTED' ? 'info' : 'default'
                          }
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No activity found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(actionFilter !== "ALL" || schoolFilter !== "ALL")
                  ? "No activities match the selected filters"
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

export default BoardAuditDashboard;