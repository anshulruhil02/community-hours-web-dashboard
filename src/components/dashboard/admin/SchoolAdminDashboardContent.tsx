// src/components/dashboards/SchoolAdminDashboardContent.tsx
import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import Person from "@mui/icons-material/Person";
import Groups from "@mui/icons-material/Groups";
import { DatabaseUser } from "../../../types/User";
import { UserCard } from "../shared/UserCard"; // Adjust path as needed
import { StatsCards } from "../shared/StatsCards"; // Adjust path as needed
import { SearchBar } from "../shared/SearchBar"; // Adjust path as needed

interface SchoolAdminDashboardContentProps {
  users: DatabaseUser[];
  totalUsers: number;
  totalSubmissions: number;
  totalSubmittedSubmissions: number;
  totalHours: number;
  usersWithSignatures: number;
}

const SchoolAdminDashboardContent: React.FC<SchoolAdminDashboardContentProps> = ({
  users,
  totalUsers,
  totalSubmissions,
  totalSubmittedSubmissions,
  totalHours,
  usersWithSignatures,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const placeHolderText = "Serach for a student by name, email, school name, or OEN";

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.schoolId &&
        user.schoolId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.oen && user.oen.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholderText={placeHolderText} />

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
          // The {...({} as any)} cast is to bypass a known TS issue with MUI Grid item prop if you don't have the correct children types defined,
          // but typically, if `Grid` is a `container`, its children `Grid` elements should have the `item` prop.
          // This common issue is usually fixed by ensuring `@types/react` and `@types/material-ui` are compatible and up-to-date.
          // For now, it's kept as per your original code.
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

      {users.length === 0 && !searchTerm && ( // Removed !loading as parent handles it
        <Paper sx={{ p: 4, textAlign: "center", mt: 4 }}>
          <Groups sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No students registered yet for this school.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SchoolAdminDashboardContent;