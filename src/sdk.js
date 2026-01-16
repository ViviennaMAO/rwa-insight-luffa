/**
 * Luffa SDK Wrapper for RWA Insight
 * Based on Luffa SuperBox Development Guide
 * https://luffa.im/SuperBox/docs/hk/jssdk/description.html
 * https://luffa.im/SuperBox/docs/hk/miniProDevelopmentGuide/Introduction.html
 */

// Generate a random 16-character string for API calls
const create16String = () => {
    const len = 16;
    const strVals = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    const maxLen = strVals.length;
    let randomStr = '';
    for (let i = 0; i < len; i++) {
        randomStr += strVals.charAt(Math.floor(Math.random() * maxLen));
    }
    return randomStr;
};

// Track if SDK is ready
let isSDKReady = false;
let readyCallbacks = [];

// Initialize SDK when WeixinJSBridge is ready
function initSDK() {
    if (!isSDKReady) {
        isSDKReady = true;
        console.log('[Luffa SDK] Initialized, environment:', typeof window !== 'undefined' ? window.__wxjs_environment : 'unknown');
        // Execute all pending callbacks
        readyCallbacks.forEach(callback => {
            try {
                callback();
            } catch (err) {
                console.error('[Luffa SDK] Error in ready callback:', err);
            }
        });
        readyCallbacks = [];
    }
}

// Wait for WeixinJSBridge to be ready (for Luffa mini-program environment)
if (typeof window !== 'undefined') {
    if (!window.WeixinJSBridge || !window.WeixinJSBridge.invoke) {
        if (typeof document !== 'undefined') {
            document.addEventListener('WeixinJSBridgeReady', initSDK, false);
        }
    } else {
        initSDK();
    }

    // Also initialize immediately if not in mini-program (for browser testing)
    setTimeout(() => {
        if (!isSDKReady && window.__wxjs_environment !== 'miniprogram') {
            initSDK();
        }
    }, 100);
}

