import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import DailyNotes from './components/DailyNotes';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<DailyNotes />} />
            <Route path="/page/:id" element={<Editor />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App; 