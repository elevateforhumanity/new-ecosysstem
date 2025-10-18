import { useState } from 'react';
import { verifyCertificate } from '../services/certificates';

export default function VerifyCertificate() {
  const [certNumber, setCertNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    const cert = await verifyCertificate(certNumber);
    setResult(cert);
    setLoading(false);
  }

  return (
    <section className="section">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold text-center">Verify Certificate</h1>
        <p className="mt-2 text-center text-slate-600">
          Enter a certificate number to verify authenticity
        </p>

        <form onSubmit={handleVerify} className="mt-8 card p-6">
          <label className="block text-sm font-medium mb-2">
            Certificate Number
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300 font-mono"
              placeholder="EFH-1234567890-ABCDEF"
              required
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        {searched && (
          <div className="mt-6">
            {result ? (
              <div className="card p-6 border-2 border-green-500">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✅</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-green-700">
                      Valid Certificate
                    </h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Course:</span>{' '}
                        {result.courses?.title}
                      </div>
                      <div>
                        <span className="font-medium">Student:</span>{' '}
                        {result.profiles?.email}
                      </div>
                      <div>
                        <span className="font-medium">Issued:</span>{' '}
                        {new Date(result.issued_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Certificate #:</span>{' '}
                        <span className="font-mono">
                          {result.certificate_number}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-6 border-2 border-red-500">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">❌</div>
                  <div>
                    <h3 className="text-xl font-semibold text-red-700">
                      Invalid Certificate
                    </h3>
                    <p className="mt-2 text-slate-600">
                      This certificate number was not found in our system. It
                      may be invalid, expired, or revoked.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
