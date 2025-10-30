// React import not required with the new JSX transform
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { AppLayout } from '@/components/shared/AppLayout';
import { Login } from '@/features/auth/Login';
import { JobsBoard } from '@/features/jobs/routes/JobsBoard';
import { JobDetail } from '@/features/jobs/routes/JobDetail';
import { CandidatesList } from '@/features/candidates/routes/CandidatesList';
import { CandidatesBoard } from '@/features/candidates/routes/CandidatesBoard';
import { CandidateProfile } from '@/features/candidates/components/CandidateProfile';
import { AssessmentPage } from '@/features/assessments/routes/AssessmentPage';
import { AssessmentsList } from '@/features/assessments/routes/AssessmentsList';
import { AssessmentAssignments } from '@/features/assessments/routes/AssessmentAssignments';
import { AssessmentAttempts } from '@/features/assessments/routes/AssessmentAttempts';
import { MainDashboard } from '@/features/dashboard/MainDashboard';

// Placeholder components for now - we'll create these next
const Dashboard = () => <MainDashboard />;


// const JobDetail = () => (
//   <div>
//     <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
//     <p className="text-gray-600">View and edit job information</p>
//   </div>
// );



export function AppRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/jobs" element={<JobsBoard />} />
                  <Route path="/jobs/:jobId" element={<JobDetail />} />
                  <Route path="/candidates" element={<CandidatesList />} />
                  <Route path="/candidates/board" element={<CandidatesBoard />} />
                  <Route path="/candidates/:id" element={<CandidateProfile />} />
                  <Route path="/assessments" element={<AssessmentsList />} />
                  <Route path="/assessments/:id/assignments" element={<AssessmentAssignments />} />
                  <Route path="/assessments/:id/attempts" element={<AssessmentAttempts />} />
                  <Route path="/assessments/:jobId" element={<AssessmentPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
