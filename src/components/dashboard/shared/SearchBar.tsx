import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholderText: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, placeholderText }) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholderText}
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="action" />
          </InputAdornment>
        ),
      }}
      sx={{ mb: 3 }}
    />
  );
};