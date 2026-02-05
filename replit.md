# MeeChain AI Dashboard

## Overview
MeeChain is a Web3-powered NFT dashboard for creating and managing MeeBot NFTs. It features wallet connection, AI image generation with Gemini, NFT minting on Ethereum-compatible blockchains, and a journey tracking system.

## Project Structure
- `/` - Root contains main App.tsx and configuration files
- `/src/components/` - Main React components (MeeBotStation, MeeBotPreview, dashboard components)
- `/src/lib/services/` - Service files for Web3, Gemini AI, and journey tracking
- `/components/` - Shared components like Icons, ImageEditor
- `/hooks/` - React hooks including useWallet for wallet connection
- `/contracts/` - Solidity smart contracts for MeeBot NFTs

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (via CDN)
- **Web3**: ethers.js v5 for Ethereum wallet integration
- **AI**: Google Gemini API for image generation and analysis
- **Blockchain**: Supports Ethereum, Polygon, BSC, Fuse (Sepolia for testing)

## Running the Project
```bash
npm install --legacy-peer-deps
npm run dev
```
The app runs on port 5000.

## Environment Variables
- `GEMINI_API_KEY` - Required for AI features (image generation, mood analysis)

## Recent Changes
- **Feb 2026**: Configured for Replit environment
  - Updated vite.config.ts to port 5000 with allowedHosts
  - Fixed ethers.js v5 compatibility (BrowserProvider -> Web3Provider)
  - Fixed import paths for web3Service
