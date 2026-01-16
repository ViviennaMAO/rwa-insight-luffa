# 真实钱包数据集成方案

## 概述

将Portfolio和Profile页面从使用虚拟数据改为使用真实的链上钱包数据。

## 数据结构变化

### 原有虚拟数据（MOCK_DATA）
```javascript
user: {
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  portfolio: {
    totalValue: 12500,
    assets: [
      { name: 'Ondo OUSG', value: 8500, change: 0.12 },
      { name: 'Maple Pool', value: 4000, change: 0.85 }
    ]
  }
}

walletBalance: 5000 (hardcoded)
```

### 新的真实数据结构
```javascript
// 从walletService获取
{
  balance: number,          // USDT余额
  portfolio: {
    totalValue: number,     // 总持仓价值
    assets: [               // RWA资产列表
      {
        name: string,       // 资产名称
        symbol: string,     // 代币符号
        value: number,      // USD价值
        change: number,     // 24h变化百分比
        amount: number,     // 持仓数量
        contractAddress: string  // 合约地址
      }
    ]
  },
  transactions: [           // 交易历史
    {
      id: string,
      type: 'deposit' | 'withdraw',
      asset: string,
      amount: number,
      timestamp: number,
      status: string,
      hash: string
    }
  ],
  lastUpdated: timestamp
}
```

## 需要添加的State

```javascript
// 在App.jsx中添加
const [portfolioData, setPortfolioData] = useState(null);
const [isLoadingWallet, setIsLoadingWallet] = useState(false);
const [walletError, setWalletError] = useState(null);
const [transactions, setTransactions] = useState([]);
```

## 关键修改点

### 1. 钱包连接时自动获取数据

```javascript
// src/App.jsx 第272-302行
useEffect(() => {
  const initWallet = async () => {
    LuffaSDK.ready(async () => {
      try {
        if (LuffaSDK.isLuffaEnv()) {
          console.log('[RWA Insight] Connecting wallet...');

          // 1. 连接钱包
          const data = await LuffaSDK.connectWallet({
            appUrl: APP_CONFIG.appUrl,
            appIcon: APP_CONFIG.appIcon
          });
          setUserData(data);
          setIsWalletConnected(true);

          // 2. 获取真实钱包数据（NEW!）
          setIsLoadingWallet(true);
          const walletData = await walletService.refreshWalletData(
            data.address,
            'endless'
          );

          setWalletBalance(walletData.balance);
          setPortfolioData(walletData.portfolio);
          setTransactions(walletData.transactions);
          setIsLoadingWallet(false);

          console.log('[RWA Insight] Wallet data loaded:', walletData);
        }
      } catch (err) {
        console.error('[RWA Insight] Wallet init failed:', err);
        setWalletError(err.message);
        setIsLoadingWallet(false);
      }
    });
  };
  initWallet();
}, []);
```

### 2. Portfolio页面使用真实数据

```javascript
// 原来（第3847行）
<h2>${MOCK_DATA.user.portfolio.totalValue.toLocaleString()}</h2>

// 改为
<h2>${(portfolioData?.totalValue || 0).toLocaleString()}</h2>

// 资产列表
{portfolioData?.assets?.length > 0 ? (
  portfolioData.assets.map((asset, index) => (
    <div key={index} className="asset-item">
      <div>{asset.name}</div>
      <div>${asset.value.toLocaleString()}</div>
      <div className={asset.change >= 0 ? 'positive' : 'negative'}>
        {asset.change >= 0 ? '+' : ''}{(asset.change * 100).toFixed(2)}%
      </div>
    </div>
  ))
) : (
  <div className="empty-state">
    <p>No RWA holdings yet</p>
    <p>Start investing in Real World Assets</p>
  </div>
)}
```

### 3. Profile页面显示真实余额

```javascript
// 原来（第4078行）
<span>${walletBalance.toLocaleString()}</span>

// 保持不变，但walletBalance现在是真实数据
// 添加刷新按钮
<button onClick={handleRefreshBalance}>
  <RefreshCw size={16} />
  Refresh
</button>
```

### 4. 添加刷新功能

