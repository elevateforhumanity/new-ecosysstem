/**
 * Create Cloudflare API Token with required permissions
 * 
 * This action uses the existing API token to create a new token with full permissions
 * for Workers, KV, R2, and Workers AI.
 */

export async function createCloudflareToken(supabase: any, params: any) {
  const { accountId, existingToken, tokenName } = params;
  
  if (!accountId || !existingToken) {
    throw new Error('accountId and existingToken are required');
  }
  
  const name = tokenName || `EFH Deployment Token - ${new Date().toISOString().split('T')[0]}`;
  
  // Define the token with all required permissions
  const tokenPayload = {
    name,
    policies: [
      {
        effect: 'allow',
        resources: {
          [`com.cloudflare.api.account.${accountId}`]: '*'
        },
        permission_groups: [
          {
            id: 'c8fed203ed3043cba015a93ad1616f1f', // Workers Scripts: Edit
            name: 'Workers Scripts Write'
          },
          {
            id: 'f7f0eda5697f475c90846e879bab8666', // Workers KV Storage: Edit
            name: 'Workers KV Storage Write'
          },
          {
            id: 'e086da7e2179491d91ee5f35b3ca210a', // Workers R2 Storage: Edit
            name: 'Workers R2 Storage Write'
          },
          {
            id: '4755a26eedb94da69e1066d98aa820be', // Workers AI: Read
            name: 'Workers AI Read'
          },
          {
            id: '82e64a83756745bbbb1c9c2701bf816b', // Account Settings: Read
            name: 'Account Settings Read'
          }
        ]
      }
    ]
  };
  
  // Create the token via Cloudflare API
  const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${existingToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tokenPayload),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Cloudflare token: ${error}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Cloudflare API error: ${JSON.stringify(result.errors)}`);
  }
  
  // Store the token securely in Supabase
  const { data: tokenRecord, error: dbError } = await supabase
    .from('api_tokens')
    .insert({
      service: 'cloudflare',
      token_name: name,
      token_value: result.result.value, // The actual token value
      token_id: result.result.id,
      permissions: tokenPayload.policies,
      account_id: accountId,
      created_at: new Date().toISOString(),
      expires_at: null, // Cloudflare tokens don't expire by default
    })
    .select()
    .single();
  
  if (dbError) {
    console.error('Failed to store token in database:', dbError);
    // Don't throw - token was created successfully
  }
  
  return {
    success: true,
    token: result.result.value,
    tokenId: result.result.id,
    tokenName: name,
    permissions: [
      'Workers Scripts: Edit',
      'Workers KV Storage: Edit',
      'Workers R2 Storage: Edit',
      'Workers AI: Read',
      'Account Settings: Read'
    ],
    message: 'API token created successfully with full deployment permissions',
    storedInDb: !dbError,
  };
}
