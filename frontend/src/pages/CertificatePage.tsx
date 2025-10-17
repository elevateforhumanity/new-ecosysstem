import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Certificate {
  id: string;
  certificateId: string;
  course: {
    title: string;
    instructor: {
      name: string;
    };
  };
  user: {
    name: string;
  };
  issuedAt: string;
  pdfUrl?: string;
}

const CertificatePage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      const response = await api.get(`/certificates/${certificateId}`);
      setCertificate(response.data);
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (certificate?.pdfUrl) {
      window.open(certificate.pdfUrl, '_blank');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Certificate link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Certificate not found</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Dashboard
          </button>
          <div className="flex gap-4">
            <button onClick={handleShare} className="btn-secondary">
              Share
            </button>
            <button onClick={handleDownload} className="btn-primary">
              Download PDF
            </button>
          </div>
        </div>

        {/* Certificate Display */}
        <div className="bg-white rounded-lg shadow-2xl p-12 border-8 border-yellow-400">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold text-gray-900">
              Certificate of Completion
            </h1>

            {/* Divider */}
            <div className="w-32 h-1 bg-primary-600 mx-auto"></div>

            {/* Content */}
            <div className="space-y-4 py-8">
              <p className="text-lg text-gray-600">This certifies that</p>
              <p className="text-3xl font-bold text-gray-900">
                {certificate.user.name}
              </p>
              <p className="text-lg text-gray-600">
                has successfully completed
              </p>
              <p className="text-2xl font-semibold text-primary-600">
                {certificate.course.title}
              </p>
              <p className="text-gray-600">
                Instructed by {certificate.course.instructor.name}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <p className="text-sm text-gray-600">Date of Completion</p>
                  <p className="font-semibold">
                    {new Date(certificate.issuedAt).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Certificate ID</p>
                  <p className="font-mono text-xs">
                    {certificate.certificateId}
                  </p>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="pt-8">
              <div className="inline-block">
                <div className="border-t-2 border-gray-400 pt-2">
                  <p className="font-semibold">Elevate for Humanity</p>
                  <p className="text-sm text-gray-600">Learning Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Verify this certificate at:</p>
          <p className="font-mono text-primary-600">{window.location.href}</p>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
