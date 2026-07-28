import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginView from '../../features/auth/components/LoginView';
import DashboardView from '../../features/workspace/components/DashboardView';
import BoardView from '../../features/board/components/BoardView';
import CreateBoardView from '../../features/board/components/CreateBoardView';
import { ActivityView } from '../../features/activity/components/ActivityView';
import { MyTasksView } from '../../features/tasks/components/MyTasksView';
import { CalendarView } from '../../features/calendar/components/CalendarView';
import { SettingsView } from '../../features/settings/components/SettingsView';
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
          <Route path="/activity" element={<ActivityView />} />
          <Route path="/tasks" element={<MyTasksView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
