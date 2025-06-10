import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CommunityHoursDashboard from './components/dashboard/CommunityHoursDashboard';
import { UserDetail } from './components/UserDetail';
import SubmissionDetail from './components/SubmissionDetail'; // Add this line

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CommunityHoursDashboard />} />
        <Route path="/user/:userId" element={<UserDetail />} />
        <Route path="/submissions/:submissionId" element={<SubmissionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;