```javascript
const handleRefreshBalance = async () => {
  if (!userData?.address) return;

  setIsLoadingWallet(true);
  try {
    const walletData = await walletService.refreshWalletData(
      userData.address,
      'endless'
    );

    setWalletBalance(walletData.balance);
    setPortfolioData(walletData.portfolio);
    setTransactions(walletData.transactions);
  } catch (error) {
    console.error('Failed to refresh wallet data:', error);
    setWalletError(error.message);
  } finally {
    setIsLoadingWallet(false);
  }
};
```

### 5. 添加加载状态UI

```javascript
{isLoadingWallet ? (
  <div className="loading-wallet">
    <RefreshCw className="spin" size={24} />
    <p>Loading wallet data...</p>
  </div>
) : walletError ? (
  <div className="error-wallet">
    <p>Error loading wallet: {walletError}</p>
    <button onClick={handleRefreshBalance}>Retry</button>
  </div>
) : (
  // 正常内容
)}
```

## WalletService API说明

### getWalletBalance(address, network)
- 获取钱包USDT余额
- 当前在Luffa环境返回0（需要实现真实API）
- 浏览器模式返回5000（mock）

### getPortfolioHoldings(address, network)
- 获取RWA资产持仓
- 当前在Luffa环境返回空数组（需要实现真实API）
- 浏览器模式返回mock持仓数据

### getTransactionHistory(address, network, limit)
- 获取交易历史
- 当前在Luffa环境返回空数组（需要实现真实API）
- 浏览器模式返回mock交易数据

### refreshWalletData(address, network)
- 一次性刷新所有钱包数据
- 并发请求balance、portfolio、transactions
- 返回完整的钱包数据对象

### subscribeToBalanceUpdates(address, callback)
- 订阅余额实时更新
- 当前每30秒轮询一次
- 返回unsubscribe函数

## 实现步骤

### 第1步：添加walletService导入
```javascript
import walletService from './services/walletService';
```

### 第2步：添加新的state变量
```javascript
const [portfolioData, setPortfolioData] = useState(null);
const [isLoadingWallet, setIsLoadingWallet] = useState(false);
const [walletError, setWalletError] = useState(null);
const [transactions, setTransactions] = useState([]);
```

### 第3步：修改钱包连接逻辑
在useEffect中的钱包连接成功后添加数据获取

### 第4步：更新Portfolio UI
替换MOCK_DATA.user.portfolio为portfolioData

### 第5步：添加刷新功能
在Profile页面添加刷新按钮

### 第6步：添加空状态和错误状态UI

## 未来优化

### 短期（需要Luffa SDK支持）
1. 实现真实的余额查询API
2. 实现真实的RWA持仓查询
3. 实现交易历史查询
4. 添加WebSocket实时更新

### 中期
1. 缓存钱包数据到localStorage
2. 添加下拉刷新功能
3. 优化加载性能
4. 添加骨架屏loading

### 长期
1. 多链支持（Ethereum, BSC, Polygon等）
2. 多资产类型支持
3. 高级分析功能（收益率图表、历史表现）
4. 推送通知（余额变动、交易确认）

## 测试计划

### 浏览器测试
- [x] Mock数据正常显示
- [ ] 刷新功能正常
- [ ] 空状态显示正确
- [ ] 加载状态显示正确

### Luffa环境测试
- [ ] 钱包连接后自动加载数据
- [ ] 显示"暂无持仓"状态（当前API返回空）
- [ ] 刷新功能不报错
- [ ] 错误处理正常

## 注意事项

1. **向后兼容**：当walletService返回空数据时，显示空状态而不是错误
2. **性能**：避免频繁刷新，建议30-60秒轮询间隔
3. **用户体验**：加载时显示skeleton，而不是空白页面
4. **错误处理**：网络错误时显示友好提示，提供重试按钮
5. **数据一致性**：确保balance和portfolio的totalValue一致

## 文件清单

- ✅ `src/services/walletService.js` - 已创建
- ⏳ `src/App.jsx` - 需要修改
- ⏳ `src/index.css` - 可能需要添加loading样式

## 开发时间估算

- walletService实现：✅ 完成
- App.jsx集成：30分钟
- UI优化（loading/error states）：20分钟
- 测试和调试：20分钟
- **总计**：约70分钟

## 下一步

立即可以开始修改`src/App.jsx`，集成walletService！
