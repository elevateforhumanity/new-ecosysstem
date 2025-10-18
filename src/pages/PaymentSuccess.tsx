import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

  useEffect(() => {
    // Verify payment and create enrollment
    if (sessionId) {
      // TODO: Call backend to verify session and create enrollment
      setTimeout(() => {
        setEnrollmentData({
          programName: 'Your Program',
          enrollmentId:
            'ENR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        });
        setLoading(false);
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <section className="section">
        <div className="container max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-slate-600">Confirming your enrollment...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Welcome to Elevate for Humanity!
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Your enrollment is confirmed. Let's get started on your new career
            path!
          </p>

          {enrollmentData && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-left">
              <div className="text-sm text-slate-500">Enrollment ID</div>
              <div className="font-mono font-semibold">
                {enrollmentData.enrollmentId}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Link
              to="/lms"
              className="btn w-full text-lg flex items-center justify-center gap-2"
            >
              Go to Your Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/programs" className="btn-outline w-full">
              Browse More Programs
            </Link>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-left">
            <div className="font-semibold text-blue-900 mb-2">What's Next?</div>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Check your email for enrollment confirmation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Access your courses in the LMS dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Connect with your instructor and classmates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Start learning and earning your certification</span>
              </li>
            </ul>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@elevateforhumanity.org"
              className="text-brand-600 hover:underline"
            >
              support@elevateforhumanity.org
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
