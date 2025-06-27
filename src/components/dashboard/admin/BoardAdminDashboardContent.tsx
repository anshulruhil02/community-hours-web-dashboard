// src/components/dashboards/admin/BoardAdminDashboardContent.tsx
import React, { useState, useMemo } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import Groups from "@mui/icons-material/Groups";
import Description from "@mui/icons-material/Description";
import CloudDownload from "@mui/icons-material/CloudDownload";
import School from "@mui/icons-material/School";
import History from "@mui/icons-material/History";
import Dashboard from "@mui/icons-material/Dashboard";
import Analytics from "@mui/icons-material/Analytics";

import { DatabaseUser } from "../../../types/User";
import { getTotalHours } from "../../../utils/formatters";
import { SearchBar } from "../shared/SearchBar";
import BoardAuditDashboard from "./BoardAuditDashboard";

interface BoardAdminDashboardContentProps {
  users: DatabaseUser[];
  totalUsers: number;
  totalSubmissions: number;
  totalHours: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`board-admin-tabpanel-${index}`}
      aria-labelledby={`board-admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `board-admin-tab-${index}`,
    'aria-controls': `board-admin-tabpanel-${index}`,
  };
}

const BoardAdminDashboardContent: React.FC<BoardAdminDashboardContentProps> = ({
  users,
  totalUsers,
  totalSubmissions,
  totalHours,
}) => {
  const [schoolSearchTerm, setSchoolSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const placeHolderText = "Search for a school by name";

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // --- Board-Level Analytics Logic (Optimized with useMemo) ---
  const schoolsData = useMemo(() => {
    return users.reduce((acc, user) => {
      const schoolId = user.schoolId || "Unknown School";
      if (!acc[schoolId]) {
        acc[schoolId] = {
          totalStudents: 0,
          totalSubmissions: 0,
          totalHours: 0,
        };
      }
      acc[schoolId].totalStudents++;
      acc[schoolId].totalSubmissions += user.Submissions.length;
      acc[schoolId].totalHours += getTotalHours(user.Submissions);
      return acc;
    }, {} as Record<string, { totalStudents: number; totalSubmissions: number; totalHours: number }>);
  }, [users]);

  const totalSchools = Object.keys(schoolsData).length;
  const schoolNames = Object.keys(schoolsData);

  // Calculate system-wide metrics for audit tab badge
  const pendingSubmissionsCount = users.reduce((count, user) => {
    return count + user.Submissions.filter(sub => sub.status === 'SUBMITTED').length;
  }, 0);

  const recentActivityCount = users.reduce((count, user) => {
    const recentSubmissions = user.Submissions.filter(sub => {
      const submissionDate = new Date(sub.submissionDate || sub.createdAt);
      const daysSince = (Date.now() - submissionDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7; // Activity in last 7 days
    });
    return count + recentSubmissions.length;
  }, 0);

  // Filtered schools based on search term (Optimized with useMemo)
  const filteredSchools = useMemo(() => {
    return Object.entries(schoolsData)
      .filter(([schoolId]) =>
        schoolId.toLowerCase().includes(schoolSearchTerm.toLowerCase())
      )
      .sort(([schoolIdA], [schoolIdB]) => schoolIdA.localeCompare(schoolIdB));
  }, [schoolsData, schoolSearchTerm]);

  const handleGenerateMinistryReport = () => {
    alert("Simulating OnSIS Report Generation... Report generated successfully!");
    console.log("Ministry Report Generated:", {
      reportType: "OnSIS Compliance",
      timestamp: new Date().toISOString(),
      dataSummary: {
        totalUsers,
        totalSubmissions,
        totalHours,
        schoolsOverview: schoolsData,
      },
    });
  };

  const handleViewSchoolDetails = (schoolId: string) => {
    alert(`Navigating to detailed dashboard for School ID: ${schoolId}`);
    console.log(`Action: Drill down to school ${schoolId} details`);
  };

  return (
    <Box>
      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="board admin dashboard tabs"
        >
          <Tab 
            icon={<Dashboard />} 
            label="Overview" 
            iconPosition="start"
            {...a11yProps(0)} 
          />
          <Tab 
            icon={
              <Badge badgeContent={recentActivityCount} color="primary" max={99}>
                <Analytics />
              </Badge>
            } 
            label="System Audit" 
            iconPosition="start"
            {...a11yProps(1)} 
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* Overview Tab - Original Dashboard Content */}
        
        {/* Board-Level Analytics Overview */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: "info.light" }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Groups sx={{ mr: 1 }} /> Board-Level Analytics Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} {...({} as any)}>
              <Typography variant="body1">
                Total Users Across Board: <strong>{totalUsers}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} {...({} as any)}>
              <Typography variant="body1">
                Total Submissions (All Schools): <strong>{totalSubmissions}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} {...({} as any)}>
              <Typography variant="body1">
                Total Hours Logged (All Schools): <strong>{totalHours.toFixed(1)}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} {...({} as any)}>
              <Typography variant="body1">
                Total Schools Managed: <strong>{totalSchools}</strong>
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            System-wide aggregated data for all schools under the DDSB.
          </Typography>
        </Paper>

        {/* Search Bar for Schools */}
        <Box mb={3}>
          <SearchBar
            searchTerm={schoolSearchTerm}
            onSearchChange={setSchoolSearchTerm}
            placeholderText={placeHolderText}
          />
        </Box>

        {/* List of All Schools Under the Board */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <School sx={{ mr: 1 }} /> Schools Overview ({filteredSchools.length} {filteredSchools.length === 1 ? 'school' : 'schools'} displayed)
          </Typography>

          {filteredSchools.length > 0 ? (
            <Grid container spacing={3}>
              {filteredSchools.map(([schoolId, data]) => (
                <Grid item xs={12} sm={6} md={4} key={schoolId} {...({} as any)}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        {schoolId}
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Students: <strong>{data.totalStudents}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Submissions: <strong>{data.totalSubmissions}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hours: <strong>{data.totalHours.toFixed(1)}</strong>
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => handleViewSchoolDetails(schoolId)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h6" color="text.secondary">
                {schoolSearchTerm
                  ? `No schools found matching "${schoolSearchTerm}".`
                  : "No schools registered yet for this board."}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Automated Ministry Reporting Section */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: "success.light" }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Description sx={{ mr: 1 }} /> Automated Ministry Reporting
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Generate compliance reports for the Ministry of Education with one click.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudDownload />}
            onClick={handleGenerateMinistryReport}
            sx={{ mb: 2 }}
          >
            Generate OnSIS Compliance Report
          </Button>
          <List dense>
            <ListItem>
              <ListItemText primary="• One-click export for OnSIS compliance" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Pre-built reports (completion rates, at-risk students, organization breakdown)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Excel/PDF export ready for Ministry submission" />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            **Time Savings:** Automating this process can reduce reporting time from 8 hours to under 10 minutes, significantly improving operational efficiency.
          </Typography>
        </Paper>

        {/* Placeholder for other Board Admin specific tools */}
        <Paper sx={{ p: 4, textAlign: "center", mt: 4, bgcolor: "background.paper" }}>
          <Groups sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Board Admin View: Student-specific cards are typically not shown here.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Instead, this section would display aggregated data, school-level reports, or tools for cross-school management.
            Individual student details would likely be accessed by drilling down into specific schools or through a dedicated "manage students" interface at the school level.
          </Typography>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* System Audit Tab - New Board-Level Audit Dashboard */}
        <BoardAuditDashboard schools={schoolNames} />
      </TabPanel>
    </Box>
  );
};

export default BoardAdminDashboardContent; 