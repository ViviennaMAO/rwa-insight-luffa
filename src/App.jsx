import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  List,
  Wallet,
  Share2,
  ChevronRight,
  ArrowUpRight,
  Search,
  Bell,
  User,
  LayoutGrid,
  Activity,
  Layers,
  Coins,
  Landmark,
  Globe,
  Building,
  FileText,
  Gem,
  Building2,
  TrendingUp,
  ChevronLeft,
  LogOut,
  Settings,
  Copy,
  ExternalLink,
  Shield,
  HelpCircle,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  CheckCircle,
  X,
  ArrowUpDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MOCK_DATA } from './mockData';
import { LuffaSDK } from './sdk';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Inline constant styles for absolute stability in mini-program containers
const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottom: '1px solid #F1F2F4',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  card: {
    backgroundColor: '#F7F8FA',
    borderRadius: '24px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    border: '1px solid #F1F2F4',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '84px',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: '20px',
    borderTop: '1px solid #F1F2F4',
    zIndex: 1000,
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('market');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showInvestSheet, setShowInvestSheet] = useState(false);
  const [investAmount, setInvestAmount] = useState('1000');
  const [orderStatus, setOrderStatus] = useState(null); // 'submitting', 'success', null
  const [entitiesTab, setEntitiesTab] = useState('platforms'); // 'platforms', 'managers', 'networks', 'jurisdictions'
  const [stablecoinTab, setStablecoinTab] = useState('platforms'); // Stablecoin League Table tabs
  const [commoditiesTab, setCommoditiesTab] = useState('managers'); // Commodities: managers, networks only
  const [stocksTab, setStocksTab] = useState('platforms'); // Stocks: platforms, underlyingStock, networks
  const [nonUsDebtTab, setNonUsDebtTab] = useState('platforms'); // Non-US Govt Debt: platforms, managers, networks, jurisdictions
  const [institutionalFundsTab, setInstitutionalFundsTab] = useState('platforms'); // Institutional Funds: platforms, managers, networks, jurisdictions
  const [corporateBondsTab, setCorporateBondsTab] = useState('platforms'); // Corporate Bonds: platforms, managers, networks, jurisdictions
  const [rwaLeagueTab, setRwaLeagueTab] = useState('networks'); // RWA League Table: networks, managers, platforms, assetClasses

  // Sorting state
  const [sortOption, setSortOption] = useState('aum_desc'); // aum_desc, aum_asc, yield_desc, yield_asc
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  // Platform Filter state
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [showPlatformFilter, setShowPlatformFilter] = useState(false);
  const platformFilterRef = useRef(null);

  // Available Platforms (Mock Data)
  const availablePlatforms = useMemo(() => {
    return [
      { id: 'Ondo', name: 'Ondo', icon: '🌀', count: 204 },
      { id: 'Dinari', name: 'Dinari', icon: '🇩', count: 90 },
      { id: 'xStocks', name: 'xStocks', icon: '❌', count: 74 },
      { id: 'Securitize', name: 'Securitize', icon: '🔒', count: 18 },
      { id: 'OpenTrade', name: 'OpenTrade (Perimeter Pr...', icon: '🌐', count: 16 },
      { id: 'WisdomTree', name: 'WisdomTree', icon: '🌳', count: 15 },
      { id: 'Libeara', name: 'Libeara', icon: '🇱', count: 14 },
      { id: 'Backed Finance', name: 'Backed Finance', icon: '🔵', count: 10 },
      { id: 'Swarm', name: 'Swarm', icon: '🔵', count: 10 },
      { id: 'Nest', name: 'Nest', icon: '🌿', count: 8 },
      { id: 'Archax', name: 'Archax', icon: '🅰️', count: 6 },
    ];
  }, []);

  // Asset Class Filter State & Data
  const [showAssetClassFilter, setShowAssetClassFilter] = useState(false);
  const [selectedAssetClasses, setSelectedAssetClasses] = useState(['Public Equity', 'US Treasury Debt', 'Institutional Alternative Funds', 'Private Credit', 'non-US Government Debt', 'Commodities']);
  const [assetClassSearch, setAssetClassSearch] = useState('');
  const assetClassFilterRef = useRef(null);

  const assetClassOptions = useMemo(() => [
    { id: 'public_equity', name: 'Public Equity', count: 385, icon: PieChartIcon },
    { id: 'us_treasury', name: 'US Treasury Debt', count: 59, icon: Landmark },
    { id: 'stablecoins', name: 'Stablecoins', count: 54, icon: Coins },
    { id: 'institutional', name: 'Institutional Alternative Funds', count: 33, icon: Building2 },
    { id: 'private_credit', name: 'Private Credit', count: 24, icon: FileText },
    { id: 'non_us_debt', name: 'non-US Government Debt', count: 19, icon: Globe },
    { id: 'commodities', name: 'Commodities', count: 16, icon: Gem },
    { id: 'corporate_bonds', name: 'Corporate Bonds', count: 9, icon: Building },
    { id: 'private_equity', name: 'Private Equity', count: 5, icon: PieChartIcon },
    { id: 'managed_strategies', name: 'Actively-Managed Strategies', count: 3, icon: TrendingUp },
  ], []);

  const filteredAssetClasses = useMemo(() => {
    return assetClassOptions.filter(item =>
      item.name.toLowerCase().includes(assetClassSearch.toLowerCase())
    );
  }, [assetClassOptions, assetClassSearch]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (platformFilterRef.current && !platformFilterRef.current.contains(event.target)) {
        setShowPlatformFilter(false);
      }
      if (assetClassFilterRef.current && !assetClassFilterRef.current.contains(event.target)) {
        setShowAssetClassFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset sort and filters when category changes
  useEffect(() => {
    setSortOption('aum_desc');
    setShowSortMenu(false);
    setSelectedPlatforms([]);
    setShowPlatformFilter(false);
  }, [selectedCategory]);

  // Filtering and Sorting Helper Function
  const getFilteredAndSortedData = (data, type = 'product') => {
    if (!data) return [];

    // 1. Filter by Platforms
    let filteredData = data;
    if (selectedPlatforms.length > 0) {
      filteredData = data.filter(item => {
        return selectedPlatforms.some(p => {
          const platformName = item.platform || item.provider || '';
          return platformName.includes(p) || p.includes(platformName);
        });
      });
    }

    // 2. Sort
    return [...filteredData].sort((a, b) => {
      let valA, valB;

      // Determine values based on sort option
      if (sortOption.includes('aum')) {
        valA = a.marketCap || a.totalValue || a.principalOutstanding || 0;
        valB = b.marketCap || b.totalValue || b.principalOutstanding || 0;

        if (typeof valA === 'string') valA = parseFloat(valA.replace(/[^0-9.-]+/g, "")) * (valA.includes('B') ? 1e9 : valA.includes('M') ? 1e6 : 1);
        if (typeof valB === 'string') valB = parseFloat(valB.replace(/[^0-9.-]+/g, "")) * (b.includes('B') ? 1e9 : b.includes('M') ? 1e6 : 1);
      } else if (sortOption.includes('yield')) {
        valA = a.apy || 0;
        valB = b.apy || 0;

        if (typeof valA === 'string') valA = parseFloat(valA.replace('%', ''));
        if (typeof valB === 'string') valB = parseFloat(valB.replace('%', ''));
      }

      // Sort
      if (sortOption.endsWith('_desc')) {
        return valB - valA;
      } else {
        return valA - valB;
      }
    });
  };

  const sortOptions = [
    { id: 'aum_desc', label: 'Highest AUM' },
    { id: 'aum_asc', label: 'Lowest AUM' },
    { id: 'yield_desc', label: 'Highest Yield' },
    { id: 'yield_asc', label: 'Lowest Yield' },
  ];

  // Profile page states
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeProfileView, setActiveProfileView] = useState('main'); // 'main', 'history', 'security', 'settings'

  const [showDepositSheet, setShowDepositSheet] = useState(false);

  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState(null); // 'processing', 'success', 'error'

  const [depositAmount, setDepositAmount] = useState('');
  const [depositStatus, setDepositStatus] = useState(null); // 'processing', 'success', 'error'

  const [walletBalance, setWalletBalance] = useState(0);
  const [addressCopied, setAddressCopied] = useState(false);

  // 分类图标映射
  const categoryIcons = {
    'stablecoins': Coins,
    'us-treasuries': Landmark,
    'non-us-govt-debt': Globe,
    'corporate-bonds': Building,
    'private-credit': FileText,
    'commodities': Gem,
    'institutional-funds': Building2,
    'stocks': TrendingUp,
  };

  // Auto-connect wallet on mount (in Luffa environment)
  useEffect(() => {
    const initWallet = async () => {
      // Wait for Luffa SDK to be ready (handles WeixinJSBridgeReady event)
      LuffaSDK.ready(async () => {
        try {
          // Check if we're in Luffa environment and auto-connect
          if (LuffaSDK.isLuffaEnv()) {
            console.log('[RWA Insight] Connecting wallet in Luffa environment...');
            const data = await LuffaSDK.connectWallet({
              appUrl: 'https://rwa-insight.luffa.im',
              appIcon: 'https://rwa-insight.luffa.im/icon.png'
            });
            setUserData(data);
            setIsWalletConnected(true);
            // Mock balance for demo
            setWalletBalance(5000);
            console.log('[RWA Insight] Wallet connected:', data.address);
          } else {
            // For browser testing, show connect button
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

  // Handle wallet connect
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const data = await LuffaSDK.connectWallet({
        appUrl: 'https://rwa-insight.luffa.im',
        appIcon: 'https://rwa-insight.luffa.im/icon.png'
      });
      setUserData(data);
      setIsWalletConnected(true);
      setWalletBalance(5000); // Mock balance
    } catch (err) {
      console.error('Connect wallet failed:', err);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    setUserData(null);
    setIsWalletConnected(false);
    setWalletBalance(0);
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (userData?.address) {
      navigator.clipboard.writeText(userData.address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setDepositStatus('processing');
    try {
      // Call Luffa SDK to process deposit
      await LuffaSDK.depositToRWA({
        from: userData.address,
        contractAddress: 'RWA_INSIGHT_CONTRACT_ADDRESS',
        amount: parseFloat(depositAmount),
        assetId: 'USDT'
      });

      setWalletBalance(prev => prev + parseFloat(depositAmount));
      setDepositStatus('success');

      // Reset after showing success
      setTimeout(() => {
        setShowDepositSheet(false);
        setDepositStatus(null);
        setDepositAmount('');
      }, 2000);
    } catch (err) {
      console.error('Deposit failed:', err);
      setDepositStatus('error');
      setTimeout(() => setDepositStatus(null), 3000);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > walletBalance) {
      alert('Insufficient balance');
      return;
    }

    setWithdrawStatus('processing');
    try {
      // Call Luffa SDK to transfer funds back to user
      // Note: In a real app this would likely be a server-side withdrawal request
      // or a contract interaction where user burns LP tokens to get underlying asset
      await LuffaSDK.transfer({
        from: userData.address, // In reality, this might be the hot wallet sending back
        to: userData.address,   // Mock sending to self for demo
        amount: parseFloat(withdrawAmount)
      });

      setWalletBalance(prev => prev - parseFloat(withdrawAmount));
      setWithdrawStatus('success');

      // Reset after showing success
      setTimeout(() => {
        setShowWithdrawSheet(false);
        setWithdrawStatus(null);
        setWithdrawAmount('');
      }, 2000);
    } catch (err) {
      console.error('Withdraw failed:', err);
      setWithdrawStatus('error');
      setTimeout(() => setWithdrawStatus(null), 3000);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', color: '#1A1C1E' }}>
      {/* Tabs + Bell in same row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #F1F2F4',
        backgroundColor: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto' }}>
          {[
            { id: 'market', label: '市场概览' },
            { id: 'discovery', label: '资产超市' },
            { id: 'portfolio', label: '我的持仓' }
          ].map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 0',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                color: activeTab === tab.id ? '#000' : '#CCC',
                borderBottom: activeTab === tab.id ? '2px solid #000' : '2px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <div style={{ width: '36px', height: '36px', backgroundColor: '#F7F8FA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '12px' }}>
          <Bell size={18} />
        </div>
      </div>

      <main style={{ padding: '20px 16px 100px 16px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'market' && (
            <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* 搜索框 - 仅在市场概览页面显示 */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px' }}>
                <Search size={18} color="#999" />
                <input
                  type="text"
                  placeholder="搜索 RWA 资产"
                  style={{ border: 'none', background: 'none', outline: 'none', marginLeft: '10px', fontSize: '15px', width: '100%', color: '#1A1C1E' }}
                />
              </div>

              {/* 全球市场概览标题 (Global Market Overview Header) */}
              <div style={{ marginBottom: '32px', padding: '0 4px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '0', letterSpacing: '-1px' }}>{MOCK_DATA.marketOverview.title}</h1>
              </div>

              {/* 核心指标矩阵 (Core Metrics Grid) - 改为全平铺模式 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px 32px', marginBottom: '48px', padding: '0 4px' }}>
                {MOCK_DATA.marketOverview.metrics.map((metric, i) => (
                  <div key={i} style={{
                    padding: '24px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '24px',
                    border: '1px solid #F1F2F4',
                    gridColumn: i === 4 ? 'span 2' : 'span 1' // 最后一个指标跨两列以保持对称
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {metric.label} <span style={{ color: '#CBD5E1', cursor: 'help' }}>ⓘ</span>
                    </p>
                    <p style={{ fontSize: '28px', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.5px' }}>{metric.value}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 900 }}>
                      <span style={{ color: metric.trend === 'up' ? '#10B981' : '#EF4444' }}>
                        {metric.trend === 'up' ? '▲' : '▼'} {metric.change.replace(/[+-]/, '')}
                      </span>
                      <span style={{ color: '#94A3B8', fontWeight: 700 }}>from 30d ago</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 全球宏观数据 (Global Macro Section) */}
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: 900, marginBottom: '12px', paddingLeft: '4px' }}>GLOBAL MACRO</p>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginLeft: '-4px', paddingLeft: '4px' }} className="no-scrollbar">
                  {(MOCK_DATA.marketOverview.macroIndicators || []).map((macro, i) => (
                    <div key={i} style={{ minWidth: '140px', backgroundColor: '#F7F8FA', padding: '16px', borderRadius: '20px', border: '1px solid #F1F2F4' }}>
                      <p style={{ fontSize: '10px', fontWeight: 900, color: '#999', marginBottom: '8px', whiteSpace: 'nowrap' }}>{macro.name.toUpperCase()}</p>
                      <p style={{ fontSize: '16px', fontWeight: 900, marginBottom: '4px' }}>{macro.value}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: macro.trend === 'up' ? '#EF4444' : macro.trend === 'down' ? '#10B981' : '#AAA' }}>
                          ● {macro.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total RWA Value 分布 */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '1px solid #F1F2F4',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Total RWA Value</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>Distributed</span>
                    <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>Represented</span>
                    <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>All</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {MOCK_DATA.marketOverview.totalRwaValue.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }}></div>
                      <span style={{ fontSize: '14px', fontWeight: 700, flex: 1 }}>{item.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6' }}>
                        ${item.value >= 1e9 ? (item.value / 1e9).toFixed(1) + 'B' : (item.value / 1e6).toFixed(1) + 'M'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RWA League Table */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '1px solid #F1F2F4',
                overflow: 'hidden',
                marginBottom: '24px'
              }}>
                <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 900 }}>RWA League Table</h2>
                    <span style={{ fontSize: '20px' }}>🌐</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>Distributed</span>
                    <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>Represented</span>
                    <span style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, backgroundColor: '#1A1C1E', color: 'white' }}>All</span>
                  </div>
                </div>

                {/* 表格标签栏 */}
                <div style={{
                  display: 'flex',
                  gap: '24px',
                  padding: '0 24px 12px 24px',
                  borderBottom: '1px solid #F1F2F4',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  {[
                    { id: 'networks', label: 'Networks' },
                    { id: 'managers', label: 'Managers' },
                    { id: 'platforms', label: 'Platforms' },
                    { id: 'assetClasses', label: 'Asset Classes' }
                  ].map(tab => (
                    <span
                      key={tab.id}
                      onClick={() => setRwaLeagueTab(tab.id)}
                      style={{
                        fontSize: '13px',
                        fontWeight: rwaLeagueTab === tab.id ? 800 : 700,
                        color: rwaLeagueTab === tab.id ? '#3B82F6' : '#94A3B8',
                        borderBottom: rwaLeagueTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                        paddingBottom: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {tab.label}
                    </span>
                  ))}
                </div>

                {/* 可滚动的表格区域 */}
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <div style={{ minWidth: '550px' }}>
                    {/* 表头 */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                      gap: '8px',
                      padding: '12px 24px',
                      backgroundColor: '#F8FAFC',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#94A3B8',
                      textTransform: 'uppercase'
                    }}>
                      <span>#</span>
                      <span>{rwaLeagueTab === 'networks' ? 'Network' : rwaLeagueTab === 'managers' ? 'Manager' : rwaLeagueTab === 'platforms' ? 'Platform' : 'Asset Class'}</span>
                      <span style={{ textAlign: 'center' }}>RWA Cou...</span>
                      <span style={{ textAlign: 'right' }}>Total Value ▼</span>
                      <span style={{ textAlign: 'right' }}>30D%</span>
                      <span style={{ textAlign: 'right' }}>Market Share</span>
                    </div>

                    {/* 表格数据 */}
                    {MOCK_DATA.marketOverview.rwaLeagueTable[rwaLeagueTab].map((row, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                          gap: '8px',
                          padding: '16px 24px',
                          borderBottom: i < MOCK_DATA.marketOverview.rwaLeagueTable[rwaLeagueTab].length - 1 ? '1px solid #F8FAFC' : 'none',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8' }}>{row.rank}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>{row.logo}</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>{row.rwaCount.toLocaleString()}</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{row.totalValue}</span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          textAlign: 'right',
                          color: row.trend === 'up' ? '#10B981' : '#EF4444'
                        }}>
                          {row.trend === 'up' ? '▲' : '▼'}{row.change30d.replace(/[+-]/, '')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800 }}>{row.marketShare}</span>
                          <span style={{ color: row.trend === 'up' ? '#10B981' : '#EF4444' }}>
                            {row.trend === 'up' ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'discovery' && (
            <motion.div key="discovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* 根据是否选中分类显示不同内容 */}
              {!selectedCategory ? (
                <>
                  {/* 标题区域 */}
                  <div style={{ padding: '0 4px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>资产超市</h1>
                    <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>探索和投资各类代币化真实世界资产</p>
                  </div>

                  {/* 分类卡片网格 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {MOCK_DATA.assetCategories.map((category, index) => {
                      const IconComponent = categoryIcons[category.id];
                      return (
                        <div
                          key={category.id}
                          onClick={() => setSelectedCategory(category)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            padding: '20px 8px',
                            borderBottom: index < MOCK_DATA.assetCategories.length - 1 ? '1px solid #F1F2F4' : 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #F1F2F4'
                          }}>
                            {IconComponent && <IconComponent size={24} color="#475569" strokeWidth={1.5} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1E293B', marginBottom: '2px' }}>{category.name}</h3>
                            {category.count > 0 && (
                              <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>{category.count} products</p>
                            )}
                          </div>
                          <ChevronRight size={20} color="#CBD5E1" />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* 分类详情页头部 */}
                  <div style={{ padding: '0 4px' }}>
                    <div
                      onClick={() => setSelectedCategory(null)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer', color: '#64748B' }}
                    >
                      <ChevronLeft size={20} />
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>返回分类</span>
                    </div>
                  </div>

                  {/* Stablecoins 专属视图 */}
                  {selectedCategory.id === 'stablecoins' ? (
                    <>
                      {/* 标题和描述 */}
                      <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>Stablecoins</h1>
                        <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, lineHeight: 1.6 }}>
                          {MOCK_DATA.stablecoinsData.description}
                        </p>
                      </div>

                      {/* 核心指标 */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        {MOCK_DATA.stablecoinsData.metrics.map((metric, i) => (
                          <div key={i} style={{
                            padding: '20px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '20px',
                            border: '1px solid #F1F2F4'
                          }}>
                            <p style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {metric.label} <span style={{ opacity: 0.5, cursor: 'help' }}>ⓘ</span>
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>{metric.value}</p>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 800,
                              color: metric.trend === 'up' ? '#10B981' : '#EF4444'
                            }}>
                              {metric.trend === 'up' ? '▲' : '▼'} {metric.change.replace(/[+-]/, '')} from 30d ago
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Stablecoin League Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden',
                        marginBottom: '24px'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Stablecoin League Table</h2>
                        </div>

                        {/* 表格标签栏 */}
                        <div style={{
                          display: 'flex',
                          gap: '24px',
                          padding: '0 24px 12px 24px',
                          borderBottom: '1px solid #F1F2F4',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}>
                          {[
                            { id: 'platforms', label: 'Platforms' },
                            { id: 'managers', label: 'Managers' },
                            { id: 'networks', label: 'Networks' },
                            { id: 'jurisdictions', label: 'Jurisdiction Country' }
                          ].map(tab => (
                            <span
                              key={tab.id}
                              onClick={() => setStablecoinTab(tab.id)}
                              style={{
                                fontSize: '13px',
                                fontWeight: stablecoinTab === tab.id ? 800 : 700,
                                color: stablecoinTab === tab.id ? '#3B82F6' : '#94A3B8',
                                borderBottom: stablecoinTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                                paddingBottom: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              {tab.label}
                            </span>
                          ))}
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '500px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>#</span>
                              <span>{stablecoinTab === 'platforms' ? 'Platform' : stablecoinTab === 'managers' ? 'Manager' : stablecoinTab === 'networks' ? 'Network' : 'Jurisdiction'}</span>
                              <span style={{ textAlign: 'center' }}>RWA Count</span>
                              <span style={{ textAlign: 'right' }}>Total Value ▼</span>
                              <span style={{ textAlign: 'right' }}>30D%</span>
                              <span style={{ textAlign: 'right' }}>Market Share</span>
                            </div>

                            {/* 表格数据 */}
                            {MOCK_DATA.stablecoinsData.leagueTable[stablecoinTab].map((row, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.stablecoinsData.leagueTable[stablecoinTab].length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8' }}>{row.rank}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '20px' }}>{row.logo}</span>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>{row.rwaCount}</span>
                                <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{row.totalValue}</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  textAlign: 'right',
                                  color: row.trend === 'up' ? '#10B981' : '#EF4444'
                                }}>
                                  {row.trend === 'up' ? '▲' : '▼'}{row.change30d.replace(/[+-]/, '')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{row.marketShare}</span>
                                  <span style={{ color: row.trend === 'up' ? '#10B981' : '#EF4444' }}>
                                    {row.trend === 'up' ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Top Net Flows */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        padding: '24px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                          <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              Top Net Flows <span style={{ opacity: 0.3, cursor: 'help' }}>ⓘ</span>
                            </h2>
                            <p style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 600 }}>As of {MOCK_DATA.stablecoinsData.asOfDate}</p>
                          </div>
                          <div style={{
                            backgroundColor: '#F8FAFC',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            Period: 30D <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                          </div>
                        </div>

                        {/* 净流入/流出条形图 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {MOCK_DATA.stablecoinsData.netFlows.map((flow, i) => {
                            const maxValue = 4000000000; // 4B for scale
                            const barWidth = Math.min(Math.abs(flow.value) / maxValue * 100, 100);

                            return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '80px', flexShrink: 0 }}>
                                  <p style={{ fontSize: '14px', fontWeight: 800, marginBottom: '2px' }}>{flow.symbol}</p>
                                  <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{flow.provider}</p>
                                </div>
                                <div style={{ flex: 1, height: '32px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  {/* 中心线 */}
                                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: '#E2E8F0' }} />

                                  {/* 条形 */}
                                  <div style={{
                                    position: 'absolute',
                                    [flow.isPositive ? 'left' : 'right']: '50%',
                                    width: `${barWidth / 2}%`,
                                    height: '28px',
                                    backgroundColor: flow.isPositive ? '#6EE7B7' : '#FCA5A5',
                                    borderRadius: flow.isPositive ? '0 6px 6px 0' : '6px 0 0 6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: flow.isPositive ? 'flex-end' : 'flex-start',
                                    paddingLeft: flow.isPositive ? 0 : '8px',
                                    paddingRight: flow.isPositive ? '8px' : 0
                                  }}>
                                    <span style={{
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      color: flow.isPositive ? '#047857' : '#DC2626',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {flow.isPositive ? '' : '-'}${Math.abs(flow.value) >= 1e9
                                        ? (Math.abs(flow.value) / 1e9).toFixed(1) + 'B'
                                        : (Math.abs(flow.value) / 1e6).toFixed(0) + 'M'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* X轴刻度 */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '16px',
                          marginLeft: '96px',
                          fontSize: '11px',
                          color: '#94A3B8',
                          fontWeight: 600
                        }}>
                          <span>-$4.0B</span>
                          <span>-$3.0B</span>
                          <span>-$2.0B</span>
                          <span>-$1.0B</span>
                          <span>$0K</span>
                          <span>$1.0B</span>
                          <span>$2.0B</span>
                          <span>$...</span>
                        </div>
                      </div>
                    </>
                  ) : selectedCategory.id === 'us-treasuries' ? (
                    /* U.S. Treasuries 专属视图 */
                    <>
                      {/* 标题和描述 */}
                      <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>Tokenized Treasuries</h1>
                        <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, lineHeight: 1.6 }}>
                          {MOCK_DATA.treasuriesData.description}
                        </p>
                      </div>

                      {/* 核心指标 */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        {MOCK_DATA.treasuriesData.metrics.map((metric, i) => (
                          <div key={i} style={{
                            padding: '20px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '20px',
                            border: '1px solid #F1F2F4'
                          }}>
                            <p style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {metric.label} <span style={{ opacity: 0.5, cursor: 'help' }}>ⓘ</span>
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>{metric.value}</p>
                            {metric.change && (
                              <span style={{
                                fontSize: '12px',
                                fontWeight: 800,
                                color: metric.trend === 'up' ? '#10B981' : metric.trend === 'down' ? '#EF4444' : '#94A3B8'
                              }}>
                                {metric.trend === 'up' ? '▲' : metric.trend === 'down' ? '▼' : ''} {metric.change.replace(/[+-]/, '')} from 7d ago
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Market Caps 饼图 */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                          <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Market Caps</h2>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#94A3B8'
                          }}>
                            GROUP BY
                            <div style={{
                              backgroundColor: 'white',
                              border: '1px solid #E2E8F0',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              color: '#1A1C1E',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              Network <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                            </div>
                          </div>
                        </div>

                        {/* 简化的饼图展示 - 使用列表形式 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                          {MOCK_DATA.treasuriesData.marketCapsByNetwork.map((item, i) => (
                            <div key={i} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 16px',
                              backgroundColor: '#F8FAFC',
                              borderRadius: '12px'
                            }}>
                              <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '4px',
                                backgroundColor: item.color
                              }} />
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1C1E' }}>{item.network}</p>
                              </div>
                              <p style={{ fontSize: '14px', fontWeight: 800, color: '#1A1C1E' }}>
                                ${item.value >= 1e9 ? (item.value / 1e9).toFixed(1) + 'B' : (item.value / 1e6).toFixed(1) + 'M'}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'right', marginTop: '16px' }}>as of {MOCK_DATA.treasuriesData.asOfDate}</p>
                      </div>

                      {/* Top Entities Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden',
                        marginBottom: '24px'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Top Entities</h2>
                        </div>

                        {/* 表格标签栏 */}
                        <div style={{
                          display: 'flex',
                          gap: '24px',
                          padding: '0 24px 12px 24px',
                          borderBottom: '1px solid #F1F2F4',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}>
                          {[
                            { id: 'platforms', label: 'Platforms' },
                            { id: 'managers', label: 'Managers' },
                            { id: 'networks', label: 'Networks' },
                            { id: 'jurisdictions', label: 'Jurisdiction Country' }
                          ].map(tab => (
                            <span
                              key={tab.id}
                              onClick={() => setEntitiesTab(tab.id)}
                              style={{
                                fontSize: '13px',
                                fontWeight: entitiesTab === tab.id ? 800 : 700,
                                color: entitiesTab === tab.id ? '#3B82F6' : '#94A3B8',
                                borderBottom: entitiesTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                                paddingBottom: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              {tab.label}
                            </span>
                          ))}
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '500px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>#</span>
                              <span>{entitiesTab === 'platforms' ? 'Platform' : entitiesTab === 'managers' ? 'Manager' : entitiesTab === 'networks' ? 'Network' : 'Jurisdiction'}</span>
                              <span style={{ textAlign: 'center' }}>RWA Count</span>
                              <span style={{ textAlign: 'right' }}>Total Value ▼</span>
                              <span style={{ textAlign: 'right' }}>30D%</span>
                              <span style={{ textAlign: 'right' }}>Market Share</span>
                            </div>

                            {/* 表格数据 */}
                            {MOCK_DATA.treasuriesData.topEntities[entitiesTab].map((row, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.treasuriesData.topEntities[entitiesTab].length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8' }}>{row.rank}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '20px' }}>{row.logo}</span>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>{row.rwaCount}</span>
                                <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{row.totalValue}</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  textAlign: 'right',
                                  color: row.trend === 'up' ? '#10B981' : '#EF4444'
                                }}>
                                  {row.trend === 'up' ? '▲' : '▼'}{row.change30d.replace(/[+-]/, '')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{row.marketShare}</span>
                                  <span style={{ color: row.trend === 'up' ? '#10B981' : '#EF4444' }}>
                                    {row.trend === 'up' ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Top Net Flows */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                          <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              Top Net Flows <span style={{ opacity: 0.3, cursor: 'help' }}>ⓘ</span>
                            </h2>
                            <p style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 600 }}>As of {MOCK_DATA.treasuriesData.asOfDate}</p>
                          </div>
                          <div style={{
                            backgroundColor: '#F8FAFC',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            Period: 30D <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                          </div>
                        </div>

                        {/* 净流入/流出条形图 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {MOCK_DATA.treasuriesData.netFlows.map((flow, i) => {
                            const maxValue = 200000000; // 200M for scale
                            const barWidth = Math.min(Math.abs(flow.value) / maxValue * 100, 100);

                            return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '70px', flexShrink: 0 }}>
                                  <p style={{ fontSize: '13px', fontWeight: 800, marginBottom: '2px' }}>{flow.symbol}</p>
                                  <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{flow.provider}</p>
                                </div>
                                <div style={{ flex: 1, height: '28px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: '#E2E8F0' }} />

                                  <div style={{
                                    position: 'absolute',
                                    [flow.isPositive ? 'left' : 'right']: '50%',
                                    width: `${barWidth / 2}%`,
                                    height: '24px',
                                    backgroundColor: flow.isPositive ? '#6EE7B7' : '#FCA5A5',
                                    borderRadius: flow.isPositive ? '0 6px 6px 0' : '6px 0 0 6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: flow.isPositive ? 'flex-end' : 'flex-start',
                                    paddingLeft: flow.isPositive ? 0 : '8px',
                                    paddingRight: flow.isPositive ? '8px' : 0
                                  }}>
                                    <span style={{
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: flow.isPositive ? '#047857' : '#DC2626',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {flow.isPositive ? '' : '-'}${(Math.abs(flow.value) / 1e6).toFixed(0)}M
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '16px',
                          marginLeft: '86px',
                          fontSize: '10px',
                          color: '#94A3B8',
                          fontWeight: 600
                        }}>
                          <span>-$100M</span>
                          <span>-$50M</span>
                          <span>$0K</span>
                          <span>$50M</span>
                          <span>$100M</span>
                          <span>$150M</span>
                          <span>$...</span>
                        </div>
                      </div>

                      {/* Treasury Products Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Treasury Products</h2>
                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>{MOCK_DATA.treasuriesData.products.length} Total</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                            {/* Platform Filter */}
                            <div style={{ position: 'relative' }} ref={platformFilterRef}>
                              <div
                                onClick={() => setShowPlatformFilter(!showPlatformFilter)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: showPlatformFilter || selectedPlatforms.length > 0 ? '#EFF6FF' : 'transparent',
                                  border: selectedPlatforms.length > 0 ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                <span style={{ fontSize: '13px', fontWeight: 600, color: selectedPlatforms.length > 0 ? '#3B82F6' : '#64748B' }}>
                                  {selectedPlatforms.length > 0 ? `${selectedPlatforms.length} Platforms` : 'All platforms'}
                                </span>
                                <Plus size={14} color={selectedPlatforms.length > 0 ? '#3B82F6' : "#64748B"} style={{ transform: showPlatformFilter ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
                              </div>

                              {showPlatformFilter && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  transform: 'translateY(4px)',
                                  backgroundColor: 'white',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                  border: '1px solid #F1F2F4',
                                  padding: '12px',
                                  zIndex: 60,
                                  minWidth: '240px',
                                }}>
                                  <div style={{ paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid #F1F2F4' }}>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: '8px 12px',
                                      backgroundColor: '#F8FAFC',
                                      borderRadius: '8px',
                                      marginBottom: '8px'
                                    }}>
                                      <Search size={14} color="#94A3B8" />
                                      <input
                                        type="text"
                                        placeholder="Search platforms..."
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          border: 'none',
                                          background: 'transparent',
                                          outline: 'none',
                                          fontSize: '13px',
                                          marginLeft: '8px',
                                          width: '100%',
                                          color: '#1E293B'
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {availablePlatforms.map(platform => (
                                      <div
                                        key={platform.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (selectedPlatforms.includes(platform.name)) {
                                            setSelectedPlatforms(prev => prev.filter(p => p !== platform.name));
                                          } else {
                                            setSelectedPlatforms(prev => [...prev, platform.name]);
                                          }
                                        }}
                                        style={{
                                          padding: '8px 12px',
                                          fontSize: '13px',
                                          fontWeight: 500,
                                          color: '#1E293B',
                                          borderRadius: '8px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          backgroundColor: selectedPlatforms.includes(platform.name) ? '#EFF6FF' : 'transparent',
                                          marginBottom: '2px'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <div style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '4px',
                                            border: selectedPlatforms.includes(platform.name) ? 'none' : '1px solid #CBD5E1',
                                            backgroundColor: selectedPlatforms.includes(platform.name) ? '#3B82F6' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}>
                                            {selectedPlatforms.includes(platform.name) && <CheckCircle size={10} color="white" />}
                                          </div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>{platform.icon}</span>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{platform.name}</span>
                                          </div>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#94A3B8', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{platform.count}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Sort Dropdown */}
                            <div style={{ position: 'relative' }} ref={sortMenuRef}>
                              <div
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: showSortMenu ? '#F1F5F9' : 'transparent',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Sort By</span>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1C1E' }}>
                                  {sortOptions.find(o => o.id === sortOption)?.label || 'Highest AUM'}
                                </span>
                                <ArrowUpDown size={14} color="#64748B" />
                              </div>

                              {showSortMenu && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  transform: 'translateY(4px)',
                                  backgroundColor: 'white',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                  border: '1px solid #F1F2F4',
                                  padding: '8px',
                                  zIndex: 50,
                                  minWidth: '180px',
                                }}>
                                  {sortOptions.map(option => (
                                    <div
                                      key={option.id}
                                      onClick={() => {
                                        setSortOption(option.id);
                                        setShowSortMenu(false);
                                      }}
                                      style={{
                                        padding: '10px 12px',
                                        fontSize: '13px',
                                        fontWeight: sortOption === option.id ? 700 : 500,
                                        color: sortOption === option.id ? '#3B82F6' : '#1E293B',
                                        backgroundColor: sortOption === option.id ? '#EFF6FF' : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                      }}
                                    >
                                      {option.label}
                                      {sortOption === option.id && <CheckCircle size={14} />}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '600px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1.5fr 70px 100px 100px 100px 70px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>Product Name</span>
                              <span>Ticker</span>
                              <span>Platform</span>
                              <span>Networks</span>
                              <span style={{ textAlign: 'right' }}>Market Cap</span>
                              <span style={{ textAlign: 'right' }}>7D APY</span>
                            </div>

                            {/* 产品列表 */}
                            {getFilteredAndSortedData(MOCK_DATA.treasuriesData.products).map((product, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.5fr 70px 100px 100px 100px 70px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.treasuriesData.products.length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#3B82F6', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                                  <p style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.issuer}</p>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>{product.ticker}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>{product.platform}</span>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {product.networks.slice(0, 3).map((n, ni) => (
                                    <span key={ni} style={{
                                      fontSize: '9px',
                                      fontWeight: 700,
                                      backgroundColor: '#EFF6FF',
                                      color: '#3B82F6',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>{n}</span>
                                  ))}
                                  {product.networks.length > 3 && (
                                    <span style={{ fontSize: '9px', color: '#94A3B8' }}>+{product.networks.length - 3}</span>
                                  )}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right' }}>
                                  ${product.marketCap >= 1e9 ? (product.marketCap / 1e9).toFixed(2) + 'B' : (product.marketCap / 1e6).toFixed(1) + 'M'} ▲
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right', color: product.apy > 0 ? '#10B981' : '#94A3B8' }}>
                                  {product.apy > 0 ? product.apy.toFixed(2) + '%' : '—'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : selectedCategory.id === 'commodities' ? (
                    /* Commodities 专属视图 */
                    <>
                      {/* 页面头部 */}
                      <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Tokenized Commodities</h1>
                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
                          {MOCK_DATA.commoditiesData.description}
                        </p>
                      </div>

                      {/* 核心指标 */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        {MOCK_DATA.commoditiesData.metrics.map((metric, i) => (
                          <div key={i} style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '20px',
                            border: '1px solid #F1F2F4'
                          }}>
                            <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {metric.label} <span style={{ opacity: 0.5, cursor: 'help' }}>ⓘ</span>
                            </p>
                            <p style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>{metric.value}</p>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: metric.trend === 'up' ? '#10B981' : '#EF4444' }}>
                              {metric.trend === 'up' ? '▲' : '▼'} {metric.change.replace(/[+-]/, '')} from 30d ago
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Market Caps 分布 */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Market Caps</h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', padding: '8px 16px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>GROUP BY</span>
                            <span style={{ fontSize: '14px', fontWeight: 700 }}>Network ▼</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          {MOCK_DATA.commoditiesData.marketCapsByNetwork.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                              <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.network}</span>
                              <span style={{ fontSize: '13px', color: '#64748B' }}>
                                ${item.value >= 1e9 ? (item.value / 1e9).toFixed(1) + 'B' : (item.value / 1e6).toFixed(1) + 'M'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Entities Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden',
                        marginBottom: '24px'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Top Entities</h2>
                        </div>

                        {/* 表格标签栏 - 只有 Managers 和 Networks */}
                        <div style={{
                          display: 'flex',
                          gap: '24px',
                          padding: '0 24px 12px 24px',
                          borderBottom: '1px solid #F1F2F4',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}>
                          {[
                            { id: 'managers', label: 'Managers' },
                            { id: 'networks', label: 'Networks' }
                          ].map(tab => (
                            <span
                              key={tab.id}
                              onClick={() => setCommoditiesTab(tab.id)}
                              style={{
                                fontSize: '13px',
                                fontWeight: commoditiesTab === tab.id ? 800 : 700,
                                color: commoditiesTab === tab.id ? '#3B82F6' : '#94A3B8',
                                borderBottom: commoditiesTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                                paddingBottom: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              {tab.label}
                            </span>
                          ))}
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '500px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>#</span>
                              <span>{commoditiesTab === 'managers' ? 'Manager' : 'Network'}</span>
                              <span style={{ textAlign: 'center' }}>RWA Count</span>
                              <span style={{ textAlign: 'right' }}>Total Value ▼</span>
                              <span style={{ textAlign: 'right' }}>30D%</span>
                              <span style={{ textAlign: 'right' }}>Market Share</span>
                            </div>

                            {/* 表格数据 */}
                            {MOCK_DATA.commoditiesData.topEntities[commoditiesTab].map((row, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.commoditiesData.topEntities[commoditiesTab].length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8' }}>{row.rank}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '20px' }}>{row.logo}</span>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>{row.rwaCount}</span>
                                <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{row.totalValue}</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  textAlign: 'right',
                                  color: row.trend === 'up' ? '#10B981' : row.trend === 'down' ? '#EF4444' : '#94A3B8'
                                }}>
                                  {row.change30d ? (row.trend === 'up' ? '▲' : row.trend === 'down' ? '▼' : '') + row.change30d.replace(/[+-]/, '') : '—'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{row.marketShare}</span>
                                  <span style={{ color: row.trend === 'up' ? '#10B981' : row.trend === 'down' ? '#EF4444' : '#94A3B8' }}>
                                    {row.trend === 'up' ? '▲' : row.trend === 'down' ? '▼' : ''}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Commodity Products Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Commodity Products</h2>
                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>{MOCK_DATA.commoditiesData.products.length} Total</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                            {/* Platform Filter */}
                            <div style={{ position: 'relative' }} ref={platformFilterRef}>
                              <div
                                onClick={() => setShowPlatformFilter(!showPlatformFilter)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: showPlatformFilter || selectedPlatforms.length > 0 ? '#EFF6FF' : 'transparent',
                                  border: selectedPlatforms.length > 0 ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                <span style={{ fontSize: '13px', fontWeight: 600, color: selectedPlatforms.length > 0 ? '#3B82F6' : '#64748B' }}>
                                  {selectedPlatforms.length > 0 ? `${selectedPlatforms.length} Platforms` : 'All platforms'}
                                </span>
                                <Plus size={14} color={selectedPlatforms.length > 0 ? '#3B82F6' : "#64748B"} style={{ transform: showPlatformFilter ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
                              </div>

                              {showPlatformFilter && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  transform: 'translateY(4px)',
                                  backgroundColor: 'white',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                  border: '1px solid #F1F2F4',
                                  padding: '12px',
                                  zIndex: 60,
                                  minWidth: '240px',
                                }}>
                                  <div style={{ paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid #F1F2F4' }}>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: '8px 12px',
                                      backgroundColor: '#F8FAFC',
                                      borderRadius: '8px',
                                      marginBottom: '8px'
                                    }}>
                                      <Search size={14} color="#94A3B8" />
                                      <input
                                        type="text"
                                        placeholder="Search platforms..."
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          border: 'none',
                                          background: 'transparent',
                                          outline: 'none',
                                          fontSize: '13px',
                                          marginLeft: '8px',
                                          width: '100%',
                                          color: '#1E293B'
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {availablePlatforms.map(platform => (
                                      <div
                                        key={platform.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (selectedPlatforms.includes(platform.name)) {
                                            setSelectedPlatforms(prev => prev.filter(p => p !== platform.name));
                                          } else {
                                            setSelectedPlatforms(prev => [...prev, platform.name]);
                                          }
                                        }}
                                        style={{
                                          padding: '8px 12px',
                                          fontSize: '13px',
                                          fontWeight: 500,
                                          color: '#1E293B',
                                          borderRadius: '8px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          backgroundColor: selectedPlatforms.includes(platform.name) ? '#EFF6FF' : 'transparent',
                                          marginBottom: '2px'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <div style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '4px',
                                            border: selectedPlatforms.includes(platform.name) ? 'none' : '1px solid #CBD5E1',
                                            backgroundColor: selectedPlatforms.includes(platform.name) ? '#3B82F6' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}>
                                            {selectedPlatforms.includes(platform.name) && <CheckCircle size={10} color="white" />}
                                          </div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>{platform.icon}</span>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{platform.name}</span>
                                          </div>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#94A3B8', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{platform.count}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Sort Dropdown */}
                            <div style={{ position: 'relative' }} ref={sortMenuRef}>
                              <div
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: showSortMenu ? '#F1F5F9' : 'transparent',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Sort By</span>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1C1E' }}>
                                  {sortOptions.find(o => o.id === sortOption)?.label || 'Highest AUM'}
                                </span>
                                <ArrowUpDown size={14} color="#64748B" />
                              </div>

                              {showSortMenu && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  transform: 'translateY(4px)',
                                  backgroundColor: 'white',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                  border: '1px solid #F1F2F4',
                                  padding: '8px',
                                  zIndex: 50,
                                  minWidth: '180px',
                                }}>
                                  {sortOptions.map(option => (
                                    <div
                                      key={option.id}
                                      onClick={() => {
                                        setSortOption(option.id);
                                        setShowSortMenu(false);
                                      }}
                                      style={{
                                        padding: '10px 12px',
                                        fontSize: '13px',
                                        fontWeight: sortOption === option.id ? 700 : 500,
                                        color: sortOption === option.id ? '#3B82F6' : '#1E293B',
                                        backgroundColor: sortOption === option.id ? '#EFF6FF' : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                      }}
                                    >
                                      {option.label}
                                      {sortOption === option.id && <CheckCircle size={14} />}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '800px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1.5fr 70px 100px 80px 120px 90px 100px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>Name</span>
                              <span>Ticker</span>
                              <span>Platform</span>
                              <span>Networks</span>
                              <span>Pegged Commodity</span>
                              <span>Sectors</span>
                              <span style={{ textAlign: 'right' }}>Market Cap ▼</span>
                            </div>

                            {/* 产品列表 */}
                            {getFilteredAndSortedData(MOCK_DATA.commoditiesData.products).map((product, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.5fr 70px 100px 80px 120px 90px 100px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.commoditiesData.products.length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#3B82F6', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                                  <p style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.issuer}</p>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>{product.ticker}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>{product.platform}</span>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {product.networks.slice(0, 2).map((n, ni) => (
                                    <span key={ni} style={{
                                      fontSize: '9px',
                                      fontWeight: 700,
                                      backgroundColor: '#EFF6FF',
                                      color: '#3B82F6',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>{n}</span>
                                  ))}
                                  {product.networks.length > 2 && (
                                    <span style={{ fontSize: '9px', color: '#94A3B8' }}>+{product.networks.length - 2}</span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: product.sector === 'Precious Metals' ? '#F59E0B' : product.sector === 'Agriculture' ? '#10B981' : '#94A3B8' }}></span>
                                  <span style={{ fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.peggedCommodity}</span>
                                </div>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  backgroundColor: product.sector === 'Precious Metals' ? '#FEF3C7' : product.sector === 'Agriculture' ? '#D1FAE5' : '#F1F5F9',
                                  color: product.sector === 'Precious Metals' ? '#D97706' : product.sector === 'Agriculture' ? '#059669' : '#64748B',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>{product.sector}</span>
                                <span style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right' }}>
                                  ${product.marketCap >= 1e9 ? (product.marketCap / 1e9).toFixed(2) + 'B' : product.marketCap >= 1e6 ? (product.marketCap / 1e6).toFixed(1) + 'M' : product.marketCap.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : selectedCategory.id === 'stocks' ? (
                    /* Stocks 专属视图 */
                    <>
                      {/* 页面头部 */}
                      <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Tokenized Public Stocks</h1>
                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
                          {MOCK_DATA.stocksData.description}
                        </p>
                      </div>

                      {/* 核心指标 */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        {MOCK_DATA.stocksData.metrics.map((metric, i) => (
                          <div key={i} style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '20px',
                            border: '1px solid #F1F2F4'
                          }}>
                            <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {metric.label} <span style={{ opacity: 0.5, cursor: 'help' }}>ⓘ</span>
                            </p>
                            <p style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>{metric.value}</p>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: metric.trend === 'up' ? '#10B981' : '#EF4444' }}>
                              {metric.trend === 'up' ? '▲' : '▼'} {metric.change.replace(/[+-]/, '')} from 30d ago
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Total Value 分布 */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Total Value</h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', padding: '8px 16px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>GROUP BY</span>
                            <span style={{ fontSize: '14px', fontWeight: 700 }}>Network ▼</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          {MOCK_DATA.stocksData.totalValueByNetwork.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                              <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.network}</span>
                              <span style={{ fontSize: '13px', color: '#64748B' }}>
                                ${item.value >= 1e9 ? (item.value / 1e9).toFixed(1) + 'B' : item.value >= 1e6 ? (item.value / 1e6).toFixed(1) + 'M' : item.value.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* League Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden',
                        marginBottom: '24px'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Tokenized Public Stocks League Table</h2>
                        </div>

                        {/* 表格标签栏 - Platforms, Underlying Stock, Networks */}
                        <div style={{
                          display: 'flex',
                          gap: '24px',
                          padding: '0 24px 12px 24px',
                          borderBottom: '1px solid #F1F2F4',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}>
                          {[
                            { id: 'platforms', label: 'Platforms' },
                            { id: 'underlyingStock', label: 'Underlying Stock' },
                            { id: 'networks', label: 'Networks' }
                          ].map(tab => (
                            <span
                              key={tab.id}
                              onClick={() => setStocksTab(tab.id)}
                              style={{
                                fontSize: '13px',
                                fontWeight: stocksTab === tab.id ? 800 : 700,
                                color: stocksTab === tab.id ? '#3B82F6' : '#94A3B8',
                                borderBottom: stocksTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                                paddingBottom: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              {tab.label}
                            </span>
                          ))}
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '500px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>#</span>
                              <span>{stocksTab === 'platforms' ? 'Platform' : stocksTab === 'underlyingStock' ? 'Stock' : 'Network'}</span>
                              <span style={{ textAlign: 'center' }}>RWA Co...</span>
                              <span style={{ textAlign: 'right' }}>Total Value ▼</span>
                              <span style={{ textAlign: 'right' }}>30D%</span>
                              <span style={{ textAlign: 'right' }}>Market Share</span>
                            </div>

                            {/* 表格数据 */}
                            {MOCK_DATA.stocksData.leagueTable[stocksTab].map((row, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.stocksData.leagueTable[stocksTab].length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8' }}>{row.rank}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '20px' }}>{row.logo}</span>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>{row.rwaCount}</span>
                                <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{row.totalValue}</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  textAlign: 'right',
                                  color: row.trend === 'up' ? '#10B981' : '#EF4444'
                                }}>
                                  {row.trend === 'up' ? '▲' : '▼'}{row.change30d.replace(/[+-]/, '')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{row.marketShare}</span>
                                  <span style={{ color: row.trend === 'up' ? '#10B981' : '#EF4444' }}>
                                    {row.trend === 'up' ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Stock Products Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Tokenized Public Stocks</h2>
                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>389 results</span>
                          </div>
                        </div>

                        {/* 筛选器 */}
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '0 24px 16px 24px',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch'
                        }}>
                          {['Platform', 'Network', 'Domicile'].map((filter) => (
                            <div key={filter} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              backgroundColor: '#F8FAFC',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#64748B',
                              whiteSpace: 'nowrap'
                            }}>
                              {filter} <span style={{ fontSize: '10px' }}>▼</span>
                            </div>
                          ))}
                          <span style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 600, padding: '8px 0', cursor: 'pointer' }}>Clear Filters</span>
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '800px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1.5fr 70px 100px 80px 100px 1fr 80px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>Name</span>
                              <span>Ticker</span>
                              <span>Platform</span>
                              <span>Networks</span>
                              <span style={{ textAlign: 'right' }}>Total Value ▼</span>
                              <span>Underlying Asset</span>
                              <span style={{ textAlign: 'right' }}>NAV</span>
                            </div>

                            {/* 产品列表 */}
                            {MOCK_DATA.stocksData.products.map((product, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.5fr 70px 100px 80px 100px 1fr 80px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.stocksData.products.length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#3B82F6', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                                  <p style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.issuer}</p>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>{product.ticker}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>{product.platform}</span>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {product.networks.slice(0, 2).map((n, ni) => (
                                    <span key={ni} style={{
                                      fontSize: '9px',
                                      fontWeight: 700,
                                      backgroundColor: '#EFF6FF',
                                      color: '#3B82F6',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>{n}</span>
                                  ))}
                                  {product.networks.length > 2 && (
                                    <span style={{ fontSize: '9px', color: '#94A3B8' }}>+{product.networks.length - 2}</span>
                                  )}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right' }}>
                                  ${product.totalValue >= 1e9 ? (product.totalValue / 1e9).toFixed(2) + 'B' : product.totalValue >= 1e6 ? (product.totalValue / 1e6).toFixed(1) + 'M' : product.totalValue.toLocaleString()} ▲
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '16px' }}>💎</span>
                                  <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.underlyingAsset}</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right', color: '#10B981' }}>
                                  ${product.nav.toFixed(2)} ▲
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : selectedCategory.id === 'non-us-govt-debt' ? (
                    /* Non-US Govt Debt 专属视图 */
                    <>
                      {/* 页面头部 */}
                      <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Tokenized Non-U.S. Government Debt</h1>
                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
                          {MOCK_DATA.nonUsGovtDebtData.description}
                        </p>
                      </div>

                      {/* 核心指标 */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        {MOCK_DATA.nonUsGovtDebtData.metrics.map((metric, i) => (
                          <div key={i} style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '20px',
                            border: '1px solid #F1F2F4'
                          }}>
                            <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {metric.label} <span style={{ opacity: 0.5, cursor: 'help' }}>ⓘ</span>
                            </p>
                            <p style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>{metric.value}</p>
                            {metric.change && (
                              <p style={{ fontSize: '12px', fontWeight: 700, color: metric.trend === 'up' ? '#10B981' : '#EF4444' }}>
                                {metric.trend === 'up' ? '▲' : '▼'} {metric.change.replace(/[+-]/, '')} from 7d ago
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Total Value 分布 */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Total Value</h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', padding: '8px 16px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>GROUP BY</span>
                            <span style={{ fontSize: '14px', fontWeight: 700 }}>Asset ▼</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {MOCK_DATA.nonUsGovtDebtData.totalValueByAsset.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                              <span style={{ fontSize: '13px', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.asset}</span>
                              <span style={{ fontSize: '13px', color: '#64748B' }}>
                                ${item.value >= 1e9 ? (item.value / 1e9).toFixed(1) + 'B' : (item.value / 1e6).toFixed(1) + 'M'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Entities Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden',
                        marginBottom: '24px'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Top Entities</h2>
                        </div>

                        {/* 表格标签栏 */}
                        <div style={{
                          display: 'flex',
                          gap: '24px',
                          padding: '0 24px 12px 24px',
                          borderBottom: '1px solid #F1F2F4',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}>
                          {[
                            { id: 'platforms', label: 'Platforms' },
                            { id: 'managers', label: 'Managers' },
                            { id: 'networks', label: 'Networks' },
                            { id: 'jurisdictions', label: 'Jurisdiction Country' }
                          ].map(tab => (
                            <span
                              key={tab.id}
                              onClick={() => setNonUsDebtTab(tab.id)}
                              style={{
                                fontSize: '13px',
                                fontWeight: nonUsDebtTab === tab.id ? 800 : 700,
                                color: nonUsDebtTab === tab.id ? '#3B82F6' : '#94A3B8',
                                borderBottom: nonUsDebtTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                                paddingBottom: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              {tab.label}
                            </span>
                          ))}
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '500px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>#</span>
                              <span>{nonUsDebtTab === 'platforms' ? 'Platform' : nonUsDebtTab === 'managers' ? 'Manager' : nonUsDebtTab === 'networks' ? 'Network' : 'Jurisdiction'}</span>
                              <span style={{ textAlign: 'center' }}>RWA Co...</span>
                              <span style={{ textAlign: 'right' }}>Total Value ▼</span>
                              <span style={{ textAlign: 'right' }}>30D%</span>
                              <span style={{ textAlign: 'right' }}>Market Share</span>
                            </div>

                            {/* 表格数据 */}
                            {MOCK_DATA.nonUsGovtDebtData.topEntities[nonUsDebtTab].map((row, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.nonUsGovtDebtData.topEntities[nonUsDebtTab].length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8' }}>{row.rank}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '20px' }}>{row.logo}</span>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>{row.rwaCount}</span>
                                <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{row.totalValue}</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  textAlign: 'right',
                                  color: row.trend === 'up' ? '#10B981' : '#EF4444'
                                }}>
                                  {row.trend === 'up' ? '▲' : '▼'}{row.change30d.replace(/[+-]/, '')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{row.marketShare}</span>
                                  <span style={{ color: row.trend === 'up' ? '#10B981' : '#EF4444' }}>
                                    {row.trend === 'up' ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Products Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Non-U.S. Government Debt Products</h2>
                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>{MOCK_DATA.nonUsGovtDebtData.products.length} Total</span>
                          </div>
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '800px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1.5fr 70px 100px 80px 100px 120px 60px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>Product Name</span>
                              <span>Ticker</span>
                              <span>Platform</span>
                              <span>Networks</span>
                              <span style={{ textAlign: 'right' }}>Market Cap ▼</span>
                              <span>Eligible Investors</span>
                              <span style={{ textAlign: 'right' }}>Holders</span>
                            </div>

                            {/* 产品列表 */}
                            {MOCK_DATA.nonUsGovtDebtData.products.map((product, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.5fr 70px 100px 80px 100px 120px 60px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.nonUsGovtDebtData.products.length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#3B82F6', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                                  <p style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.issuer}</p>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>{product.ticker}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>{product.platform}</span>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {product.networks.slice(0, 2).map((n, ni) => (
                                    <span key={ni} style={{
                                      fontSize: '9px',
                                      fontWeight: 700,
                                      backgroundColor: '#EFF6FF',
                                      color: '#3B82F6',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>{n}</span>
                                  ))}
                                  {product.networks.length > 2 && (
                                    <span style={{ fontSize: '9px', color: '#94A3B8' }}>+{product.networks.length - 2}</span>
                                  )}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right' }}>
                                  ${product.marketCap >= 1e9 ? (product.marketCap / 1e9).toFixed(2) + 'B' : product.marketCap >= 1e6 ? (product.marketCap / 1e6).toFixed(1) + 'M' : product.marketCap.toLocaleString()}
                                </span>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  backgroundColor: product.eligibleInvestors === '—' ? '#F1F5F9' : '#EFF6FF',
                                  color: product.eligibleInvestors === '—' ? '#64748B' : '#3B82F6',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>{product.eligibleInvestors}</span>
                                <span style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right' }}>{product.holders}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : selectedCategory.id === 'private-credit' ? (
                    /* Private Credit 专属视图 */
                    <>
                      {/* 页面头部 */}
                      <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Tokenized Private Credit</h1>
                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
                          {MOCK_DATA.privateCreditData.description}
                        </p>
                      </div>

                      {/* 核心指标 */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        {MOCK_DATA.privateCreditData.metrics.map((metric, i) => (
                          <div key={i} style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '20px',
                            border: '1px solid #F1F2F4'
                          }}>
                            <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {metric.label} <span style={{ opacity: 0.5, cursor: 'help' }}>ⓘ</span>
                            </p>
                            <p style={{ fontSize: '22px', fontWeight: 900 }}>{metric.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Private Credit Platforms Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden',
                        marginBottom: '24px'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Private Credit Platforms</h2>
                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>{MOCK_DATA.privateCreditData.platforms.length} Total</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748B', padding: '0 24px 16px 24px' }}>Compare KPIs across major and upcoming RWA platforms.</p>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '800px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 100px 120px 120px 90px 120px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>Protocol</span>
                              <span>Networks</span>
                              <span style={{ textAlign: 'right' }}>Total Loans ⓘ</span>
                              <span style={{ textAlign: 'right' }}>Active Loans ⓘ ▼</span>
                              <span style={{ textAlign: 'right' }}>Avg. Base APY ⓘ</span>
                              <span style={{ textAlign: 'right' }}>Defaulted Loans ⓘ</span>
                            </div>

                            {/* 平台列表 */}
                            {MOCK_DATA.privateCreditData.platforms.map((platform, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 100px 120px 120px 90px 120px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.privateCreditData.platforms.length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '18px' }}>🔵</span>
                                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{platform.protocol}</span>
                                  <span style={{ fontSize: '12px', cursor: 'pointer' }}>🔗</span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {platform.networks.map((n, ni) => (
                                    <span key={ni} style={{
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      backgroundColor: '#EFF6FF',
                                      color: '#3B82F6',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>{n}</span>
                                  ))}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>
                                  ${platform.totalLoans >= 1e9 ? (platform.totalLoans / 1e9).toFixed(2) + 'B' : (platform.totalLoans / 1e6).toFixed(0) + 'M'}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>
                                  ${platform.activeLoans >= 1e9 ? (platform.activeLoans / 1e9).toFixed(2) + 'B' : platform.activeLoans >= 1e6 ? (platform.activeLoans / 1e6).toFixed(0) + 'M' : platform.activeLoans.toLocaleString()}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>{platform.avgBaseAPY}</span>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>
                                  {platform.defaultedLoans === '—' ? '—' : platform.defaultedLoans === 0 ? '$0' : '$' + (platform.defaultedLoans / 1e6).toFixed(0) + 'M'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pools Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Pools</h2>
                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>62 Total</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748B', padding: '0 24px 16px 24px' }}>View individual pools underlying various RWA deals.</p>

                        {/* 筛选器 */}
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '0 24px 16px 24px',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch'
                        }}>
                          {['Protocol', 'Network', 'Currency', 'Status'].map((filter) => (
                            <div key={filter} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              backgroundColor: '#F8FAFC',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#64748B',
                              whiteSpace: 'nowrap'
                            }}>
                              {filter} <span style={{ fontSize: '10px' }}>▼</span>
                            </div>
                          ))}
                          <span style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 600, padding: '8px 0', cursor: 'pointer' }}>Clear Filters</span>
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '900px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '100px 90px 1.2fr 70px 70px 60px 110px 100px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>Platform</span>
                              <span>Network</span>
                              <span>Name</span>
                              <span>Currency</span>
                              <span>Status</span>
                              <span style={{ textAlign: 'right' }}>APY</span>
                              <span style={{ textAlign: 'right' }}>Principal Out... ▼</span>
                              <span style={{ textAlign: 'right' }}>Defaulted Amt</span>
                            </div>

                            {/* Pools 列表 */}
                            {MOCK_DATA.privateCreditData.pools.map((pool, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '100px 90px 1.2fr 70px 70px 60px 110px 100px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.privateCreditData.pools.length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '14px' }}>🔵</span>
                                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{pool.platform}</span>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3B82F6' }}>{pool.network}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pool.name}</span>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  backgroundColor: pool.currency !== '—' ? '#EFF6FF' : '#F1F5F9',
                                  color: pool.currency !== '—' ? '#3B82F6' : '#94A3B8',
                                  padding: '3px 6px',
                                  borderRadius: '4px'
                                }}>{pool.currency}</span>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: pool.status === 'OPEN' ? '#10B981' : pool.status === 'FULL' ? '#F59E0B' : '#94A3B8'
                                }}>{pool.status}</span>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>{pool.apy}</span>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>
                                  ${pool.principalOutstanding >= 1e9 ? (pool.principalOutstanding / 1e9).toFixed(2) + 'B' : pool.principalOutstanding >= 1e6 ? (pool.principalOutstanding / 1e6).toFixed(0) + 'M' : pool.principalOutstanding.toLocaleString()}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>
                                  {pool.defaultedAmount === '—' ? '—' : '$' + (pool.defaultedAmount / 1e6).toFixed(1) + 'M'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : selectedCategory.id === 'institutional-funds' ? (
                    /* Institutional Funds 专属视图 */
                    <>
                      {/* 页面头部 */}
                      <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Institutional Alternative Funds</h1>
                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
                          {MOCK_DATA.institutionalFundsData.description}
                        </p>
                      </div>

                      {/* 核心指标 */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        {MOCK_DATA.institutionalFundsData.metrics.map((metric, i) => (
                          <div key={i} style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '20px',
                            border: '1px solid #F1F2F4'
                          }}>
                            <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {metric.label} <span style={{ opacity: 0.5, cursor: 'help' }}>ⓘ</span>
                            </p>
                            <p style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>{metric.value}</p>
                            {metric.change && (
                              <p style={{ fontSize: '12px', fontWeight: 700, color: metric.trend === 'up' ? '#10B981' : metric.trend === 'down' ? '#EF4444' : '#64748B' }}>
                                {metric.trend === 'up' ? '▲' : metric.trend === 'down' ? '▼' : ''} {metric.change.replace(/[+-]/, '')} from 30d ago
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Total Value 分布 */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Institutional Funds Total Value</h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', padding: '8px 16px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>GROUP BY</span>
                            <span style={{ fontSize: '14px', fontWeight: 700 }}>Network ▼</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          {MOCK_DATA.institutionalFundsData.totalValueByNetwork.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                              <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.network}</span>
                              <span style={{ fontSize: '13px', color: '#64748B' }}>
                                ${item.value >= 1e9 ? (item.value / 1e9).toFixed(1) + 'B' : (item.value / 1e6).toFixed(1) + 'M'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* League Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden',
                        marginBottom: '24px'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Institutional Funds League Table</h2>
                        </div>

                        {/* 表格标签栏 */}
                        <div style={{
                          display: 'flex',
                          gap: '24px',
                          padding: '0 24px 12px 24px',
                          borderBottom: '1px solid #F1F2F4',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}>
                          {[
                            { id: 'platforms', label: 'Platforms' },
                            { id: 'managers', label: 'Managers' },
                            { id: 'networks', label: 'Networks' },
                            { id: 'jurisdictions', label: 'Jurisdiction Country' }
                          ].map(tab => (
                            <span
                              key={tab.id}
                              onClick={() => setInstitutionalFundsTab(tab.id)}
                              style={{
                                fontSize: '13px',
                                fontWeight: institutionalFundsTab === tab.id ? 800 : 700,
                                color: institutionalFundsTab === tab.id ? '#3B82F6' : '#94A3B8',
                                borderBottom: institutionalFundsTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                                paddingBottom: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              {tab.label}
                            </span>
                          ))}
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '500px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>#</span>
                              <span>{institutionalFundsTab === 'platforms' ? 'Platform' : institutionalFundsTab === 'managers' ? 'Manager' : institutionalFundsTab === 'networks' ? 'Network' : 'Jurisdiction'}</span>
                              <span style={{ textAlign: 'center' }}>RWA Count</span>
                              <span style={{ textAlign: 'right' }}>Total Value ▼</span>
                              <span style={{ textAlign: 'right' }}>30D%</span>
                              <span style={{ textAlign: 'right' }}>Market Share</span>
                            </div>

                            {/* 表格数据 */}
                            {MOCK_DATA.institutionalFundsData.leagueTable[institutionalFundsTab].map((row, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.institutionalFundsData.leagueTable[institutionalFundsTab].length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8' }}>{row.rank}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '20px' }}>{row.logo}</span>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>{row.rwaCount}</span>
                                <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{row.totalValue}</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  textAlign: 'right',
                                  color: row.trend === 'up' ? '#10B981' : row.trend === 'down' ? '#EF4444' : '#64748B'
                                }}>
                                  {row.trend === 'up' ? '▲' : row.trend === 'down' ? '▼' : ''}{row.change30d.replace(/[+-]/, '')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{row.marketShare}</span>
                                  <span style={{ color: row.trend === 'up' ? '#10B981' : row.trend === 'down' ? '#EF4444' : '#64748B' }}>
                                    {row.trend === 'up' ? '▲' : row.trend === 'down' ? '▼' : ''}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Institutional Funds Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Institutional Funds</h2>
                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>{MOCK_DATA.institutionalFundsData.funds.length} Total</span>
                          </div>
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '900px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1.5fr 70px 100px 80px 100px 70px 60px 100px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>Product Name</span>
                              <span>Ticker</span>
                              <span>Platform</span>
                              <span>Networks</span>
                              <span style={{ textAlign: 'right' }}>Market Cap ▼</span>
                              <span style={{ textAlign: 'right' }}>NAV ⓘ</span>
                              <span style={{ textAlign: 'right' }}>Holders</span>
                              <span>Sectors</span>
                            </div>

                            {/* Funds 列表 */}
                            {MOCK_DATA.institutionalFundsData.funds.map((fund, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.5fr 70px 100px 80px 100px 70px 60px 100px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.institutionalFundsData.funds.length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#3B82F6', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fund.name}</p>
                                  <p style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fund.issuer}</p>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>{fund.ticker}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>{fund.platform}</span>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {fund.networks.slice(0, 2).map((n, ni) => (
                                    <span key={ni} style={{
                                      fontSize: '9px',
                                      fontWeight: 700,
                                      backgroundColor: '#EFF6FF',
                                      color: '#3B82F6',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>{n}</span>
                                  ))}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right' }}>
                                  ${fund.marketCap >= 1e9 ? (fund.marketCap / 1e9).toFixed(2) + 'B' : fund.marketCap >= 1e6 ? (fund.marketCap / 1e6).toFixed(1) + 'M' : fund.marketCap.toLocaleString()}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right', color: '#10B981' }}>
                                  ${fund.nav >= 100 ? fund.nav.toLocaleString() : fund.nav.toFixed(2)} ▲
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>{fund.holders.toLocaleString()}</span>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  backgroundColor: fund.sector !== '—' ? '#EFF6FF' : '#F1F5F9',
                                  color: fund.sector !== '—' ? '#3B82F6' : '#94A3B8',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>{fund.sector}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : selectedCategory.id === 'corporate-bonds' ? (
                    /* Corporate Bonds 专属视图 */
                    <>
                      {/* 页面头部 */}
                      <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Tokenized Corporate Bonds</h1>
                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
                          {MOCK_DATA.corporateBondsData.description}
                        </p>
                      </div>

                      {/* 核心指标 */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        {MOCK_DATA.corporateBondsData.metrics.map((metric, i) => (
                          <div key={i} style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '20px',
                            border: '1px solid #F1F2F4'
                          }}>
                            <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {metric.label} <span style={{ opacity: 0.5, cursor: 'help' }}>ⓘ</span>
                            </p>
                            <p style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>{metric.value}</p>
                            {metric.change && (
                              <p style={{ fontSize: '12px', fontWeight: 700, color: metric.trend === 'up' ? '#10B981' : '#EF4444' }}>
                                {metric.trend === 'up' ? '▲' : '▼'} {metric.change.replace(/[+-]/, '')} from 7d ago
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Total Value 分布 */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h2 style={{ fontSize: '20px', fontWeight: 900 }}>Total Value</h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', padding: '8px 16px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>GROUP BY</span>
                            <span style={{ fontSize: '14px', fontWeight: 700 }}>Asset ▼</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {MOCK_DATA.corporateBondsData.totalValueByAsset.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                              <span style={{ fontSize: '13px', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.asset}</span>
                              <span style={{ fontSize: '13px', color: '#64748B' }}>
                                ${item.value >= 1e9 ? (item.value / 1e9).toFixed(1) + 'B' : (item.value / 1e6).toFixed(1) + 'M'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Entities Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden',
                        marginBottom: '24px'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px' }}>
                          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Top Entities</h2>
                        </div>

                        {/* 表格标签栏 */}
                        <div style={{
                          display: 'flex',
                          gap: '24px',
                          padding: '0 24px 12px 24px',
                          borderBottom: '1px solid #F1F2F4',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}>
                          {[
                            { id: 'platforms', label: 'Platforms' },
                            { id: 'managers', label: 'Managers' },
                            { id: 'networks', label: 'Networks' },
                            { id: 'jurisdictions', label: 'Jurisdiction Country' }
                          ].map(tab => (
                            <span
                              key={tab.id}
                              onClick={() => setCorporateBondsTab(tab.id)}
                              style={{
                                fontSize: '13px',
                                fontWeight: corporateBondsTab === tab.id ? 800 : 700,
                                color: corporateBondsTab === tab.id ? '#3B82F6' : '#94A3B8',
                                borderBottom: corporateBondsTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
                                paddingBottom: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
                            >
                              {tab.label}
                            </span>
                          ))}
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '500px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>#</span>
                              <span>{corporateBondsTab === 'platforms' ? 'Platform' : corporateBondsTab === 'managers' ? 'Manager' : corporateBondsTab === 'networks' ? 'Network' : 'Jurisdiction'}</span>
                              <span style={{ textAlign: 'center' }}>RWA Count</span>
                              <span style={{ textAlign: 'right' }}>Total Value ▼</span>
                              <span style={{ textAlign: 'right' }}>30D%</span>
                              <span style={{ textAlign: 'right' }}>Market Share</span>
                            </div>

                            {/* 表格数据 */}
                            {MOCK_DATA.corporateBondsData.topEntities[corporateBondsTab].map((row, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '40px 1fr 70px 90px 80px 90px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.corporateBondsData.topEntities[corporateBondsTab].length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8' }}>{row.rank}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '20px' }}>{row.logo}</span>
                                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>{row.rwaCount}</span>
                                <span style={{ fontSize: '14px', fontWeight: 800, textAlign: 'right' }}>{row.totalValue}</span>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  textAlign: 'right',
                                  color: row.trend === 'up' ? '#10B981' : row.trend === 'down' ? '#EF4444' : '#64748B'
                                }}>
                                  {row.trend === 'up' ? '▲' : row.trend === 'down' ? '▼' : ''}{row.change30d.replace(/[+-]/, '')}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{row.marketShare}</span>
                                  <span style={{ color: row.trend === 'up' ? '#10B981' : row.trend === 'down' ? '#EF4444' : '#64748B' }}>
                                    {row.trend === 'up' ? '▲' : row.trend === 'down' ? '▼' : ''}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Corporate Bond Products Table */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        border: '1px solid #F1F2F4',
                        overflow: 'hidden'
                      }}>
                        <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Corporate Bond Products</h2>
                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>{MOCK_DATA.corporateBondsData.products.length} Total</span>
                          </div>
                        </div>

                        {/* 可滚动的表格区域 */}
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <div style={{ minWidth: '1100px' }}>
                            {/* 表头 */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1.3fr 70px 100px 80px 100px 120px 60px 130px 130px',
                              gap: '8px',
                              padding: '12px 24px',
                              backgroundColor: '#F8FAFC',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase'
                            }}>
                              <span>Product Name</span>
                              <span>Ticker</span>
                              <span>Platform</span>
                              <span>Networks</span>
                              <span style={{ textAlign: 'right' }}>Market Cap ▼</span>
                              <span>Eligible Investors</span>
                              <span style={{ textAlign: 'right' }}>Holders</span>
                              <span>Domicile</span>
                              <span>License</span>
                            </div>

                            {/* Products 列表 */}
                            {MOCK_DATA.corporateBondsData.products.map((product, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1.3fr 70px 100px 80px 100px 120px 60px 130px 130px',
                                  gap: '8px',
                                  padding: '16px 24px',
                                  borderBottom: i < MOCK_DATA.corporateBondsData.products.length - 1 ? '1px solid #F8FAFC' : 'none',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#3B82F6', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                                  <p style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.issuer}</p>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>{product.ticker}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>{product.platform}</span>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {product.networks.slice(0, 2).map((n, ni) => (
                                    <span key={ni} style={{
                                      fontSize: '9px',
                                      fontWeight: 700,
                                      backgroundColor: '#EFF6FF',
                                      color: '#3B82F6',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>{n}</span>
                                  ))}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 800, textAlign: 'right' }}>
                                  ${product.marketCap >= 1e9 ? (product.marketCap / 1e9).toFixed(2) + 'B' : product.marketCap >= 1e6 ? (product.marketCap / 1e6).toFixed(1) + 'M' : product.marketCap.toLocaleString()}
                                </span>
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  backgroundColor: product.eligibleInvestors === '—' ? '#F1F5F9' : '#EFF6FF',
                                  color: product.eligibleInvestors === '—' ? '#64748B' : '#3B82F6',
                                  padding: '4px 6px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>{product.eligibleInvestors}</span>
                                <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>{product.holders.toLocaleString()}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '12px' }}>{product.domicile === 'Germany' ? '🇩🇪' : product.domicile === 'United States of America' ? '🇺🇸' : '🌐'}</span>
                                  <span style={{ fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.domicile}</span>
                                </div>
                                <span style={{ fontSize: '11px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.license}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 其他分类的通用视图 */
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #F1F2F4'
                        }}>
                          {categoryIcons[selectedCategory.id] && React.createElement(categoryIcons[selectedCategory.id], { size: 28, color: '#475569', strokeWidth: 1.5 })}
                        </div>
                        <div>
                          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>{selectedCategory.name}</h1>
                          <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                            {MOCK_DATA.assets.filter(a => a.categoryId === selectedCategory.id).length} 个产品
                          </p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                        <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>暂无产品</p>
                        <p style={{ fontSize: '14px' }}>该分类下的产品即将上线</p>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'screener' && (
            <motion.div key="screener" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Asset Screener 标题区域 */}
              <div style={{ padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: 900 }}>Asset Screener</h1>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 900 }}>BETA</span>
                </div>
                <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Discover and evaluate tokenized assets across key investment criteria and risk characteristics.</p>
              </div>

              {/* 过滤器容器 */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '32px', padding: '24px', border: '1px solid #F1F2F4' }}>
                {/* 1. 搜索与预设 */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Search size={18} color="#94A3B8" />
                    <input type="text" placeholder="Search assets..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', marginRight: '4px' }}>Presets</span>
                    {['Treasury Management', 'Yields', 'Growth'].map(p => (
                      <div key={p} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>{p}</div>
                    ))}
                  </div>
                </div>

                {/* 2. 核心参数矩阵 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Min. AUM ⓘ</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['$1M+', '$10M+', '$100M+', '$1B+'].map(a => (
                        <div key={a} style={{ flex: 1, padding: '12px', backgroundColor: a === '$10M+' ? '#EFF6FF' : 'white', border: a === '$10M+' ? '1px solid #3B82F6' : '1px solid #E2E8F0', borderRadius: '12px', fontSize: '12px', fontWeight: 900, textAlign: 'center', color: a === '$10M+' ? '#3B82F6' : '#64748B' }}>{a}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Yield Range</p>
                    <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      0.0% - 67.0% <ChevronRight size={14} style={{ rotate: '90deg' }} />
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Redemption</p>
                    <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B' }}>
                      Any period <ChevronRight size={14} style={{ rotate: '90deg' }} />
                    </div>
                  </div>
                </div>

                {/* 3. 合规与分类 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '24px' }}>

                  {/* Asset Class Filter - Block Layout */}
                  <div style={{ marginBottom: '16px', position: 'relative' }} ref={assetClassFilterRef}>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asset Class</p>

                    <div
                      onClick={() => setShowAssetClassFilter(!showAssetClassFilter)}
                      style={{
                        backgroundColor: 'white',
                        border: showAssetClassFilter ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        cursor: 'pointer',
                        minHeight: '48px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {selectedAssetClasses.length > 0 ? (
                        <>
                          {selectedAssetClasses.slice(0, 2).map((className) => {
                            const option = assetClassOptions.find(o => o.name === className);
                            const Icon = option?.icon;
                            return (
                              <div key={className} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#F1F5F9',
                                padding: '6px 10px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#1E293B'
                              }}>
                                {Icon && <Icon size={12} />}
                                {className}
                              </div>
                            );
                          })}
                          {selectedAssetClasses.length > 2 && (
                            <div style={{
                              padding: '6px 10px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#64748B',
                              backgroundColor: '#F8FAFC'
                            }}>
                              + {selectedAssetClasses.length - 2} more
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>Select asset classes...</span>
                      )}

                      <div style={{ marginLeft: 'auto' }}>
                        <ChevronRight size={16} color="#94A3B8" style={{ transform: showAssetClassFilter ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                    </div>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {showAssetClassFilter && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                            border: '1px solid #F1F2F4',
                            zIndex: 100,
                            padding: '16px',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Search */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 14px',
                            backgroundColor: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            marginBottom: '12px'
                          }}>
                            <Search size={16} color="#94A3B8" />
                            <input
                              type="text"
                              placeholder="Search classes..."
                              value={assetClassSearch}
                              onChange={(e) => setAssetClassSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                marginLeft: '10px',
                                fontSize: '14px',
                                fontWeight: 500,
                                width: '100%',
                                color: '#1E293B'
                              }}
                            />
                          </div>

                          {/* List */}
                          <div style={{ maxHeight: '280px', overflowY: 'auto', marginRight: '-8px', paddingRight: '8px' }} className="custom-scrollbar">
                            {filteredAssetClasses.map(item => {
                              const isSelected = selectedAssetClasses.includes(item.name);
                              const Icon = item.icon;

                              return (
                                <div
                                  key={item.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isSelected) {
                                      setSelectedAssetClasses(prev => prev.filter(c => c !== item.name));
                                    } else {
                                      setSelectedAssetClasses(prev => [...prev, item.name]);
                                    }
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? '#F8FAFC' : 'transparent',
                                    transition: 'background-color 0.1s',
                                    marginBottom: '4px'
                                  }}
                                  onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                                  onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '6px',
                                      backgroundColor: isSelected ? '#3B82F6' : 'white',
                                      border: isSelected ? 'none' : '2px solid #E2E8F0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s',
                                      flexShrink: 0
                                    }}>
                                      {isSelected && <CheckCircle size={14} color="white" fill="white" />}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      {Icon && <Icon size={16} className="text-slate-600" />}
                                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{item.name}</span>
                                    </div>
                                  </div>

                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: isSelected ? '#3B82F6' : '#94A3B8',
                                    backgroundColor: isSelected ? '#EFF6FF' : '#F1F5F9',
                                    padding: '2px 8px',
                                    borderRadius: '8px'
                                  }}>
                                    {item.count}
                                  </span>
                                </div>
                              );
                            })}

                            {filteredAssetClasses.length === 0 && (
                              <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                                No classes found
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div style={{
                            borderTop: '1px solid #F1F2F4',
                            marginTop: '12px',
                            paddingTop: '12px',
                            textAlign: 'center'
                          }}>
                            <span
                              onClick={(e) => { e.stopPropagation(); setSelectedAssetClasses([]); }}
                              style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', cursor: 'pointer' }}
                            >
                              Clear filters
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {['Issuer Jurisdiction', 'Network'].map(label => (
                    <div key={label} style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#94A3B8' }}>{label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#1A1C1E' }}>
                        {label === 'Asset Class' ? 'Public Equity + 8 more' : label === 'Network' ? 'All Networks' : 'Global (All)'}
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 底部排序与统计 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 16px', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⇅ Highest AUM ⌄
                    </div>
                    <span style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 800, cursor: 'pointer' }}>✕ Clear filters</span>
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: '#64748B' }}>{MOCK_DATA.assets.length} assets</span>
                </div>
              </div>

              {/* 资产结果列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {MOCK_DATA.assets.map((asset) => {
                  const isExpanded = expandedAssetId === asset.id;

                  return (
                    <motion.div
                      key={asset.id}
                      layout
                      initial={false}
                      style={{
                        backgroundColor: 'white',
                        border: isExpanded ? '1px solid #3B82F6' : '1px solid #F1F2F4',
                        borderRadius: '32px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: isExpanded ? '0 20px 40px rgba(59, 130, 246, 0.08)' : 'none'
                      }}
                      onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                    >
                      {/* Header Area */}
                      <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                          <div style={{ width: '56px', height: '56px', backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F1F2F4' }}>
                            <img src={asset.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                              <h4 style={{ fontSize: '20px', fontWeight: 900, marginBottom: 0 }}>{asset.name}</h4>
                              <span style={{ fontSize: '10px', fontWeight: 900, backgroundColor: '#EFF6FF', color: '#3B82F6', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>{asset.category}</span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 700 }}>by {asset.provider}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', marginBottom: '2px' }}>30D APY</p>
                            <p style={{ fontSize: '18px', fontWeight: 900, color: '#10B981' }}>{asset.apy > 0 ? `${asset.apy}%` : '—'}</p>
                          </div>
                          <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            <ChevronRight size={20} color="#94A3B8" />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 32px 32px 32px', borderTop: '1px solid #F1F2F4', paddingTop: '32px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px' }}>💰 AUM</p>
                                  <p style={{ fontSize: '18px', fontWeight: 900 }}>${(asset.tvl / 1e6).toFixed(0)}M</p>
                                </div>
                                <div>
                                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px' }}>👥 INVESTORS</p>
                                  <p style={{ fontSize: '18px', fontWeight: 900 }}>{asset.investors.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px' }}>🕒 REDEMPTION</p>
                                  <p style={{ fontSize: '18px', fontWeight: 900 }}>{asset.redemption}</p>
                                </div>
                                <div>
                                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#94A3B8', marginBottom: '8px' }}>⚖️ MIN. INVEST</p>
                                  <p style={{ fontSize: '18px', fontWeight: 900 }}>${asset.minInvestment ? (asset.minInvestment / 1000).toFixed(0) + 'K' : '—'}</p>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '16px' }}>
                                  <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', marginBottom: '4px' }}>MGMT FEE</p>
                                  <p style={{ fontSize: '14px', fontWeight: 800 }}>{asset.mgmtFee > 0 ? `${asset.mgmtFee}%` : '—'}</p>
                                </div>
                                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '16px' }}>
                                  <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', marginBottom: '4px' }}>JURISDICTION</p>
                                  <p style={{ fontSize: '14px', fontWeight: 800 }}>{asset.jurisdiction}</p>
                                </div>
                              </div>

                              <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, lineHeight: '1.6', marginBottom: '24px' }}>{asset.description}</p>

                              <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedAsset(asset); }}
                                  style={{ flex: 1, backgroundColor: '#000', color: '#FFF', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                  Invest Now <ArrowUpRight size={18} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedAsset(asset); }}
                                  style={{ flex: 1, backgroundColor: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: 900 }}
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'portfolio' && (
            <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ backgroundColor: '#000', padding: '32px', borderRadius: '32px', color: '#FFF', marginBottom: '24px' }}>
                <p style={{ fontSize: '10px', fontWeight: 900, opacity: 0.5, letterSpacing: '2px', marginBottom: '4px' }}>ESTIMATED BALANCE</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <h2 style={{ fontSize: '36px', fontWeight: 900, fontStyle: 'italic' }}>${MOCK_DATA.user.portfolio.totalValue.toLocaleString()}</h2>
                  <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 900 }}>+2.4%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', opacity: 0.3, fontSize: '9px', fontWeight: 900 }}>
                  <span>{userData?.address?.slice(0, 10)}...{userData?.address?.slice(-8)}</span>
                  <Share2 size={16} />
                </div>
              </div>

              {MOCK_DATA.user.portfolio.assets.map((hold, i) => (
                <div key={i} style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#FFF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F1F2F4' }}>
                      <Layers size={20} color="#10B981" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 900 }}>{hold.name}</p>
                      <p style={{ fontSize: '10px', fontWeight: 900, color: '#10B981', fontStyle: 'italic' }}>STAKED</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: 900, fontStyle: 'italic' }}>${hold.value.toLocaleString()}</p>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#10B981' }}>+{hold.change}%</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )
          }

          {/* Profile / User Tab */}
          {activeTab === 'user' && (
            <motion.div key="user" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Not Connected State - Show Connect Wallet */}
              {!isWalletConnected ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '32px' }}>
                  {/* Luffa Logo / App Icon */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '32px',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
                  }}>
                    <Wallet size={48} color="white" strokeWidth={1.5} />
                  </div>

                  <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '12px', textAlign: 'center' }}>
                    Connect Luffa Wallet
                  </h2>
                  <p style={{ fontSize: '15px', color: '#64748B', textAlign: 'center', lineHeight: 1.6, marginBottom: '40px', maxWidth: '300px' }}>
                    Connect your Luffa wallet to access RWA investments, view your portfolio, and manage your assets.
                  </p>

                  <button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    style={{
                      width: '100%',
                      maxWidth: '320px',
                      background: isConnecting ? '#E2E8F0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '18px 32px',
                      borderRadius: '20px',
                      fontSize: '16px',
                      fontWeight: 800,
                      cursor: isConnecting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      boxShadow: isConnecting ? 'none' : '0 12px 24px rgba(102, 126, 234, 0.25)',
                      transition: 'all 0.3s'
                    }}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet size={20} />
                        Connect Wallet
                      </>
                    )}
                  </button>

                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '24px', textAlign: 'center' }}>
                    By connecting, you agree to our Terms of Service
                  </p>
                </div>
              ) : activeProfileView === 'history' ? (
                /* Transaction History View */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <button
                      onClick={() => setActiveProfileView('main')}
                      style={{ border: 'none', background: '#F7F8FA', width: '40px', height: '40px', borderRadius: '12px', padding: 0 }}
                    >
                      <ChevronLeft size={20} style={{ display: 'block', margin: 'auto' }} />
                    </button>
                    <h2 style={{ fontSize: '24px', fontWeight: 900 }}>Transaction History</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { type: 'Deposit', amount: '+500.00', asset: 'USDT', date: 'Today, 10:23 AM', status: 'Completed', color: '#10B981' },
                      { type: 'Invest', amount: '-1,000.00', asset: 'BlackRock BUIDL', date: 'Yesterday', status: 'Completed', color: '#1A1C1E' },
                      { type: 'Withdraw', amount: '-200.00', asset: 'USDT', date: 'Oct 24, 2025', status: 'Completed', color: '#1A1C1E' },
                      { type: 'Deposit', amount: '+5,000.00', asset: 'USDT', date: 'Oct 20, 2025', status: 'Completed', color: '#10B981' },
                    ].map((tx, i) => (
                      <div key={i} style={{
                        padding: '20px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '20px',
                        border: '1px solid #F1F2F4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: 'white',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E2E8F0'
                          }}>
                            {tx.type === 'Deposit' ? <ArrowDownToLine size={24} color="#10B981" /> :
                              tx.type === 'Withdraw' ? <ArrowUpFromLine size={24} color="#EF4444" /> :
                                <Activity size={24} color="#3B82F6" />}
                          </div>
                          <div>
                            <p style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>{tx.type} {tx.asset}</p>
                            <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{tx.date}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '15px', fontWeight: 900, color: tx.type === 'Deposit' ? '#10B981' : '#1A1C1E' }}>{tx.amount}</p>
                          <p style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '4px' }}>{tx.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Connected State - Show Profile */
                <>
                  {/* User Profile Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1A1C1E 0%, #2D3748 100%)',
                    padding: '32px',
                    borderRadius: '32px',
                    color: '#FFF',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      {/* Avatar */}
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {userData?.avatar ? (
                          <img src={userData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
                        ) : (
                          <User size={32} color="white" />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '4px' }}>
                          {userData?.nickname || 'Luffa User'}
                        </h3>
                        <div
                          onClick={copyAddress}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            opacity: 0.7
                          }}
                        >
                          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                            {userData?.address?.slice(0, 8)}...{userData?.address?.slice(-6)}
                          </span>
                          {addressCopied ? (
                            <CheckCircle size={14} color="#10B981" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </div>
                      </div>

                      {/* Settings */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}>
                        <Settings size={20} />
                      </div>
                    </div>

                    {/* Balance */}
                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, letterSpacing: '2px', marginBottom: '8px' }}>
                        WALLET BALANCE
                      </p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 900 }}>
                          ${walletBalance.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '14px', opacity: 0.5 }}>USDT</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setShowDepositSheet(true)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '16px',
                          borderRadius: '16px',
                          fontWeight: 800,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <ArrowDownToLine size={18} />
                        Deposit
                      </button>
                      <button
                        onClick={() => setShowWithdrawSheet(true)}
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.2)',
                          padding: '16px',
                          borderRadius: '16px',
                          fontWeight: 800,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <ArrowUpFromLine size={18} />
                        Withdraw
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '24px',
                    padding: '20px',
                    marginBottom: '24px'
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#64748B', marginBottom: '16px', letterSpacing: '1px' }}>
                      QUICK ACTIONS
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {[
                        { icon: Plus, label: 'Buy RWA', color: '#10B981' },
                        { icon: RefreshCw, label: 'Swap', color: '#3B82F6' },
                        { icon: Share2, label: 'Send', color: '#8B5CF6' },
                        { icon: ExternalLink, label: 'Explorer', color: '#F59E0B' }
                      ].map((action, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: 'white',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E2E8F0'
                          }}>
                            <action.icon size={22} color={action.color} />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>{action.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { icon: Wallet, label: 'My Investments', desc: 'View your RWA holdings', action: () => setActiveTab('portfolio') },
                      { icon: Activity, label: 'Transaction History', desc: 'All your transactions', action: () => setActiveProfileView('history') },
                      { icon: Shield, label: 'Security', desc: 'Manage wallet security' },
                      { icon: Bell, label: 'Notifications', desc: 'Alerts and updates' },
                      { icon: HelpCircle, label: 'Help & Support', desc: 'FAQ and contact us' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        onClick={item.action}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px 20px',
                          backgroundColor: 'white',
                          borderRadius: '20px',
                          border: '1px solid #F1F2F4',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{
                          width: '44px',
                          height: '44px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <item.icon size={22} color="#475569" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>{item.label}</p>
                          <p style={{ fontSize: '12px', color: '#94A3B8' }}>{item.desc}</p>
                        </div>
                        <ChevronRight size={20} color="#CBD5E1" />
                      </div>
                    ))}

                    {/* Logout Button */}
                    <div
                      onClick={handleDisconnect}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '16px 20px',
                        backgroundColor: '#FEF2F2',
                        borderRadius: '20px',
                        border: '1px solid #FECACA',
                        cursor: 'pointer',
                        marginTop: '12px'
                      }}
                    >
                      <LogOut size={20} color="#EF4444" />
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#EF4444' }}>Disconnect Wallet</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence >
      </main >

      {/* Asset Detail Slider */}
      < AnimatePresence >
        {selectedAsset && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'white', display: 'flex', flexDirection: 'column', paddingTop: '40px' }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #F1F2F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setSelectedAsset(null)} style={{ border: 'none', background: '#F7F8FA', width: '40px', height: '40px', borderRadius: '12px', padding: 0 }}>
                <ChevronRight size={20} style={{ transform: 'rotate(180deg)', display: 'block', margin: 'auto' }} />
              </button>
              <h3 style={{ fontWeight: 900 }}>DETAILS</h3>
              <div style={{ width: '40px' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ width: '80px', height: '80px', background: '#F7F8FA', borderRadius: '24px', padding: '16px', border: '1px solid #F1F2F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={selectedAsset.logo} alt={selectedAsset.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{selectedAsset.name}</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', mt: '8px' }}>
                    {(selectedAsset.complianceTags || []).map((tag, i) => (
                      <span key={i} style={{ fontSize: '10px', fontWeight: 900, color: '#10B981', border: '1px solid #10B981', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#AAA', letterSpacing: '1px', marginTop: '12px' }}>{selectedAsset.symbol} • {selectedAsset.category}</p>
                </div>
              </div>

              {/* 风险评分看板 (Risk Score) */}
              <div style={styles.card}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 900, color: '#999', letterSpacing: '1px' }}>RISK SCORE</p>
                  <p style={{ fontSize: '28px', fontWeight: 900, color: selectedAsset.riskScore > 80 ? '#10B981' : '#F59E0B' }}>
                    {selectedAsset.riskScore} <span style={{ fontSize: '14px', color: '#999' }}>/ 100</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: selectedAsset.riskScore > 80 ? '#10B981' : '#F59E0B', textTransform: 'uppercase' }}>
                    {selectedAsset.riskScore > 90 ? 'Very Low Risk' : selectedAsset.riskScore > 80 ? 'Low Risk' : 'Medium Risk'}
                  </div>
                  <p style={{ fontSize: '10px', color: '#CCC', fontWeight: 700 }}>Security Grade</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ flex: 1, backgroundColor: '#F7F8FA', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '10px', fontWeight: 900, color: '#999', marginBottom: '4px' }}>CURRENT APY</p>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', fontStyle: 'italic' }}>{selectedAsset.apy}%</p>
                </div>
                <div style={{ flex: 1, backgroundColor: '#F7F8FA', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '10px', fontWeight: 900, color: '#999', marginBottom: '4px' }}>NETWORK TVL</p>
                  <p style={{ fontSize: '20px', fontWeight: 900, fontStyle: 'italic' }}>${(selectedAsset.tvl / 1e6).toFixed(0)}M</p>
                </div>
              </div>

              {/* 分析板块 1: 收益变化曲线 (Analysis Part 1: Yield Trend) */}
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontWeight: 900, borderLeft: '4px solid #000', paddingLeft: '12px', marginBottom: '16px' }}>YIELD HISTORY (6M)</p>
                <div style={{ width: '100%', height: '140px', backgroundColor: '#F7F8FA', borderRadius: '20px', padding: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedAsset.yieldHistory || []}>
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
                      <Area type="stepAfter" dataKey="apy" stroke="#10B981" fill="#10B98122" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 分析板块 2: 抵押品构成 (Analysis Part 2: Collateral Breakdown) */}
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontWeight: 900, borderLeft: '4px solid #000', paddingLeft: '12px', marginBottom: '16px' }}>COLLATERAL COMPOSITION</p>
                <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '16px' }}>
                  {(selectedAsset.collaterals || []).map((col, idx) => (
                    <div key={idx} style={{ width: `${col.value}%`, backgroundColor: col.color }} title={col.name} />
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(selectedAsset.collaterals || []).map((col, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                      <span style={{ fontSize: '11px', fontWeight: 800 }}>{col.name} {col.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 分析板块 3: 风险与透明度 (Analysis Part 3: Risk & Transparency) */}
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontWeight: 900, borderLeft: '4px solid #000', paddingLeft: '12px', marginBottom: '16px' }}>RISK ANALYSIS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Audit Status', value: 'Verified by Trail of Bits', color: '#10B981' },
                    { label: 'Oracle Price', value: 'Chainlink Feed', color: '#000' },
                    { label: 'Transparency', value: 'Monthly Reports', color: '#000' }
                  ].map((risk, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: '#F7F8FA', borderRadius: '16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#999' }}>{risk.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: risk.color }}>{risk.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '0 4px' }}>
                <p style={{ fontWeight: 900, borderLeft: '4px solid #000', paddingLeft: '12px', marginBottom: '12px' }}>STRATEGY DESCRIPTION</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#666', lineHeight: 1.6, fontStyle: 'italic' }}>{selectedAsset.description}</p>
              </div>
            </div>
            <div style={{ padding: '24px 32px 48px 32px', borderTop: '1px solid #F1F2F4' }}>
              <button
                onClick={() => setShowInvestSheet(true)}
                style={{ width: '100%', backgroundColor: '#000', color: '#FFF', padding: '16px', borderRadius: '16px', fontWeight: 900, border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
              >
                INVEST NOW
              </button>
            </div>

            {/* 投资输入面板 (Investment Sheet) */}
            <AnimatePresence>
              {showInvestSheet && (
                <motion.div
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '32px', zIndex: 2100, boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}
                >
                  {orderStatus === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <div style={{ width: '64px', height: '64px', backgroundColor: '#ECFDF5', color: '#10B981', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                        <Activity size={32} />
                      </div>
                      <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>申购成功</h3>
                      <p style={{ color: '#999', fontSize: '14px', marginBottom: '32px' }}>您的 RWA 资产正在链上确认中</p>
                      <button
                        onClick={() => { setSelectedAsset(null); setShowInvestSheet(false); setOrderStatus(null); }}
                        style={{ width: '100%', backgroundColor: '#000', color: '#FFF', padding: '16px', borderRadius: '16px', fontWeight: 900, border: 'none' }}
                      >
                        返回首页
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h4 style={{ fontWeight: 900, fontSize: '18px' }}>确认申购金额</h4>
                        <button onClick={() => setShowInvestSheet(false)} style={{ border: 'none', background: 'none', color: '#CCC', fontWeight: 900 }}>取消</button>
                      </div>

                      <div style={{ backgroundColor: '#F7F8FA', padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <p style={{ fontSize: '10px', fontWeight: 900, color: '#999', uppercase: 'true' }}>输入金额 (USDT)</p>
                          <button
                            onClick={() => setInvestAmount('5000')} // Mock Max
                            style={{ background: '#000', color: '#FFF', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '6px', border: 'none' }}
                          >
                            MAX
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '24px', fontWeight: 900 }}>$</span>
                          <input
                            type="number"
                            value={investAmount}
                            onChange={(e) => setInvestAmount(e.target.value)}
                            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '36px', fontWeight: 900, width: '100%' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', fontSize: '13px', fontWeight: 700 }}>
                        <span style={{ color: '#999' }}>预估年收益 (${selectedAsset.apy}% APY)</span>
                        <span style={{ color: '#10B981' }}>+${((parseFloat(investAmount) || 0) * selectedAsset.apy / 100).toFixed(2)} / 年</span>
                      </div>

                      <button
                        onClick={async () => {
                          if (!investAmount || parseFloat(investAmount) <= 0) {
                            alert('请输入有效的金额');
                            return;
                          }
                          setOrderStatus('submitting');
                          try {
                            await LuffaSDK.sendTransaction({
                              to: '0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T',
                              value: '0',
                              data: '0x095ea7b3000000000000000000000000...' // Mock ERC20 Approve/Deposit
                            });

                            // Mock portfolio update logic
                            MOCK_DATA.user.portfolio.totalValue += parseFloat(investAmount);
                            const existing = MOCK_DATA.user.portfolio.assets.find(a => a.name.includes(selectedAsset.name));
                            if (existing) {
                              existing.value += parseFloat(investAmount);
                            } else {
                              MOCK_DATA.user.portfolio.assets.push({
                                name: selectedAsset.name,
                                value: parseFloat(investAmount),
                                change: 0.0
                              });
                            }

                            setOrderStatus('success');
                          } catch (err) {
                            console.error('Transaction failed:', err);
                            setOrderStatus(null);
                          }
                        }}
                        disabled={orderStatus === 'submitting'}
                        style={{
                          width: '100%',
                          backgroundColor: orderStatus === 'submitting' ? '#EEE' : '#10B981',
                          color: '#FFF',
                          padding: '18px',
                          borderRadius: '20px',
                          fontWeight: 900,
                          border: 'none',
                          boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        {orderStatus === 'submitting' ? '正在连接钱包...' : '下一步：授权并申购'}
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence >

      {/* Deposit Sheet Modal */}
      <AnimatePresence>
        {showDepositSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (depositStatus !== 'processing') { setShowDepositSheet(false); setDepositStatus(null); setDepositAmount(''); } }}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#000',
                zIndex: 3000
              }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderTopLeftRadius: '32px',
                borderTopRightRadius: '32px',
                padding: '32px',
                zIndex: 3100,
                boxShadow: '0 -20px 40px rgba(0,0,0,0.15)'
              }}
            >
              {depositStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                  }}>
                    <CheckCircle size={36} color="white" />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Deposit Successful</h3>
                  <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '8px' }}>
                    ${depositAmount} USDT has been added to your wallet
                  </p>
                  <p style={{ color: '#10B981', fontSize: '14px', fontWeight: 700 }}>
                    Transaction confirmed on chain
                  </p>
                </div>
              ) : depositStatus === 'error' ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                  }}>
                    <X size={36} color="#EF4444" />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', color: '#EF4444' }}>Deposit Failed</h3>
                  <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
                    Please try again or contact support
                  </p>
                  <button
                    onClick={() => setDepositStatus(null)}
                    style={{
                      padding: '16px 32px',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '16px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h4 style={{ fontWeight: 900, fontSize: '20px' }}>Deposit USDT</h4>
                    <button
                      onClick={() => { setShowDepositSheet(false); setDepositAmount(''); }}
                      disabled={depositStatus === 'processing'}
                      style={{
                        border: 'none',
                        background: '#F1F5F9',
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={20} color="#64748B" />
                    </button>
                  </div>

                  {/* Current Balance */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 700 }}>Current Balance</span>
                    <span style={{ fontSize: '16px', fontWeight: 900 }}>${walletBalance.toLocaleString()} USDT</span>
                  </div>

                  {/* Amount Input */}
                  <div style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>ENTER AMOUNT</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['100', '500', '1000'].map(amt => (
                          <button
                            key={amt}
                            onClick={() => setDepositAmount(amt)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: depositAmount === amt ? '#1A1C1E' : 'white',
                              color: depositAmount === amt ? 'white' : '#64748B',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 900 }}>$</span>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        style={{
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          fontSize: '40px',
                          fontWeight: 900,
                          width: '100%',
                          color: '#1A1C1E'
                        }}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Wallet size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>Luffa Wallet</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>Pay with your Luffa wallet balance</p>
                    </div>
                    <ChevronRight size={20} color="#CBD5E1" />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleDeposit}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0 || depositStatus === 'processing'}
                    style={{
                      width: '100%',
                      background: (!depositAmount || parseFloat(depositAmount) <= 0)
                        ? '#E2E8F0'
                        : depositStatus === 'processing'
                          ? '#94A3B8'
                          : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '18px',
                      borderRadius: '20px',
                      fontSize: '16px',
                      fontWeight: 900,
                      cursor: (!depositAmount || depositStatus === 'processing') ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: depositStatus === 'processing' ? 'none' : '0 10px 20px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    {depositStatus === 'processing' ? (
                      <>
                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Processing Deposit...
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine size={20} />
                        Confirm Deposit {depositAmount && `$${depositAmount}`}
                      </>
                    )}
                  </button>

                  <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '16px' }}>
                    Deposit will be processed via Luffa wallet on Endless network
                  </p>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Withdraw Sheet Modal */}
      <AnimatePresence>
        {showWithdrawSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (withdrawStatus !== 'processing') { setShowWithdrawSheet(false); setWithdrawStatus(null); setWithdrawAmount(''); } }}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#000',
                zIndex: 3000
              }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderTopLeftRadius: '32px',
                borderTopRightRadius: '32px',
                padding: '32px',
                zIndex: 3100,
                boxShadow: '0 -20px 40px rgba(0,0,0,0.15)'
              }}
            >
              {withdrawStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    background: '#1A1C1E',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                  }}>
                    <CheckCircle size={36} color="white" />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Withdrawal Successful</h3>
                  <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '8px' }}>
                    ${withdrawAmount} USDT has been sent to your wallet
                  </p>
                  <p style={{ color: '#10B981', fontSize: '14px', fontWeight: 700 }}>
                    Transaction confirmed on chain
                  </p>
                </div>
              ) : withdrawStatus === 'error' ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                  }}>
                    <X size={36} color="#EF4444" />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', color: '#EF4444' }}>Withdraw Failed</h3>
                  <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
                    Please try again or contact support
                  </p>
                  <button
                    onClick={() => setWithdrawStatus(null)}
                    style={{
                      padding: '16px 32px',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '16px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h4 style={{ fontWeight: 900, fontSize: '20px' }}>Withdraw USDT</h4>
                    <button
                      onClick={() => { setShowWithdrawSheet(false); setWithdrawAmount(''); }}
                      disabled={withdrawStatus === 'processing'}
                      style={{
                        border: 'none',
                        background: '#F1F5F9',
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={20} color="#64748B" />
                    </button>
                  </div>

                  {/* Current Balance */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 700 }}>Available Balance</span>
                    <span style={{ fontSize: '16px', fontWeight: 900 }}>${walletBalance.toLocaleString()} USDT</span>
                  </div>

                  {/* Amount Input */}
                  <div style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>ENTER AMOUNT</p>
                      <button
                        onClick={() => setWithdrawAmount(walletBalance.toString())}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#1A1C1E',
                          color: 'white',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        MAX
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 900 }}>$</span>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        style={{
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          fontSize: '40px',
                          fontWeight: 900,
                          width: '100%',
                          color: '#1A1C1E'
                        }}
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: '#1A1C1E',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Wallet size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>Luffa Wallet</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8' }}>{userData?.address?.slice(0, 6)}...{userData?.address?.slice(-4)}</p>
                    </div>
                    <CheckCircle size={20} color="#10B981" />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > walletBalance || withdrawStatus === 'processing'}
                    style={{
                      width: '100%',
                      background: (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > walletBalance)
                        ? '#E2E8F0'
                        : withdrawStatus === 'processing'
                          ? '#94A3B8'
                          : '#1A1C1E',
                      color: 'white',
                      border: 'none',
                      padding: '18px',
                      borderRadius: '20px',
                      fontSize: '16px',
                      fontWeight: 900,
                      cursor: (!withdrawAmount || withdrawStatus === 'processing') ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: withdrawStatus === 'processing' ? 'none' : '0 10px 20px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {withdrawStatus === 'processing' ? (
                      <>
                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Processing Withdrawal...
                      </>
                    ) : (
                      <>
                        <ArrowUpFromLine size={20} />
                        Confirm Withdraw {withdrawAmount && `$${withdrawAmount}`}
                      </>
                    )}
                  </button>

                  <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '16px' }}>
                    Standard network fees may apply
                  </p>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <nav style={styles.bottomNav}>
        {[
          { id: 'market', icon: LayoutGrid, label: 'Market' },
          { id: 'screener', icon: BarChart3, label: 'Screener' },
          { id: 'portfolio', icon: Wallet, label: 'Portfolio' },
          { id: 'user', icon: User, label: 'Profile' },
        ].map(item => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: activeTab === item.id ? '#000' : '#CCC',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            <item.icon size={24} strokeWidth={activeTab === item.id ? 3 : 2} />
            <span style={{ fontSize: '10px', fontWeight: 900 }}>{item.label}</span>
          </div>
        ))}
      </nav>
    </div >
  );
}
