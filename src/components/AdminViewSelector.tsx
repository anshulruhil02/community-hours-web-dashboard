// src/components/common/AdminViewSelector.tsx
import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';

interface AdminViewSelectorProps {
  onSelectView: (view: 'SCHOOL_ADMIN' | 'BOARD_ADMIN') => void;
  currentDisplayMode: 'SCHOOL_ADMIN' | 'BOARD_ADMIN';
}

const AdminViewSelector: React.FC<AdminViewSelectorProps> = ({ onSelectView, currentDisplayMode }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh', // Adjust as needed
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center', maxWidth: 500 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Choose your Dashboard View
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
          <Button
            variant={currentDisplayMode === 'SCHOOL_ADMIN' ? 'contained' : 'outlined'}
            color="primary"
            size="large"
            onClick={() => onSelectView('SCHOOL_ADMIN')}
          >
            School Admin View
          </Button>
          <Button
            variant={currentDisplayMode === 'BOARD_ADMIN' ? 'contained' : 'outlined'}
            color="secondary" // Use a different color for distinction
            size="large"
            onClick={() => onSelectView('BOARD_ADMIN')}
          >
            Board Admin View
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminViewSelector;