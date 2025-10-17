import { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Receipt,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function Pay() {
  const params = useParams();
  const [selectedProgram, setSelectedProgram] = useState(null);

  const programs = [
    {
      id: 'ai-fundamentals',
      title: 'AI Fundamentals & Machine Learning',
      price: 1997,
      partnerAmount: 998.5,
      businessAmount: 998.5,
      installments: [
        { amount: 499.25, due: 'Upon enrollment' },
        { amount: 499.25, due: 'Week 4' },
        { amount: 499.25, due: 'Week 8' },
        { amount: 499.25, due: 'Week 12' },
      ],
      fundingOptions: [
        'WIOA Adult',
        'WIOA Dislocated Worker',
        'State Rapid Response',
      ],
      discountAvailable: true,
    },
    {
      id: 'data-science-bootcamp',
      title: 'Data Science & Analytics Bootcamp',
      price: 4950,
      partnerAmount: 2475,
      businessAmount: 2475,
      installments: [
        { amount: 1237.5, due: 'Upon enrollment' },
        { amount: 1237.5, due: 'Week 5' },
        { amount: 1237.5, due: 'Week 10' },
        { amount: 1237.5, due: 'Week 15' },
      ],
      fundingOptions: ['WIOA Adult', 'WIOA Youth', 'Wagner-Peyser'],
      discountAvailable: false,
    },
    {
      id: 'cybersecurity-specialist',
      title: 'Cybersecurity Specialist Certification',
      price: 3495,
      partnerAmount: 1747.5,
      businessAmount: 1747.5,
      installments: [
        { amount: 873.75, due: 'Upon enrollment' },
        { amount: 873.75, due: 'Week 6' },
        { amount: 873.75, due: 'Week 12' },
        { amount: 873.75, due: 'Week 18' },
      ],
      fundingOptions: [
        'WIOA Adult',
        'WIOA Dislocated Worker',
        'Trade Adjustment',
      ],
      discountAvailable: true,
    },
  ];

  const paymentHistory = [
    {
      id: 'pay_1234567890',
      program: 'AI Fundamentals & Machine Learning',
      amount: 499.25,
      status: 'completed',
      date: '2024-01-15',
      method: 'Stripe',
      type: 'installment',
    },
    {
      id: 'pay_1234567891',
      program: 'AI Fundamentals & Machine Learning',
      amount: 499.25,
      status: 'completed',
      date: '2024-02-01',
      method: 'Stripe',
      type: 'installment',
    },
    {
      id: 'pay_1234567892',
      program: 'AI Fundamentals & Machine Learning',
      amount: 499.25,
      status: 'pending',
      date: '2024-02-15',
      method: 'Stripe',
      type: 'installment',
    },
  ];

  const fundingApplications = [
    {
      id: 'fund_001',
      program: 'AI Fundamentals & Machine Learning',
      fundingSource: 'WIOA Adult',
      status: 'approved',
      approvedAmount: 1997,
      applicationDate: '2024-01-01',
      approvalDate: '2024-01-10',
    },
    {
      id: 'fund_002',
      program: 'Data Science Bootcamp',
      fundingSource: 'WIOA Dislocated Worker',
      status: 'pending',
      requestedAmount: 4950,
      applicationDate: '2024-02-01',
    },
  ];

  const coupons = [
    {
      code: 'WORKFORCE25',
      type: 'percent',
      value: 25,
      description: '25% off any workforce program',
      expires: '2024-12-31',
      active: true,
    },
    {
      code: 'EARLYBIRD500',
      type: 'amount',
      value: 500,
      description: '$500 off programs over $2000',
      expires: '2024-03-31',
      active: true,
    },
  ];

  const renderPaymentForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-brand-text mb-6">
        Complete Your Enrollment Payment
      </h2>

      {/* Program Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-brand-text mb-2">
          Select Program
        </label>
        <select
          onChange={(e) =>
            setSelectedProgram(programs.find((p) => p.id === e.target.value))
          }
          className="w-full border border-brand-border-dark rounded-lg px-3 py-2"
        >
          <option value="">Choose a program...</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.title} - ${program.price.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {selectedProgram && (
        <div className="space-y-6">
          {/* Program Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              {selectedProgram.title}
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-brand-info">Total Cost:</span>
                <span className="font-medium ml-2">
                  ${selectedProgram.price.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-brand-info">Revenue Split:</span>
                <span className="font-medium ml-2">50/50 Partner Model</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div>
            <h4 className="font-medium text-brand-text mb-3">
              Payment Options
            </h4>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-4 border border-brand-border rounded-lg cursor-pointer hover:bg-brand-surface">
                <input
                  type="radio"
                  name="payment_option"
                  value="full"
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-brand-text">Pay in Full</div>
                  <div className="text-sm text-brand-text-muted">
                    ${selectedProgram.price.toLocaleString()} - Save 5% with
                    full payment
                  </div>
                  <div className="text-sm text-brand-success font-medium">
                    Final Amount: $
                    {(selectedProgram.price * 0.95).toLocaleString()}
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-4 border border-brand-border rounded-lg cursor-pointer hover:bg-brand-surface">
                <input
                  type="radio"
                  name="payment_option"
                  value="installments"
                  className="mt-1"
                  defaultChecked
                />
                <div className="flex-1">
                  <div className="font-medium text-brand-text">
                    4 Installments
                  </div>
                  <div className="text-sm text-brand-text-muted">
                    ${(selectedProgram.price / 4).toLocaleString()} per
                    installment
                  </div>
                  <div className="text-xs text-brand-text-light mt-1">
                    {selectedProgram.installments.map((installment, index) => (
                      <div key={index}>
                        ${installment.amount.toLocaleString()} -{' '}
                        {installment.due}
                      </div>
                    ))}
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-4 border border-green-200 rounded-lg cursor-pointer hover:bg-green-50 bg-green-25">
                <input
                  type="radio"
                  name="payment_option"
                  value="bnpl"
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-brand-text flex items-center">
                    Buy Now, Pay Later
                    <span className="ml-2 bg-brand-surface text-brand-success text-xs px-2 py-1 rounded">
                      Popular
                    </span>
                  </div>
                  <div className="text-sm text-brand-text-muted">
                    Flexible monthly payments with low interest rates
                  </div>
                  <div className="text-xs text-brand-success mt-1 space-y-1">
                    <div>• 3, 6, or 12 month options available</div>
                    <div>• Interest rates from 5-12%</div>
                    <div>• No hidden fees or penalties</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Federal Funding */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">
              🏛️ Federal Funding Available
            </h4>
            <p className="text-sm text-green-700 mb-3">
              This program is eligible for federal Elevate Learn2Earn Workforce
              funding:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedProgram.fundingOptions.map((option, index) => (
                <span
                  key={index}
                  className="bg-brand-surface text-brand-success text-xs px-2 py-1 rounded"
                >
                  {option}
                </span>
              ))}
            </div>
            <Link
              href="/compliance/eligibility-verification"
              className="text-brand-success hover:text-green-700 text-sm font-medium mt-2 inline-block"
            >
              Apply for Federal Funding →
            </Link>
          </div>

          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">
              Coupon Code (Optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                className="flex-1 border border-brand-border-dark rounded-lg px-3 py-2"
              />
              <button className="bg-brand-info text-white px-4 py-2 rounded-lg hover:bg-brand-info-hover transition-colors">
                Apply
              </button>
            </div>
            <div className="mt-2 text-sm text-brand-text-light">
              Available codes: WORKFORCE25 (25% off), EARLYBIRD500 ($500 off)
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="font-medium text-brand-text mb-3">Payment Method</h4>
            <div className="border border-brand-border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-brand-text-muted">
                  Secure payment powered by Stripe
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full border border-brand-border-dark rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full border border-brand-border-dark rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full border border-brand-border-dark rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    placeholder="12345"
                    className="w-full border border-brand-border-dark rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-3">
            <button
              id="standardCheckout"
              className="w-full bg-brand-info text-white py-3 px-6 rounded-lg hover:bg-brand-info-hover transition-colors font-medium"
            >
              Complete Payment - ${(selectedProgram.price / 4).toLocaleString()}
            </button>

            <button
              id="bnplCheckout"
              className="hidden w-full bg-brand-success text-white py-3 px-6 rounded-lg hover:bg-brand-success-hover transition-colors font-medium"
              onClick={() => (window.location.href = '/bnpl-frontend.html')}
            >
              Choose Buy Now, Pay Later Plan
            </button>
          </div>

          <script>
            {`
              document.addEventListener('DOMContentLoaded', function() {
                const paymentOptions = document.querySelectorAll('input[name="payment_option"]');
                const standardBtn = document.getElementById('standardCheckout');
                const bnplBtn = document.getElementById('bnplCheckout');
                
                paymentOptions.forEach(option => {
                  option.addEventListener('change', function() {
                    if (this.value === 'bnpl') {
                      standardBtn.classList.add('hidden');
                      bnplBtn.classList.remove('hidden');
                    } else {
                      standardBtn.classList.remove('hidden');
                      bnplBtn.classList.add('hidden');
                    }
                  });
                });
              });
            `}
          </script>
        </div>
      )}
    </div>
  );

  const renderPaymentHistory = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-brand-text">Payment History</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-brand-surface">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentHistory.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-brand-text">
                    {payment.program}
                  </div>
                  <div className="text-sm text-brand-text-light">
                    {payment.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-brand-text">
                    ${payment.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-light">
                  {new Date(payment.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'completed'
                        ? 'bg-brand-surface text-brand-success'
                        : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-brand-surface text-red-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-brand-info hover:text-blue-900">
                    <Receipt className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFundingStatus = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-brand-text">
          Federal Funding Applications
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {fundingApplications.map((application) => (
            <div
              key={application.id}
              className="border border-brand-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-brand-text">
                    {application.program}
                  </h3>
                  <p className="text-sm text-brand-text-muted">
                    Funding Source: {application.fundingSource}
                  </p>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className="text-sm text-brand-text-light">
                      Applied:{' '}
                      {new Date(
                        application.applicationDate
                      ).toLocaleDateString()}
                    </span>
                    {application.approvalDate && (
                      <span className="text-sm text-brand-text-light">
                        Approved:{' '}
                        {new Date(
                          application.approvalDate
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      application.status === 'approved'
                        ? 'bg-brand-surface text-brand-success'
                        : application.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-brand-surface text-red-800'
                    }`}
                  >
                    {application.status}
                  </span>
                  <div className="text-sm text-brand-text mt-1">
                    $
                    {(
                      application.approvedAmount || application.requestedAmount
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/compliance/eligibility-verification"
            className="bg-brand-success text-white px-6 py-3 rounded-lg hover:bg-brand-success-hover transition-colors"
          >
            Apply for New Funding
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-text">
                Payment Portal
              </h1>
              <p className="text-brand-text-muted mt-1">
                Secure payments with 50/50 revenue sharing and federal funding
                support
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-brand-surface text-brand-info px-3 py-1 rounded-full text-sm">
                🔒 Stripe Secured
              </div>
              <div className="bg-brand-surface text-brand-success px-3 py-1 rounded-full text-sm">
                💰 Federal Funding
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Payment Form */}
          <div className="lg:col-span-2">{renderPaymentForm()}</div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revenue Split Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-brand-text mb-4">
                50/50 Revenue Model
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Partner Share</span>
                  <span className="font-medium">50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Business Share</span>
                  <span className="font-medium">50%</span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-brand-text-muted">
                    Fair revenue distribution supporting sustainable Elevate
                    Learn2Earn Workforce partnerships.
                  </p>
                </div>
              </div>
            </div>

            {/* Available Coupons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-brand-text mb-4">
                Available Discounts
              </h3>
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="border border-brand-border rounded p-3"
                  >
                    <div className="font-medium text-brand-text">
                      {coupon.code}
                    </div>
                    <div className="text-sm text-brand-text-muted">
                      {coupon.description}
                    </div>
                    <div className="text-xs text-brand-text-light mt-1">
                      Expires: {new Date(coupon.expires).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Federal Funding */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-900 mb-2">
                🏛️ Federal Funding Available
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Most programs qualify for federal Elevate Learn2Earn Workforce
                funding through WIOA and other programs.
              </p>
              <Link
                href="/compliance"
                className="bg-brand-success text-white px-4 py-2 rounded-lg hover:bg-brand-success-hover transition-colors text-sm"
              >
                Check Eligibility
              </Link>
            </div>

            {/* Support */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-brand-text mb-4">
                Payment Support
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-brand-text-muted">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Secure Stripe processing
                </div>
                <div className="flex items-center text-brand-text-muted">
                  <FileText className="h-4 w-4 mr-2" />
                  Instant receipts & invoices
                </div>
                <div className="flex items-center text-brand-text-muted">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Flexible payment plans
                </div>
              </div>
              <button className="w-full mt-4 bg-brand-surface-dark text-brand-text py-2 rounded-lg hover:bg-brand-border transition-colors text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Payment History & Funding Status */}
        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          {renderPaymentHistory()}
          {renderFundingStatus()}
        </div>
      </div>
    </div>
  );
}
