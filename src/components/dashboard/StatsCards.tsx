import React from 'react';
import { Grid, Card, CardContent, Box, Avatar, Typography } from '@mui/material';
import { Groups, Assignment, AssignmentTurnedIn, Schedule, School } from '@mui/icons-material';
import ts from 'typescript';

interface StatsCardsProps {
  totalUsers: number;
  totalSubmissions: number;
  totalSubmittedSubmissions: number;
  totalHours: number;
  usersWithSignatures: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalUsers,
  totalSubmissions,
  totalSubmittedSubmissions,
  totalHours,
  usersWithSignatures
}) => {
  const stats = [
    {
      icon: <Groups />,
      label: 'Total Students',
      value: totalUsers,
      color: 'primary.main'
    },
    {
      icon: <Assignment />,
      label: 'Total Submissions',
      value: totalSubmissions,
      color: 'success.main'
    },
    {
      icon: <AssignmentTurnedIn />,
      label: 'Submitted',
      value: totalSubmittedSubmissions,
      color: 'info.main'
    },
    {
      icon: <Schedule />,
      label: 'Total Hours',
      value: totalHours.toLocaleString(),
      color: 'warning.main'
    },
    {
      icon: <School />,
      label: 'With Signatures',
      value: usersWithSignatures,
      color: 'secondary.main'
    }
  ];
  //@ts-ignore
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index} {...({} as any)}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};