import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginView from '../../features/auth/components/LoginView';
import DashboardView from '../../features/workspace/components/DashboardView';
import BoardView from '../../features/board/components/BoardView';
import CreateBoardView from '../../features/board/components/CreateBoardView';
import { MainLayout } from '../layout/MainLayout';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginView />} />
        
        {/* Protected routes wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/b/create" element={<CreateBoardView />} />
          <Route path="/b/:boardId" element={<BoardView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
