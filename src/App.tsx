import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import ProgramsGrid from './components/ProgramsGrid';
import Testimonials from './components/Testimonials';
import ProgramsIndex from './pages/ProgramsIndex';
import ProgramPage from './pages/ProgramPage';
import Dashboard from './pages/lms/Dashboard';
import CoursesIndex from './pages/lms/CoursesIndex';
import CoursePage from './pages/lms/CoursePage';
import LessonPage from './pages/lms/LessonPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import Account from './pages/auth/Account';
import ProtectedRoute from './components/auth/ProtectedRoute';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseEditor from './pages/instructor/CourseEditor';
import LessonManager from './pages/instructor/LessonManager';
import CertificatePage from './pages/CertificatePage';
import MyCertificates from './pages/MyCertificates';
import VerifyCertificate from './pages/VerifyCertificate';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';

function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ProgramsGrid />
      <section className="section">
        <div className="container">
          <div className="card p-8 md:p-10 bg-gradient-to-br from-brand-50 to-white border-2 border-brand-200">
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold">Ready to Change Your Life?</h3>
              <p className="mt-3 text-lg text-slate-700">
                Join over 1,200 people who've started new careers through our
                free training programs. No experience needed—we'll teach you
                everything.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/apply" className="btn text-lg px-6 py-3">
                  Apply Now (Takes 5 Minutes) →
                </a>
                <a href="/programs" className="btn-outline text-lg px-6 py-3">
                  Browse All Programs
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                💡 Questions? Call us at (317) 555-0100 or email
                hello@elevateforhumanity.org
              </p>
            </div>
          </div>
        </div>
      </section>
      <Testimonials />
    </>
  );
}

function SimplePage({ title }: { title: string }) {
  return (
    <section className="section">
      <div className="container">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-slate-600">Content coming online.</p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<ProgramsIndex />} />
          <Route path="/programs/:slug" element={<ProgramPage />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          {/* LMS Routes (Protected) */}
          <Route
            path="/lms"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/lms/courses" element={<CoursesIndex />} />
          <Route path="/lms/course/:courseId" element={<CoursePage />} />
          <Route
            path="/lms/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes (Protected - Instructor Role) */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute requireRole="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/course/:courseId/edit"
            element={
              <ProtectedRoute requireRole="instructor">
                <CourseEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/course/:courseId/lessons"
            element={
              <ProtectedRoute requireRole="instructor">
                <LessonManager />
              </ProtectedRoute>
            }
          />

          {/* Certificate Routes */}
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <MyCertificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificate/:certificateId"
            element={<CertificatePage />}
          />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:certNumber" element={<VerifyCertificate />} />

          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancelled" element={<PaymentCancelled />} />

          {/* Other Routes */}
          <Route path="/partners" element={<SimplePage title="Partners" />} />
          <Route path="/apply" element={<SimplePage title="Apply Now" />} />
          <Route path="*" element={<SimplePage title="Not Found" />} />
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  );
}
