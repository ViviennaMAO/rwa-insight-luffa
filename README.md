# RWA Insight - Luffa Mini-Program

> A comprehensive Real World Assets (RWA) data monitoring and investment platform for the Luffa SuperBox ecosystem.

## Overview

RWA Insight transforms complex RWA.xyz on-chain data into a mobile-friendly interface, helping users quickly capture investment opportunities in private credit, tokenized treasuries, real estate, and other RWA sectors.

## Features

- **Market Overview**: Real-time global RWA market statistics and metrics
- **Asset Discovery**: Browse and filter RWA assets by category, platform, and yield
- **Portfolio Management**: Track your RWA investments and returns
- **Wallet Integration**: Seamless connection with Luffa wallet
- **On-chain Transactions**: Direct investment capabilities through smart contracts
- **Social Sharing**: Share market insights with Luffa community

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **SDK**: Luffa SuperBox SDK

## Project Structure

```
RWA Insight/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   ├── sdk.js           # Luffa SDK wrapper
│   ├── mockData.js      # Mock RWA data
│   ├── index.css        # Global styles
│   └── assets/          # Images and static assets
├── index.html           # HTML entry file
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Luffa app (for testing in SuperBox environment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "RWA Insight"
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at `http://localhost:3000`

### Development

- **Dev Server**: `npm run dev` - Start development server with hot reload
- **Build**: `npm run build` - Build production bundle
- **Preview**: `npm run preview` - Preview production build locally
- **Lint**: `npm run lint` - Run ESLint checks

## Luffa SDK Integration

The app integrates with Luffa SuperBox through the custom SDK wrapper (`src/sdk.js`):

### Key SDK Methods

```javascript
import { LuffaSDK } from './sdk';

// Connect wallet and get user info
const userData = await LuffaSDK.connectWallet({
  appUrl: 'https://rwa-insight.luffa.im',
  appIcon: 'https://rwa-insight.luffa.im/icon.png'
});

// Check if running in Luffa environment
const isLuffa = LuffaSDK.isLuffaEnv();

// Send transaction
const result = await LuffaSDK.depositToRWA({
  from: userAddress,
  contractAddress: 'CONTRACT_ADDRESS',
  amount: 1000,
  assetId: 'USDT'
});

// Set share info
LuffaSDK.setShareInfo({
  title: 'RWA Market Insights',
  path: '/pages/index/index',
  imageUrl: 'share-image.png'
});
```

## Building for Production

1. Build the production bundle:
```bash
npm run build
```

2. The output will be in the `dist/` directory

3. Test the production build:
```bash
npm run preview
```

## Deploying to Luffa SuperBox

1. Build the production bundle (see above)

2. Create a mini-program package with the following structure:
```
superbox-package/
├── dist/              # Your built files
├── app.json          # SuperBox configuration
└── icon.png          # App icon (192x192px)
```

3. Create `app.json` configuration:
```json
{
  "pages": ["index"],
  "window": {
    "navigationBarTitleText": "RWA Insight",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#ffffff"
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  }
}
```

4. Package as `.zip` file and submit to Luffa SuperBox platform

## Environment Variables

Create `.env` file for environment-specific configuration:

```env
VITE_APP_NAME=RWA Insight
VITE_RWA_API_URL=https://api.rwa.xyz
VITE_CONTRACT_ADDRESS=0x...
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_RWA_API_URL;
```

## Browser Testing

The SDK includes mock implementations for browser testing. When running outside the Luffa app:

- Wallet connection returns mock user data
- Transactions are simulated with console logs
- All UI features remain functional

## API Integration (Future)

Current version uses mock data. To integrate real APIs:

1. Replace mock data in `src/mockData.js` with API calls
2. Use `fetch` or `axios` to call RWA.xyz or Dune Analytics APIs
3. Add API endpoints to `.env` file
4. Consider adding a data layer with React Query or SWR

Example:
```javascript
// Future implementation
const fetchRWAData = async () => {
  const response = await fetch(`${import.meta.env.VITE_RWA_API_URL}/market`);
  return response.json();
};
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test in both browser and Luffa app
4. Submit a pull request

## Architecture Notes

### Mobile-First Design
- Responsive layouts optimized for mobile screens
- Touch-friendly UI components
- Smooth scrolling and animations

### Performance Optimization
- Code splitting for faster initial load
- Lazy loading for heavy components
- Optimized bundle size with tree shaking
- Memoized computations for complex data

### SDK Integration Pattern
- Environment detection (Luffa vs browser)
- Graceful fallbacks for testing
- Mock implementations for development
- Type-safe SDK wrapper

## Troubleshooting

### Build Issues
- Ensure Node.js version is 18 or higher
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`

### SDK Issues
- Check if running in Luffa environment: `LuffaSDK.isLuffaEnv()`
- Enable console logs to debug SDK calls
- Verify wallet connection before transactions

### Styling Issues
- Run `npx tailwindcss -o src/output.css` to rebuild CSS
- Check if PostCSS is properly configured
- Verify Tailwind classes are included in content paths

## Resources

- [Luffa SuperBox Documentation](https://luffa.im/SuperBox/docs/hk/miniProDevelopmentGuide/Introduction.html)
- [Luffa User Guide](https://userguide.luffa.im/superbox/what-is-superbox)
- [RWA.xyz](https://rwa.xyz) - Real World Assets data source
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## License

MIT

## Version

v1.0.0

---

Built with ❤️ for the Luffa ecosystem
