/**
 * RWA Insight Configuration
 */

// Deployment URL - UPDATE THIS to match your actual deployment
export const APP_CONFIG = {
  // Your actual Vercel deployment URL
  appUrl: 'https://rwa-insight-luffa.vercel.app',

  // App icon URL (should be accessible from this URL)
  appIcon: 'https://rwa-insight-luffa.vercel.app/icon.png',

  // App name
  appName: 'RWA Insight',

  // Network (endless for mainnet, ends for testnet)
  network: 'endless',
};

// For development, you can override with localhost
if (import.meta.env.DEV) {
  console.log('[Config] Running in development mode');
}