export const LuffaSDK = {
    // Check if we're in Luffa mini-program environment
    isLuffaEnv: () => {
        if (typeof window === 'undefined') return false;

        // Check multiple indicators according to Luffa documentation
        return (
            window.__wxjs_environment === 'miniprogram' ||
            (typeof wx !== 'undefined' && wx.invokeNativePlugin) ||
            (window.navigator && window.navigator.userAgent.toLowerCase().includes('miniprogram'))
        );
    },

    // Wait for SDK to be ready (WeixinJSBridgeReady)
    ready: (callback) => {
        if (typeof callback !== 'function') {
            console.error('[Luffa SDK] ready() requires a callback function');
            return;
        }

        if (isSDKReady) {
            callback();
        } else {
            readyCallbacks.push(callback);
        }
    },

    /**
     * Connect wallet and get user info
     * Should be called after SDK is ready
     * Returns: address, avatar (base64), cid (Luffa CID avatar), nickname, uid (Luffa ID)
     */
    connectWallet: (options = {}) => {
        return new Promise((resolve, reject) => {
            if (typeof wx !== 'undefined' && wx.invokeNativePlugin) {
                const opts = {
                    api_name: 'luffaWebRequest',
                    data: {
                        uuid: create16String(),
                        methodName: 'connect',
                        initData: {
                            network: 'endless', // 'endless' for mainnet, 'ends' for testnet
                        },
                        metadata: {
                            superBox: true,
                            url: options.appUrl || 'https://rwa-insight-luffa.vercel.app',
                            icon: options.appIcon || 'https://rwa-insight-luffa.vercel.app/icon.png'
                        },
                        from: '',
                        data: {},
                    },
                    success: (res) => {
                        console.log('[Luffa SDK] Wallet connected:', res);
                        if (res && res.data) {
                            resolve({
                                address: res.data.address,
                                avatar: res.data.avatar, // hash avatar base64
                                cid: res.data.cid, // Luffa CID Avatar
                                nickname: res.data.nickname,
                                uid: res.data.uid, // Luffa ID
                                avatarFrame: res.data.avatar_frame
                            });
                        } else {
                            reject(new Error('Invalid response from wallet connect'));
                        }
                    },
                    fail: (err) => {
                        console.error('[Luffa SDK] Wallet connect failed:', err);
                        reject(err);
                    }
                };
                wx.invokeNativePlugin(opts);
            } else {
                // Mock for browser testing
                console.log('[Luffa SDK] Running in browser mode, using mock wallet data');
                setTimeout(() => {
                    resolve({
                        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                        avatar: null,
                        cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
                        nickname: 'Luffa Explorer',
                        uid: '1234567890',
                        avatarFrame: null
                    });
                }, 800);
            }
        });
    },

    /**
     * Get user info (legacy method - redirects to connectWallet)
     */
    getUserInfo: () => {
        return LuffaSDK.connectWallet();
    },

    /**
     * Package transaction for contract calls (V2)
     * Supports array parameters
     */
    packageTransaction: (params) => {
        return new Promise((resolve, reject) => {
            if (typeof wx !== 'undefined' && wx.invokeNativePlugin) {
                const opts = {
                    api_name: 'luffaWebRequest',
                    data: {
                        uuid: create16String(),
                        from: params.from,
                        methodName: 'packageTransactionV2',
                        initData: {
                            network: params.network || 'endless',
                        },
                        data: {
                            data: JSON.stringify({
                                payload: {
                                    function: params.contractFunction,
                                    functionArguments: params.functionArguments || [],
                                    typeArguments: params.typeArguments || [],
                                    typeEnum: params.typeEnum || []
                                },
                                secondarySignerAddresses: params.secondarySigners || [],
                                feePayer: params.feePayer || ''
                            })
                        },
                    },
                    success: (res) => {
                        if (res && res.data && res.data.rawData) {
                            resolve({ rawData: res.data.rawData });
                        } else {
                            reject(new Error('Failed to package transaction'));
                        }
                    },
                    fail: (err) => reject(err)
                };
                wx.invokeNativePlugin(opts);
            } else {
                // Mock for browser testing
                setTimeout(() => {
                    resolve({ rawData: 'mock_raw_data_' + create16String() });
                }, 500);
            }
        });
    },

    /**
     * Sign and submit transaction (wallet payment)
     */
    signAndSubmitTransaction: (params) => {
        return new Promise((resolve, reject) => {
            if (typeof wx !== 'undefined' && wx.invokeNativePlugin) {
                const opts = {
                    api_name: 'luffaWebRequest',
                    data: {
                        uuid: create16String(),
                        from: params.from,
                        methodName: 'signAndSubmitTransaction',
                        initData: {
                            network: params.network || 'endless',
                        },
                        data: {
                            serializedTransaction: {
                                data: params.serializedData,
                            },
                        },
                    },
                    success: (res) => {
                        if (res && res.data && res.data.hash) {
                            resolve({ hash: res.data.hash });
                        } else {
                            reject(new Error('Transaction failed'));
                        }
                    },
                    fail: (err) => reject(err)
                };
                wx.invokeNativePlugin(opts);
            } else {
                // Mock for browser testing
                setTimeout(() => {
                    resolve({ hash: '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2) });
                }, 1000);
            }
        });
    },

    /**
     * Simple transfer (EDS tokens)
     */
    transfer: async (params) => {
        const { from, to, amount } = params;

        // First package the transaction
        const packageResult = await LuffaSDK.packageTransaction({
            from,
            contractFunction: '0x1::endless_account::transfer',
            functionArguments: [to, String(amount * 100000000)], // Convert to smallest unit
            typeArguments: ['address', 'u128'],
            network: params.network || 'endless'
        });

        // Then sign and submit
        return LuffaSDK.signAndSubmitTransaction({
            from,
            serializedData: packageResult.rawData,
            network: params.network || 'endless'
        });
    },

    /**
     * Deposit to RWA contract
     */
    depositToRWA: async (params) => {
        const { from, contractAddress, amount, assetId } = params;

        // Package the deposit transaction
        const packageResult = await LuffaSDK.packageTransaction({
            from,
            contractFunction: `${contractAddress}::rwa_pool::deposit`,
            functionArguments: [assetId || '1', String(amount * 100000000)],
            typeArguments: ['String', 'u128'],
            network: params.network || 'endless'
        });

        // Sign and submit
        return LuffaSDK.signAndSubmitTransaction({
            from,
            serializedData: packageResult.rawData,
            network: params.network || 'endless'
        });
    },

    /**
     * Legacy send transaction method
     */
    sendTransaction: (tx) => {
        return new Promise((resolve, reject) => {
            if (typeof wx !== 'undefined' && wx.invokeNativePlugin) {
                wx.invokeNativePlugin({
                    api_name: 'sendTransaction',
                    data: tx,
                    success: (res) => resolve(res),
                    fail: (err) => reject(err)
                });
            } else {
                // Mock for browser testing
                setTimeout(() => {
                    console.log('[Luffa SDK] Transaction simulation:', tx);
                    resolve({ hash: '0x' + Math.random().toString(16).slice(2) });
                }, 800);
            }
        });
    },

    /**
     * Set share info for mini-program
     */
    setShareInfo: (info) => {
        if (typeof wx !== 'undefined' && wx.setShareInfo) {
            wx.setShareInfo({
                title: info.title || 'RWA Insight - Track Real World Assets',
                path: info.path || '/pages/index/index',
                imageUrl: info.imageUrl || '',
                success: () => console.log('[Luffa SDK] Share info set'),
                fail: (err) => console.error('[Luffa SDK] Set share info failed', err)
            });
        }
    },

    /**
     * Navigate back in mini-program
     */
    close: () => {
        if (typeof wx !== 'undefined' && wx.miniProgram) {
            wx.miniProgram.navigateBack();
        } else {
            console.log('[Luffa SDK] close() called but not in mini-program environment');
        }
    },

    /**
     * Get Luffa language setting
     */
    getLanguage: () => {
        return new Promise((resolve) => {
            if (typeof wx !== 'undefined' && wx.invokeNativePlugin) {
                wx.invokeNativePlugin({
                    api_name: 'luffaWebRequest',
                    data: {
                        methodName: 'getLanguage'
                    },
                    success: (res) => resolve(res.data?.language || 'en'),
                    fail: () => resolve('en')
                });
            } else {
                resolve(typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) || 'en' : 'en');
            }
        });
    },

    /**
     * Open chat with user or group
     */
    openChat: (params) => {
        if (typeof wx !== 'undefined' && wx.invokeNativePlugin) {
            wx.invokeNativePlugin({
                api_name: 'luffaWebRequest',
                data: {
                    methodName: params.isGroup ? 'openGroupChat' : 'openUserChat',
                    data: {
                        id: params.id
                    }
                },
                success: () => console.log('[Luffa SDK] Chat opened'),
                fail: (err) => console.error('[Luffa SDK] Failed to open chat', err)
            });
        }
    }
};

// Log SDK status on load
if (typeof window !== 'undefined') {
    console.log('[Luffa SDK] Module loaded. Environment check:', {
        isLuffaEnv: LuffaSDK.isLuffaEnv(),
        wxjs_environment: window.__wxjs_environment,
        hasWx: typeof wx !== 'undefined',
        hasWeixinJSBridge: typeof window.WeixinJSBridge !== 'undefined'
    });
}
