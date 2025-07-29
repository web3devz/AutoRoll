# AutoRoll - Smart Contract Deployment Guide

## Prerequisites

1. Massa Station Wallet installed and configured
2. Buildnet MAS tokens for deployment and testing
3. Node.js and npm installed

## Step-by-Step Deployment

### 1. Compile the Smart Contract

```bash
cd smart-contract
npm install
npm run asbuild:release
```

This will create the compiled WASM bytecode in `build/release/autoroll.wasm`.

### 2. Deploy Using Massa Station

1. Open Massa Station
2. Navigate to "Smart Contracts" section
3. Click "Deploy Contract"
4. Upload the `autoroll.wasm` file
5. Set deployment parameters:
   - Constructor parameters: (none required)
   - Coins: 0 (no initial funding needed)
   - Gas: Use default or set to 100,000,000
6. Sign and deploy the transaction
7. Note the contract address from the deployment receipt

### 3. Deploy Using Massa CLI (Alternative)

```bash
# Ensure massa-cli is installed and configured
massa-cli contract deploy \
  --bytecode build/release/autoroll.wasm \
  --coins 0 \
  --gas-limit 100000000
```

### 4. Initial Contract Setup

After deployment, perform these initial steps:

```bash
# 1. Fund the contract with initial MAS
massa-cli contract call \
  --contract-address <CONTRACT_ADDRESS> \
  --function fundContract \
  --coins 1000000000000 \  # 1000 MAS in nanoMAS
  --gas-limit 50000000

# 2. Add your first employee
massa-cli contract call \
  --contract-address <CONTRACT_ADDRESS> \
  --function addEmployee \
  --parameter "<EMPLOYEE_ADDRESS>,100000000000,2592000" \  # 100 MAS, 30 days
  --gas-limit 50000000

# 3. Start autonomous execution
massa-cli contract call \
  --contract-address <CONTRACT_ADDRESS> \
  --function startAutonomousExecution \
  --gas-limit 50000000
```

### 5. Verify Deployment

Check that everything is working:

```bash
# Get contract stats
massa-cli contract call \
  --contract-address <CONTRACT_ADDRESS> \
  --function getContractStats \
  --read-only

# Get owner address
massa-cli contract call \
  --contract-address <CONTRACT_ADDRESS> \
  --function getOwner \
  --read-only
```

## Frontend Configuration

After deploying the smart contract:

1. Update the frontend configuration with your contract address
2. Test the connection in the web interface
3. Verify all functions work correctly

## Testnet vs Mainnet

- **Buildnet**: Use for testing and development
- **Mainnet**: Use for production deployments (requires real MAS tokens)

## Gas Estimation

Typical gas costs for AutoRoll functions:
- `addEmployee`: ~10M gas
- `removeEmployee`: ~5M gas
- `fundContract`: ~3M gas
- `issueBonus`: ~8M gas
- `processSalaries`: ~5-20M gas (depends on employee count)

## Troubleshooting

### Common Issues:

1. **Out of Gas**: Increase gas limit for complex operations
2. **Insufficient Balance**: Ensure deployer account has enough MAS
3. **Invalid Parameters**: Check parameter encoding and formats
4. **Contract Not Found**: Verify contract address is correct

### Debug Tips:

- Use read-only calls to test parameters before writing
- Check transaction receipts for error messages
- Monitor contract events for debugging information
- Test on buildnet before mainnet deployment
