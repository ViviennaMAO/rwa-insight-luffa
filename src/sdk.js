/**
 * Luffa SDK Wrapper for RWA Insight
 * Based on Luffa SuperBox Development Guide
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

export const LuffaSDK = {
    // Check if we're in Luffa mini-program environment
    isLuffaEnv: () => {
        return typeof wx !== 'undefined' && wx.invokeNativePlugin;
    },

    /**
     * Connect wallet and get user info
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
                            url: options.appUrl || 'https://rwa-insight.luffa.im',
                            icon: options.appIcon || 'https://rwa-insight.luffa.im/icon.png'
                        },
                        from: '',
                        data: {},
                    },
                    success: (res) => {
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
                    fail: (err) => reject(err)
                };
                wx.invokeNativePlugin(opts);
            } else {
                // Mock for browser testing
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
                    console.log('Transaction simulation:', tx);
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
                success: () => console.log('Share info set'),
                fail: (err) => console.error('Set share info failed', err)
            });
        }
    },

    /**
     * Navigate back in mini-program
     */
    close: () => {
        if (typeof wx !== 'undefined' && wx.miniProgram) {
            wx.miniProgram.navigateBack();
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
                resolve(navigator.language?.slice(0, 2) || 'en');
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
                success: () => console.log('Chat opened'),
                fail: (err) => console.error('Failed to open chat', err)
            });
        }
    }
};
