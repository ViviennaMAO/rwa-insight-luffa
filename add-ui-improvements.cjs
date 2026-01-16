const fs = require('fs');
const path = require('path');

const APP_JSX_PATH = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(APP_JSX_PATH, 'utf8');

console.log('Adding UI improvements for wallet data...\n');

// 1. Add last updated state
const addressCopiedState = 'const [addressCopied, setAddressCopied] = useState(false);';
const lastUpdatedState = '  const [lastUpdated, setLastUpdated] = useState(null);';

if (!content.includes('const [lastUpdated')) {
  content = content.replace(
    addressCopiedState,
    `${addressCopiedState}\n${lastUpdatedState}`
  );
  console.log('✓ Added lastUpdated state');
}

// 2. Update refreshWalletData to set lastUpdated
const refreshFunctionOld = `      setTransactions(walletData.transactions);
      console.log('[RWA Insight] Wallet data refreshed');`;

const refreshFunctionNew = `      setTransactions(walletData.transactions);
      setLastUpdated(Date.now());
      console.log('[RWA Insight] Wallet data refreshed');`;

if (content.includes('Wallet data refreshed')) {
  content = content.replace(refreshFunctionOld, refreshFunctionNew);
  console.log('✓ Updated handleRefreshWallet to set lastUpdated');
}

// 3. Also update initial wallet load
const initialLoadOld = `              setTransactions(walletData.transactions);
              console.log('[RWA Insight] Wallet data loaded:', walletData);`;

const initialLoadNew = `              setTransactions(walletData.transactions);
              setLastUpdated(Date.now());
              console.log('[RWA Insight] Wallet data loaded:', walletData);`;

if (content.includes('Wallet data loaded')) {
  content = content.replace(initialLoadOld, initialLoadNew);
  console.log('✓ Updated initial wallet load to set lastUpdated');
}

fs.writeFileSync(APP_JSX_PATH, content, 'utf8');

console.log('\n✅ UI improvements added!');
console.log('\nNext: You need to add the UI elements manually in the Portfolio and Profile pages');
console.log('- Add a refresh button with RefreshCw icon');
console.log('- Show loading spinner when isLoadingWallet is true');
console.log('- Display lastUpdated time');
