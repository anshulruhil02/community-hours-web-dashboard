// src/components/dashboards/admin/BoardAdminDashboardContent.tsx
import React, { useState, useMemo } from "react"; // Import useState and useMemo
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card, // Import Card for school items
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Groups, Description, CloudDownload, School } from "@mui/icons-material"; // Add School icon

import { DatabaseUser } from "../../../types/User"; // Adjust path as needed
import { getTotalHours } from "../../../utils/formatters"; // For calculations
import { SearchBar } from "../shared/SearchBar"; // Adjust path for SearchBar, assuming it's in `shared`

interface BoardAdminDashboardContentProps {
  users: DatabaseUser[];
  totalUsers: number;
  totalSubmissions: number;
  totalHours: number;
}

const BoardAdminDashboardContent: React.FC<BoardAdminDashboardContentProps> = ({
  users,
  totalUsers,
  totalSubmissions,
  totalHours,
}) => {
  const [schoolSearchTerm, setSchoolSearchTerm] = useState(""); 
  const placeHolderText = "Search for a school by name";

  // --- Board-Level Analytics Logic (Optimized with useMemo) ---
  const schoolsData = useMemo(() => {
    return users.reduce((acc, user) => {
      const schoolId = user.schoolId || "Unknown School"; // Handle cases with no schoolId
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
  }, [users]); // Recalculate only when users data changes

  const totalSchools = Object.keys(schoolsData).length;

  // Filtered schools based on search term (Optimized with useMemo)
  const filteredSchools = useMemo(() => {
    return Object.entries(schoolsData)
      .filter(([schoolId]) =>
        schoolId.toLowerCase().includes(schoolSearchTerm.toLowerCase())
      )
      .sort(([schoolIdA], [schoolIdB]) => schoolIdA.localeCompare(schoolIdB)); // Sort alphabetically by school ID
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
    // In a real app, this would trigger a backend call to generate and potentially download the report.
  };

  const handleViewSchoolDetails = (schoolId: string) => {
      alert(`Navigating to detailed dashboard for School ID: ${schoolId}`);
      console.log(`Action: Drill down to school ${schoolId} details`);
      // In a real application, this would use React Router to navigate:
      // navigate(`/school/${schoolId}`);
  };


  return (
    <Box>
      {/* Board-Level Analytics Overview (Summary Cards) */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: "info.light" }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Groups sx={{ mr: 1 }} /> Board-Level Analytics Overview
        </Typography>
        <Grid container spacing={2}>
          {/* @ts-ignore */}
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              Total Users Across Board: <strong>{totalUsers}</strong>
            </Typography>
          </Grid>
          {/* @ts-ignore */}
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              Total Submissions (All Schools): <strong>{totalSubmissions}</strong>
            </Typography>
          </Grid>
          {/* @ts-ignore */}
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              Total Hours Logged (All Schools): <strong>{totalHours.toFixed(1)}</strong>
            </Typography>
          </Grid>
          {/* @ts-ignore */}
          <Grid item xs={12} sm={4}>
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
          <Grid container spacing={3}> {/* Use spacing for cards */}
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
                      variant="contained" // Solid button for call to action
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
        <List dense> {/* List needs to be imported from @mui/material */}
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
    </Box>
  );
};

export default BoardAdminDashboardContent;