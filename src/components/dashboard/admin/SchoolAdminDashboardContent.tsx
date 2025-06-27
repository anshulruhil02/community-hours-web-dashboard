// src/components/dashboards/SchoolAdminDashboardContent.tsx
import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import Person from "@mui/icons-material/Person";
import Groups from "@mui/icons-material/Groups";
import History from "@mui/icons-material/History";
import Dashboard from "@mui/icons-material/Dashboard";
import { DatabaseUser } from "../../../types/User";
import { UserCard } from "../shared/UserCard";
import { StatsCards } from "../shared/StatsCards";
import { SearchBar } from "../shared/SearchBar";
import SchoolAuditDashboard from "./SchoolAuditDashboard";

interface SchoolAdminDashboardContentProps {
  users: DatabaseUser[];
  totalUsers: number;
  totalSubmissions: number;
  totalSubmittedSubmissions: number;
  totalHours: number;
  usersWithSignatures: number;
  currentUser?: DatabaseUser; // Add current user to get school info
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
      id={`school-admin-tabpanel-${index}`}
      aria-labelledby={`school-admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `school-admin-tab-${index}`,
    'aria-controls': `school-admin-tabpanel-${index}`,
  };
}

const SchoolAdminDashboardContent: React.FC<SchoolAdminDashboardContentProps> = ({
  users,
  totalUsers,
  totalSubmissions,
  totalSubmittedSubmissions,
  totalHours,
  usersWithSignatures,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const placeHolderText = "Search for a student by name, email, school name, or OEN";

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.schoolId &&
        user.schoolId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.oen && user.oen.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get pending submissions count for badge
  const pendingSubmissionsCount = users.reduce((count, user) => {
    return count + user.Submissions.filter(sub => sub.status === 'SUBMITTED').length;
  }, 0);

  return (
    <Box>
      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="school admin dashboard tabs"
        >
          <Tab 
            icon={<Dashboard />} 
            label="Overview" 
            iconPosition="start"
            {...a11yProps(0)} 
          />
          <Tab 
            icon={
              <Badge badgeContent={pendingSubmissionsCount} color="error">
                <History />
              </Badge>
            } 
            label="Audit Trail" 
            iconPosition="start"
            {...a11yProps(1)} 
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* Overview Tab - Original Dashboard Content */}
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          placeholderText={placeHolderText} 
        />

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

        {users.length === 0 && !searchTerm && (
          <Paper sx={{ p: 4, textAlign: "center", mt: 4 }}>
            <Groups sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No students registered yet for this school.
            </Typography>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Audit Trail Tab - New Audit Dashboard */}
        <SchoolAuditDashboard 
          schoolId={currentUser?.schoolId || undefined}
          schoolName={currentUser?.schoolId || "Your School"}
        />
      </TabPanel>
    </Box>
  );
};

export default SchoolAdminDashboardContent;