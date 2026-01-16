# RWA Insight - Testing Guide

## 🖥️ Local Development Testing

Your dev server is currently running at **http://localhost:3000**

### What You Should See:

1. **Console Logs (Press F12 to open DevTools)**
   ```
   [Luffa SDK] Module loaded. Environment check: {
     isLuffaEnv: false,
     wxjs_environment: undefined,
     hasWx: false,
     hasWeixinJSBridge: false
   }
   [Luffa SDK] Initialized, environment: undefined
   [RWA Insight] Running in browser mode
   [Luffa SDK] Running in browser mode, using mock wallet data
   ```

2. **App Interface**
   - Bottom navigation with 4 tabs: Market, Assets, Portfolio, Profile
   - Market tab shows RWA market overview
   - Connect Wallet button in Profile tab
   - No errors in console

3. **Mock Wallet Data**
   When you click "Connect Wallet" in browser:
   - Address: `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`
   - Nickname: `Luffa Explorer`
   - Balance: `$5,000`

## 📱 Luffa SuperBox Testing

### Step 1: Build for Production

```bash
cd "/Users/vivienna/Desktop/VibeCoding/RWA Insight"
npm run build
```

Expected output:
```
✓ built in 9.50s
dist/index.html                     2.28 kB
dist/css/index-[hash].css          6.90 kB
dist/js/react-vendor-[hash].js   139.62 kB
dist/js/ui-vendor-[hash].js      123.20 kB
dist/js/chart-vendor-[hash].js   366.72 kB
dist/js/index-[hash].js          204.15 kB
```

### Step 2: Create SuperBox Package

1. Create package directory:
```bash
mkdir superbox-package
cp -r dist/* superbox-package/
```

2. Create `superbox-package/app.json`:
```json
{
  "pages": ["index"],
  "window": {
    "navigationBarTitleText": "RWA Insight",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#ffffff",
    "navigationBarTextStyle": "black"
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "permission": {
    "scope.userInfo": {
      "desc": "Get your Luffa account information"
    },
    "scope.wallet": {
      "desc": "Connect to your Luffa wallet"
    }
  }
}
```

3. Add app icon (192x192px):
   - Place your app icon as `superbox-package/icon.png`

4. Create ZIP package:
```bash
cd superbox-package
zip -r ../rwa-insight-superbox.zip .
```

### Step 3: Deploy to Luffa

1. Open Luffa SuperBox Developer Console
2. Upload `rwa-insight-superbox.zip`
3. Submit for review
4. Test in Luffa app once approved

### Step 4: Test Wallet Connection in Luffa

Expected behavior:

1. **App Launch**
   - App opens in Luffa SuperBox container
   - Console shows: `[Luffa SDK] environment: miniprogram`

2. **Automatic Wallet Connection**
   - SDK detects Luffa environment
   - Wallet connection prompt appears automatically
   - User sees: "RWA Insight wants to connect to your wallet"

3. **User Approves**
   - User taps "Connect" in Luffa UI
   - Wallet data flows back to app
   - Profile page shows real user data:
     - Luffa wallet address
     - Luffa nickname
     - Luffa avatar
     - Wallet balance

4. **Console Logs**
   ```
   [Luffa SDK] Initialized, environment: miniprogram
   [RWA Insight] Connecting wallet in Luffa environment...
   [Luffa SDK] Wallet connected: { address: '0x...', ... }
   [RWA Insight] Wallet connected: 0xYourRealAddress
   ```

## 🔍 Debugging Checklist

### If wallet doesn't connect in Luffa:

1. **Check Console Logs**
   - Open Luffa Developer Tools (if available)
   - Look for `[Luffa SDK]` and `[RWA Insight]` logs
   - Check for error messages

2. **Verify Environment Detection**
   ```javascript
   console.log('isLuffaEnv:', LuffaSDK.isLuffaEnv());
   console.log('wxjs_environment:', window.__wxjs_environment);
   console.log('has wx:', typeof wx !== 'undefined');
   ```

3. **Check WeixinJSBridge**
   ```javascript
   console.log('WeixinJSBridge:', typeof WeixinJSBridge !== 'undefined');
   ```

4. **Verify SDK Ready State**
   - SDK should log "Initialized" before wallet connection
   - If not, WeixinJSBridgeReady event may not have fired

### Common Issues:

| Issue | Cause | Solution |
|-------|-------|----------|
| "SDK not ready" error | Called before WeixinJSBridgeReady | Use `LuffaSDK.ready()` wrapper |
| Wallet popup doesn't appear | Wrong environment detection | Check `app.json` configuration |
| Connection timeout | Network issues | Check `networkTimeout` in `app.json` |
| User data is null | Response parsing error | Check SDK success callback |

## 📊 Test Scenarios

### Scenario 1: First Time User
1. Open app in Luffa
2. Wallet connection prompt appears
3. User taps "Connect"
4. User data displays
5. User can browse RWA assets

### Scenario 2: Returning User
1. Open app in Luffa
2. Wallet connects automatically (cached)
3. User data loads instantly
4. Portfolio shows previous activity

### Scenario 3: Investment Flow
1. User connected
2. Browse RWA assets
3. Tap "Invest" on an asset
4. Enter amount
5. Confirm transaction
6. Luffa wallet popup appears
7. User approves transaction
8. Transaction hash returned
9. Success message shown

### Scenario 4: Share Feature
1. User views interesting RWA
2. Taps share button
3. Share dialog appears in Luffa
4. User shares to Luffa chat
5. Recipients can open shared content

## 🎨 Visual Testing

### Screenshots to Capture:

1. **Market Overview Tab**
   - [ ] Global market stats display correctly
   - [ ] Charts render properly
   - [ ] Numbers formatted correctly

2. **Assets Tab**
   - [ ] Asset list loads
   - [ ] Filters work (category, platform)
   - [ ] Sort options work
   - [ ] Asset details modal opens

3. **Portfolio Tab**
   - [ ] Shows "Connect Wallet" when disconnected
   - [ ] Shows holdings when connected
   - [ ] Displays balance correctly
   - [ ] Transaction history appears

4. **Profile Tab**
   - [ ] Shows connect button when disconnected
   - [ ] Shows user info when connected
   - [ ] Avatar displays (Luffa CID avatar)
   - [ ] Address shortened correctly
   - [ ] Settings accessible

## ✅ Sign-Off Checklist

Before submitting to Luffa:

- [ ] All console logs use appropriate prefixes
- [ ] No console errors in browser testing
- [ ] Wallet connection works in browser (mock)
- [ ] All tabs navigate correctly
- [ ] Investment flow works end-to-end
- [ ] Share info is set correctly
- [ ] App icon is included (192x192px)
- [ ] app.json is properly configured
- [ ] Build size is reasonable (<2MB)
- [ ] All assets load correctly

## 📞 Support Resources

If you encounter issues:

1. **Luffa Documentation**: https://luffa.im/SuperBox/docs/
2. **User Guide**: https://userguide.luffa.im
3. **GitHub Issues**: https://github.com/ViviennaMAO/rwa-insight-luffa/issues
4. **Development Logs**: Check browser DevTools console

## 🎉 Success Indicators

Your integration is successful when:

✅ SDK initializes without errors
✅ Environment is detected correctly
✅ Wallet connection prompt appears
✅ User data is retrieved and displayed
✅ Transactions can be signed and submitted
✅ Share functionality works
✅ No console errors or warnings

---

**Current Status**: Development server running ✓
**Latest Commit**: 3dc6d91 ✓
**Build Status**: Passing ✓
**Ready for Luffa Testing**: ✓

Good luck with testing! 🚀
