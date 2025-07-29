# 🚀 AutoRoll Quick Start Guide

Get up and running with AutoRoll in 5 minutes!

## 1. Prerequisites ✅

- Node.js 16+ installed
- Massa Station Wallet installed
- Some Buildnet MAS tokens

## 2. Clone & Setup 📥

```bash
git clone <repository-url>
cd AutoRoll
chmod +x setup.sh
./setup.sh
```

## 3. Start Development 🔧

```bash
./start-dev.sh
```

Open http://localhost:3000 in your browser.

## 4. Deploy Smart Contract 📦

```bash
cd smart-contract
npm run asbuild:release
```

Deploy `build/release/autoroll.wasm` using Massa Station.

## 5. Connect & Test 🌐

1. Click "Connect Massa Wallet"
2. Enter your contract address
3. Fund the contract
4. Add employees
5. Start autonomous execution

## That's it! 🎉

Your AutoRoll payroll system is now running on Massa blockchain!

---

**Need help?** Check the full [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md)
