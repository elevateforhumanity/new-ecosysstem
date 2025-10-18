import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import { getUserCertificates } from '../services/certificates';

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    const user = await getCurrentUser();
    if (!user) return;

    const certs = await getUserCertificates(user.id);
    setCertificates(certs);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="section">
        <div className="container">Loading...</div>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <p className="mt-2 text-slate-600">
          Your earned certificates and credentials
        </p>

        <div className="mt-8 space-y-4">
          {certificates.map((cert: any) => (
            <div key={cert.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500">
                    {cert.courses?.code}
                  </div>
                  <h3 className="mt-1 text-xl font-semibold">
                    {cert.courses?.title}
                  </h3>
                  <div className="mt-2 text-sm text-slate-600">
                    Issued:{' '}
                    {new Date(cert.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 font-mono">
                    {cert.certificate_number}
                  </div>
                </div>
                <Link
                  to={`/certificate/${cert.id}`}
                  className="btn"
                  target="_blank"
                >
                  View Certificate
                </Link>
              </div>
            </div>
          ))}

          {certificates.length === 0 && (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold">No Certificates Yet</h3>
              <p className="mt-2 text-slate-600">
                Complete courses to earn certificates
              </p>
              <Link to="/lms/courses" className="btn mt-4">
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
