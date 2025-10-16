import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

// Initialize Stripe (use your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function EnrollmentCheckout({ program, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const response = await fetch('/api/create-enrollment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          programId: program.id,
          programName: program.title,
          price: program.price || 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId
      });

      if (stripeError) {
        throw stripeError;
      }

    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err.message || 'Failed to process enrollment');
      setLoading(false);
    }
  };

  const isFree = !program.price || program.price === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      {/* Program Info */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {program.title}
        </h3>
        <p className="text-gray-600 mb-4">
          {program.description}
        </p>
        
        {/* Program Details */}
        <div className="space-y-2 text-sm">
          {program.duration && (
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold">{program.duration}</span>
            </div>
          )}
          {program.format && (
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <span className="font-semibold">{program.format}</span>
            </div>
          )}
          {program.certification && (
            <div className="flex justify-between">
              <span className="text-gray-600">Certification:</span>
              <span className="font-semibold">{program.certification}</span>
            </div>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Total:</span>
          <span className="text-3xl font-bold text-blue-600">
            {isFree ? 'FREE' : `$${program.price}`}
          </span>
        </div>
        {isFree && (
          <p className="text-sm text-gray-600 mt-2">
            100% FREE through WIOA funding
          </p>
        )}
      </div>

      {/* Features */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Lifetime access to course materials</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Industry-recognized certification</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Job placement assistance</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Instructor support</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              {isFree ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Enroll Now - FREE</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Payment</span>
                </>
              )}
            </>
          )}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Security Badge */}
      {!isFree && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Secure payment powered by Stripe</span>
        </div>
      )}
    </div>
  );
}
