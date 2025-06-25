import React from 'react';
import { SignIn } from '@clerk/clerk-react'; 
import { Box, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from "../../styles/theme"; 

import CustomSignUpForm from "./CustomSignUpForm"; 

const LoginPage: React.FC = () => {
  const isSignUpPath = window.location.pathname.includes('/sign-up');

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, color: 'text.primary' }}>
          Welcome to Community Hours
        </Typography>
        {isSignUpPath ? (
          <CustomSignUpForm /> 
        ) : (
          <SignIn
            path="/sign-in" 
            routing="path" 
            signUpUrl="/sign-up"
          />
        )}
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;
