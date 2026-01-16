# Wallet Initialization Update Instructions

## Changes Made to SDK (src/sdk.js)

### Added Features:
1. **WeixinJSBridgeReady Event Handling** - Properly waits for Luffa environment to be ready
2. **SDK Ready Callback System** - `LuffaSDK.ready(callback)` method
3. **Enhanced Environment Detection** - Checks multiple indicators:
   - `window.__wxjs_environment === 'miniprogram'`
   - `typeof wx !== 'undefined' && wx.invokeNativePlugin`
   - `navigator.userAgent.includes('miniProgram')`
4. **Better Logging** - Added console logs with `[Luffa SDK]` prefix for debugging

### New Initialization Pattern:

```javascript
// Old way (may fail if SDK not ready):
useEffect(() => {
  const initWallet = async () => {
    if (LuffaSDK.isLuffaEnv()) {
      const data = await LuffaSDK.connectWallet();
      setUserData(data);
    }
  };
  initWallet();
}, []);

// New way (waits for SDK to be ready):
useEffect(() => {
  const initWallet = async () => {
    // Wait for SDK to be ready first
    LuffaSDK.ready(async () => {
      try {
        if (LuffaSDK.isLuffaEnv()) {
          console.log('[RWA Insight] Connecting wallet in Luffa environment...');
          const data = await LuffaSDK.connectWallet({
            appUrl: 'https://rwa-insight.luffa.im',
            appIcon: 'https://rwa-insight.luffa.im/icon.png'
          });
          setUserData(data);
          setIsWalletConnected(true);
          setWalletBalance(5000);
          console.log('[RWA Insight] Wallet connected:', data.address);
        } else {
          console.log('[RWA Insight] Running in browser mode');
          setIsWalletConnected(false);
        }
      } catch (err) {
        console.error('[RWA Insight] Wallet init failed:', err);
        setIsWalletConnected(false);
      }
    });
  };
  initWallet();
}, []);
```

## Recommended Update for App.jsx

Replace lines 272-293 in `src/App.jsx` with the improved version above.

## Testing

### In Browser (Development):
- SDK will initialize immediately (no WeixinJSBridge needed)
- Mock wallet data will be used
- Console will show: `[Luffa SDK] Running in browser mode, using mock wallet data`

### In Luffa SuperBox:
- SDK will wait for `WeixinJSBridgeReady` event
- Real wallet connection will be established
- Console will show environment details and connection status

## Additional Improvements

### 1. Manual Connect Button Handler
```javascript
const handleConnectWallet = async () => {
  setIsConnecting(true);
  try {
    const data = await LuffaSDK.connectWallet({
      appUrl: 'https://rwa-insight.luffa.im',
      appIcon: 'https://rwa-insight.luffa.im/icon.png'
    });
    setUserData(data);
    setIsWalletConnected(true);
    setWalletBalance(5000);
  } catch (err) {
    console.error('Wallet connect failed:', err);
  } finally {
    setIsConnecting(false);
  }
};
```

### 2. Share Integration
```javascript
// Call this after user performs an action you want to share
LuffaSDK.setShareInfo({
  title: 'Check out this RWA investment opportunity!',
  path: '/pages/index/index',
  imageUrl: 'https://rwa-insight.luffa.im/share-image.png'
});
```

### 3. Language Detection
```javascript
useEffect(() => {
  LuffaSDK.getLanguage().then(lang => {
    console.log('User language:', lang);
    // Set app language based on user preference
  });
}, []);
```

## Benefits

✅ Proper SDK initialization following Luffa documentation
✅ Works in both browser (dev) and mini-program (production) environments
✅ Better error handling and logging
✅ Prevents race conditions from calling SDK before it's ready
✅ Compatible with all existing SDK methods

## Files Modified

- `src/sdk.js` - Replaced with improved version
- `src/sdk.backup.js` - Created as backup of original
