import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './utils/PrivateRoute';
import TeacherDashboard from './pages/TeacherDashboard';
import ManageMCQs from './pages/ManageMCQs';
import CreateQuiz from './pages/CreateQuiz';
import ManageQuizzes from './pages/ManageQuizzes';
import TeacherResults from './pages/TeacherResults';
import AdminPanel from './pages/AdminPanel';
import StudentDashboard from './pages/StudentDashboard';
import TakeQuiz from './pages/TakeQuiz';
import QuizResult from './pages/QuizResult';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/teacher" element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/teacher/mcqs/:materialId" element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <ManageMCQs />
                </PrivateRoute>
              } />
              
              <Route path="/teacher/quizzes" element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <ManageQuizzes />
                </PrivateRoute>
              } />

              <Route path="/teacher/quizzes/create" element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <CreateQuiz />
                </PrivateRoute>
              } />

              <Route path="/teacher/results" element={
                <PrivateRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherResults />
                </PrivateRoute>
              } />

              <Route path="/admin" element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </PrivateRoute>
              } />
              
              <Route path="/student" element={
                <PrivateRoute allowedRoles={['student', 'admin']}>
                  <StudentDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/student/quiz/:quizId" element={
                <PrivateRoute allowedRoles={['student', 'admin']}>
                  <TakeQuiz />
                </PrivateRoute>
              } />
              
              <Route path="/student/results/:id" element={
                <PrivateRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <QuizResult />
                </PrivateRoute>
              } />
              
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
