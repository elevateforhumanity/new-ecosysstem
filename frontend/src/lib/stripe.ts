/**
 * Stripe Integration Helpers
 * Create checkouts for enrollments, donations, and affiliate signups
 */

interface LineItem {
  price?: string; // Stripe Price ID
  amount?: number; // Amount in cents
  currency?: string;
  name?: string;
  quantity?: number;
}

interface CheckoutOptions {
  mode: 'payment' | 'subscription';
  lineItems: LineItem[];
  successUrl: string;
  cancelUrl: string;
  meta?: Record<string, string>;
}

/**
 * Create Stripe Checkout Session
 */
export async function createCheckout(options: CheckoutOptions): Promise<void> {
  try {
    const token = localStorage.getItem('supabase.auth.token');

    const response = await fetch('/api/agent/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Checkout creation failed');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}

/**
 * Create enrollment checkout
 */
export async function createEnrollmentCheckout(params: {
  userId: string;
  courseId: string;
  orgId?: string;
  amount: number; // in dollars
  courseName: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<void> {
  return createCheckout({
    mode: 'payment',
    lineItems: [
      {
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: 'usd',
        name: params.courseName,
        quantity: 1,
      },
    ],
    successUrl:
      params.successUrl || `${window.location.origin}/enrollment/success`,
    cancelUrl:
      params.cancelUrl || `${window.location.origin}/enrollment/cancel`,
    meta: {
      kind: 'enrollment',
      user_id: params.userId,
      course_id: params.courseId,
      ...(params.orgId && { org_id: params.orgId }),
    },
  });
}

/**
 * Create donation checkout
 */
export async function createDonationCheckout(params: {
  userId?: string;
  orgId?: string;
  amount: number; // in dollars
  successUrl?: string;
  cancelUrl?: string;
}): Promise<void> {
  return createCheckout({
    mode: 'payment',
    lineItems: [
      {
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: 'usd',
        name: 'Donation to Elevate for Humanity',
        quantity: 1,
      },
    ],
    successUrl: params.successUrl || `${window.location.origin}/donate/success`,
    cancelUrl: params.cancelUrl || `${window.location.origin}/donate/cancel`,
    meta: {
      kind: 'donation',
      ...(params.userId && { user_id: params.userId }),
      ...(params.orgId && { org_id: params.orgId }),
    },
  });
}

/**
 * Create affiliate signup checkout
 */
export async function createAffiliateCheckout(params: {
  userId: string;
  orgId?: string;
  tier: 'standard' | 'gold' | 'platinum';
  amount: number; // in dollars
  successUrl?: string;
  cancelUrl?: string;
}): Promise<void> {
  const tierNames = {
    standard: 'Standard Affiliate',
    gold: 'Gold Affiliate',
    platinum: 'Platinum Affiliate',
  };

  return createCheckout({
    mode: 'payment',
    lineItems: [
      {
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: 'usd',
        name: `${tierNames[params.tier]} Signup`,
        quantity: 1,
      },
    ],
    successUrl:
      params.successUrl || `${window.location.origin}/affiliate/success`,
    cancelUrl: params.cancelUrl || `${window.location.origin}/affiliate/cancel`,
    meta: {
      kind: 'affiliate_signup',
      user_id: params.userId,
      tier: params.tier,
      ...(params.orgId && { org_id: params.orgId }),
    },
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
