// src/components/auth/CustomSignUpForm.tsx
import React, { useState } from "react";
import {
  useSignUp, // Hook to interact with Clerk's signup process
} from "@clerk/clerk-react";
import { ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // <-- Import Link from react-router-dom
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { theme } from "../../styles/theme"; // Import your theme
// import { Link as RouterLink, useNavigate } from 'react-router-dom';

// Define UserRole enum (should match your backend and types/User.ts)
enum UserRole {
  SchoolAdmin = "SCHOOL_ADMIN",
  BoardAdmin = "BOARD_ADMIN"
}

const CustomSignUpForm: React.FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp(); // Clerk's signup state and methods

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>(''); // State for selected role
  const [schoolId, setSchoolId] = useState(""); // State for school ID
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle initial sign up step
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLoaded) {
      return;
    }

    // Basic validation
    if (!selectedRole) {
        setError("Please select a role.");
        setLoading(false);
        return;
    }
    if (selectedRole === UserRole.SchoolAdmin && !schoolId) {
        setError("School ID is required for School Admins.");
        setLoading(false);
        return;
    }

    try {
      // Create user with basic info
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
        // Pass custom metadata here. Clerk automatically handles these fields
        // if they are defined in your dashboard's Public Metadata.
        unsafeMetadata: {
          role: selectedRole,
          schoolId: selectedRole === UserRole.SchoolAdmin ? schoolId : undefined, // Only pass schoolId if School Admin
        },
      });

      // Attempt email verification if sign-up was successful
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" }); 
      setPendingVerification(true); // Move to verification step
    } catch (err: any) {
      console.error("Clerk sign-up error:", JSON.stringify(err, null, 2));
      // Display Clerk's specific error messages
      setError(err.errors?.[0]?.longMessage || "An unexpected sign-up error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle email verification step
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId }); // Activate the session
        navigate('/'); 
        // Redirect to dashboard (handled by ClerkProvider's default redirects)
      } else {
        console.log(JSON.stringify(completeSignUp, null, 2));
        setError("Email verification not complete. Please try again.");
      }
    } catch (err: any) {
      console.error("Clerk verification error:", JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.longMessage || "Failed to verify email. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  // Custom styling for the form container
  const formBoxStyle = {
    p: 4,
    borderRadius: 2,
    boxShadow: 3,
    bgcolor: 'background.paper',
    width: '100%',
    maxWidth: 450,
    display: 'flex',
    flexDirection: 'column',
    gap: 2, // Space between form elements
    mx: 'auto', // <-- Add this for horizontal centering within its parent flex container
  };

  if (!isLoaded) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ ...formBoxStyle, alignItems: 'center' }}>
          <CircularProgress />
          <Typography>Loading signup form...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={formBoxStyle}> {/* This Box will now center itself */}
        <Typography variant="h5" component="h2" gutterBottom align="center" color="text.primary">
          Sign Up for Community Hours
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {!pendingVerification ? (
          <form onSubmit={handleSignUp}>
            <TextField
              label="Email Address"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              margin="normal"
            />

            {/* Role Selection Dropdown */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-select-label">Select Your Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={selectedRole}
                label="Select Your Role"
                onChange={(e) => {
                  setSelectedRole(e.target.value as UserRole);
                  // Clear schoolId if role changes from School Admin
                  if (e.target.value !== UserRole.SchoolAdmin) {
                      setSchoolId('');
                  }
                }}
              >
                <MenuItem value={UserRole.SchoolAdmin}>School Admin</MenuItem>
                <MenuItem value={UserRole.BoardAdmin}>Board Admin</MenuItem>
              </Select>
            </FormControl>

            {/* Conditional School ID Field */}
            {selectedRole === UserRole.SchoolAdmin && (
              <TextField
                label="School ID"
                type="text"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                fullWidth
                margin="normal"
                required // School ID becomes required if School Admin is selected
              />
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>

            {/* Link to Sign In Page */}
            <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
              Already have an account?{" "}
              <RouterLink to="/sign-in" style={{ textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 'bold' }}>
                Sign In
              </RouterLink>
            </Typography>
          </form>
        ) : (
          // Email Verification Step
          <form onSubmit={handleVerify}>
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              A verification code has been sent to your email.
            </Typography>
            <TextField
              label="Verification Code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Verify Email"}
            </Button>

            {/* Link to Sign In Page from verification step (optional) */}
            <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
              Go back to{" "}
              <RouterLink to="/sign-in" style={{ textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 'bold' }}>
                Sign In
              </RouterLink>
            </Typography>
          </form>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default CustomSignUpForm;
