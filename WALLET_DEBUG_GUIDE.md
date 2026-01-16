# Luffa钱包连接调试指南

## 问题：钱包没有被调用

### 已修复的问题
✅ 更新了appUrl和appIcon从 `https://rwa-insight.luffa.im` 到 `https://rwa-insight-luffa.vercel.app`
✅ 创建了配置文件 `src/config.js` 统一管理URL
✅ SDK默认URL已更新

### 调试步骤

#### 步骤1：检查环境检测

在Luffa App中打开小程序，查看控制台（如果可以访问）或添加调试信息：

```javascript
// SDK应该输出这些日志
[Luffa SDK] Module loaded. Environment check: {
  isLuffaEnv: true,  // 应该是 true
  wxjs_environment: 'miniprogram',  // 应该是 'miniprogram'
  hasWx: true,  // 应该是 true
  hasWeixinJSBridge: true  // 应该是 true
}

[Luffa SDK] Initialized, environment: miniprogram
[RWA Insight] Connecting wallet in Luffa environment...
```

#### 步骤2：确认SDK调用

钱包连接代码在 `src/App.jsx:272-302`：

```javascript
useEffect(() => {
  const initWallet = async () => {
    LuffaSDK.ready(async () => {
      if (LuffaSDK.isLuffaEnv()) {
        console.log('[RWA Insight] Connecting wallet...');
        const data = await LuffaSDK.connectWallet({
          appUrl: APP_CONFIG.appUrl,
          appIcon: APP_CONFIG.appIcon
        });
        // ...
      }
    });
  };
  initWallet();
}, []);
```

#### 步骤3：检查可能的问题

**问题1：环境检测失败**

如果 `isLuffaEnv()` 返回 `false`，钱包不会被调用。

**检查：**
- 是否在Luffa App中打开？（不是浏览器）
- `window.__wxjs_environment` 是否等于 `'miniprogram'`？
- `wx` 对象是否存在？

**解决：**确保在Luffa App中打开，不是在浏览器中

---

**问题2：WeixinJSBridge未准备好**

SDK可能在WeixinJSBridge准备好之前就初始化了。

**检查：**查看是否有 `[Luffa SDK] Initialized` 日志

**解决：**已经实现了 `WeixinJSBridgeReady` 监听，应该没问题

---

**问题3：wx.invokeNativePlugin失败**

插件调用可能失败但没有错误信息。

**检查：**查看控制台是否有错误日志

---

**问题4：URL配置问题**

Luffa可能要求特定的URL格式。

**检查当前配置：**
- appUrl: `https://rwa-insight-luffa.vercel.app`
- appIcon: `https://rwa-insight-luffa.vercel.app/icon.png`

**注意：**
- 确保URL可访问
- 确保是HTTPS
- 确保没有末尾斜杠

---

**问题5：缺少icon.png**

如果icon.png不存在，可能导致连接失败。

**检查：**访问 https://rwa-insight-luffa.vercel.app/icon.png

**解决：**需要在public目录添加icon.png

---

#### 步骤4：添加更详细的日志

临时添加更多日志来调试：

```javascript
// 在App.jsx的useEffect中
useEffect(() => {
  console.log('[DEBUG] Component mounted');
  console.log('[DEBUG] window.__wxjs_environment:', window.__wxjs_environment);
  console.log('[DEBUG] typeof wx:', typeof wx);
  console.log('[DEBUG] isLuffaEnv:', LuffaSDK.isLuffaEnv());

  const initWallet = async () => {
    console.log('[DEBUG] initWallet called');

    LuffaSDK.ready(async () => {
      console.log('[DEBUG] SDK ready callback executed');
      console.log('[DEBUG] isLuffaEnv check:', LuffaSDK.isLuffaEnv());

      if (LuffaSDK.isLuffaEnv()) {
        console.log('[DEBUG] In Luffa environment, calling connectWallet...');
        try {
          const data = await LuffaSDK.connectWallet({
            appUrl: APP_CONFIG.appUrl,
            appIcon: APP_CONFIG.appIcon
          });
          console.log('[DEBUG] connectWallet success:', data);
        } catch (err) {
          console.error('[DEBUG] connectWallet error:', err);
        }
      } else {
        console.log('[DEBUG] NOT in Luffa environment');
      }
    });
  };

  initWallet();
}, []);
```

---

### 快速测试

#### 测试1：浏览器测试（应该显示"browser mode"）
```bash
# 访问 http://localhost:3000
# 控制台应该显示：
[Luffa SDK] Module loaded. Environment check: { isLuffaEnv: false, ... }
[RWA Insight] Running in browser mode
```

#### 测试2：Vercel测试
```bash
# 访问 https://rwa-insight-luffa.vercel.app
# 应该能看到app正常运行
```

#### 测试3：Luffa App测试
```bash
# 在Luffa App中打开小程序
# 应该看到钱包连接提示
```

---

### 创建icon.png

如果icon不存在，创建一个：

```bash
# 在public目录创建icon.png（192x192px）
# 或者使用现有的react.svg转换
```

---

### 强制环境测试

如果想在浏览器中模拟Luffa环境测试（仅用于调试）：

```javascript
// 在浏览器控制台运行
window.__wxjs_environment = 'miniprogram';
window.wx = {
  invokeNativePlugin: (opts) => {
    console.log('Mock wx.invokeNativePlugin called:', opts);
    if (opts.success) {
      setTimeout(() => {
        opts.success({
          data: {
            address: '0xMockAddress',
            nickname: 'Test User',
            uid: '12345'
          }
        });
      }, 500);
    }
  }
};
// 然后刷新页面
```

---

### 检查清单

#### 代码层面
- [x] SDK使用正确的Vercel URL
- [x] WeixinJSBridgeReady事件监听已实现
- [x] LuffaSDK.ready()回调已使用
- [ ] icon.png文件存在
- [ ] 环境检测正常

#### 部署层面
- [x] Vercel部署成功
- [x] Luffa后台域名配置正确
- [ ] icon.png可访问
- [ ] 在Luffa App中打开（不是浏览器）

#### 调试层面
- [ ] 查看控制台日志
- [ ] 确认环境检测结果
- [ ] 确认SDK初始化状态
- [ ] 确认connectWallet被调用

---

### 下一步

1. **重新构建并部署**
```bash
npm run build
git add .
git commit -m "Fix wallet connection URLs"
git push
```

2. **等待Vercel自动部署**

3. **在Luffa App中测试**
- 关闭小程序
- 重新打开
- 查看是否出现钱包连接提示

4. **如果还是不行，收集信息：**
- 控制台日志截图
- 环境检测结果
- 是否有任何错误信息

---

### 常见原因排查

| 问题 | 检查方法 | 解决方案 |
|-----|---------|---------|
| 环境检测失败 | 查看 `isLuffaEnv` 日志 | 确保在Luffa App中打开 |
| SDK未准备 | 查看是否有 "Initialized" 日志 | 检查WeixinJSBridge监听 |
| URL错误 | 检查config.js中的URL | 更新为正确的Vercel URL |
| icon缺失 | 访问icon.png URL | 添加icon.png文件 |
| wx对象不存在 | `console.log(typeof wx)` | 确认在Luffa环境中 |

---

### 如果一切正常但仍无法连接

可能需要检查Luffa SuperBox的配置：

1. **API权限**：确保小程序有钱包连接权限
2. **域名白名单**：确保Vercel域名在白名单中
3. **小程序状态**：确保小程序已审核通过

请提供具体的错误信息或控制台日志，我可以进一步帮助调试！
