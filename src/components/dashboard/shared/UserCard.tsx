import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import { Email, CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatabaseUser } from '../../../types/User';
import { formatDate, getTotalHours, getSubmissionStats, getInitials } from '../../../utils/formatters';

interface UserCardProps {
  user: DatabaseUser;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const navigate = useNavigate();
  const stats = getSubmissionStats(user.Submissions);
  const totalHours = getTotalHours(user.Submissions);
  const completionRate = stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0;

  const handleCardClick = () => {
    navigate(`/user/${user.id}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent>
        {/* User Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 56, 
              height: 56,
              mr: 2,
              fontSize: '1.25rem'
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" component="div">
              {user.name}
            </Typography>
            <Box display="flex" alignItems="center" color="text.secondary">
              <Email sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2">
                {user.email}
              </Typography>
            </Box>
          </Box>
          {totalHours > 0 && (
            <Box textAlign="center">
              <Typography variant="h5" color="primary">
                {totalHours}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                hours
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* User Details */}
        <Box mb={2}>
          {user.schoolId && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>School ID:</strong> {user.schoolId}
            </Typography>
          )}
          {user.oen && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>OEN:</strong> {user.oen}
            </Typography>
          )}
          {user.principal && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Principal:</strong> {user.principal}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            <strong>Joined:</strong> {formatDate(user.createdAt)}
          </Typography>
        </Box>

        {/* Signatures */}
        <Box display="flex" gap={1} mb={2}>
          <Chip
            icon={user.studentSignatureUrl ? <CheckCircle /> : <Cancel />}
            label="Student"
            color={user.studentSignatureUrl ? "success" : "default"}
            size="small"
            variant={user.studentSignatureUrl ? "filled" : "outlined"}
          />
          <Chip
            icon={user.parentSignatureUrl ? <CheckCircle /> : <Cancel />}
            label="Parent"
            color={user.parentSignatureUrl ? "success" : "default"}
            size="small"
            variant={user.parentSignatureUrl ? "filled" : "outlined"}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Submissions */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">
              Submissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.total} total
            </Typography>
          </Box>

          {stats.total > 0 ? (
            <>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="success.main">
                  ✓ Submitted: {stats.submitted}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  ⏳ Draft: {stats.draft}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={completionRate}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: completionRate === 100 ? 'success.main' : 'primary.main'
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {Math.round(completionRate)}% completed
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              No submissions yet
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};