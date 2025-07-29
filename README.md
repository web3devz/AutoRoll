# 🛠️ AutoRoll — Smart Payroll, Fully On-Chain

## 🧠 Project Overview

**AutoRoll** is a fully autonomous, on-chain payroll system built using **Massa's Autonomous Smart Contracts (ASC)** and hosted on **DeWeb**. The system allows employers to register employees, set salaries, and automate payments without any external cron jobs or keepers.

## ✨ Features

### 🏢 For Employers
- **Employee Management**: Add/remove employees with wallet addresses, salaries, and payment intervals
- **Contract Funding**: Fund the payroll contract with MAS tokens
- **Bonus System**: Issue one-time bonuses to employees
- **Autonomous Execution**: Start automatic salary processing using Massa's ASC
- **Real-time Dashboard**: Monitor contract balance, employee count, and total payments

### 👥 For Employees  
- **Status Checking**: View employment status and payment details
- **Payment History**: Track received salaries and bonuses
- **Upcoming Payments**: See next payment scheduled time

### 🤖 Smart Contract Features
- **Autonomous Smart Contracts**: Self-executing salary payments based on set intervals
- **Multi-employee Support**: Handle multiple active employees simultaneously
- **Transparent Audit Trail**: Complete on-chain record of all transactions
- **Owner Controls**: Secure admin functions for contract management

## 🏗️ Project Structure

```
AutoRoll/
├── smart-contract/          # Massa AssemblyScript smart contract
│   ├── assembly/
│   │   └── autoroll.ts     # Main contract logic
│   ├── package.json        # Contract dependencies
│   └── asconfig.json       # AssemblyScript configuration
├── frontend/               # TypeScript + HTML frontend
│   ├── src/
│   │   ├── main.ts        # Main application logic
│   │   └── styles.css     # UI styling
│   ├── index.html         # Main HTML file
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite build configuration
├── README.md              # This file
└── LICENSE               # Project license
```

## 🛠️ Technologies Used

- **[Massa Blockchain](https://massa.net)**: High-performance blockchain with native ASC support
- **[Massa SDK (AssemblyScript)](https://docs.massa.net/docs/smart-contracts/assembly-script/)**: Smart contract development framework
- **[Massa Wallet](https://massa.net/docs/install/station)**: Wallet integration for secure transactions
- **[DeWeb](https://docs.massa.net/docs/deweb/deploying-a-website/)**: Decentralized web hosting on Massa
- **TypeScript**: Type-safe frontend development
- **Vite**: Fast build tool and development server

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Massa Station Wallet** installed and configured
3. **Massa Buildnet** access for testing

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AutoRoll
   ```

2. **Setup Smart Contract**
   ```bash
   cd smart-contract
   npm install
   npm run build
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Open your browser to `http://localhost:3000`
   - Connect your Massa Wallet
   - Deploy or connect to an existing contract

### Smart Contract Deployment

1. **Compile the contract**
   ```bash
   cd smart-contract
   npm run asbuild:release
   ```

2. **Deploy to Massa Buildnet**
   - Use Massa Station or CLI tools to deploy the compiled WASM
   - Note the deployed contract address
   - Fund the deployer account with MAS tokens

### DeWeb Deployment

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to DeWeb**
   ```bash
   # Install massa-web CLI if not already installed
   npm install -g @massalabs/massa-web

   # Deploy to DeWeb
   massa-web deploy ./dist
   ```

## 📋 Usage Guide

### For Employers

1. **Connect Wallet**: Click "Connect Massa Wallet" and authorize the connection
2. **Deploy/Connect Contract**: Either deploy a new contract or connect to existing one
3. **Fund Contract**: Add MAS tokens to enable salary payments
4. **Add Employees**: 
   - Enter employee wallet address
   - Set salary amount (in MAS)
   - Set payment interval (in seconds, default: 30 days)
5. **Start Autonomous Execution**: Enable automatic salary processing
6. **Manage Employees**: Remove employees or issue bonuses as needed

### For Employees

1. **Connect Wallet**: Use the same wallet address registered by employer
2. **Switch to Employee Dashboard**: Click "Employee Dashboard" tab
3. **Check Status**: View employment details and payment schedule
4. **Monitor Payments**: Track payment history and upcoming payments

## 🔧 Smart Contract Functions

### Owner Functions
- `addEmployee(address, salary, interval)`: Register new employee
- `removeEmployee(address)`: Deactivate employee
- `fundContract()`: Add funds to contract (with MAS transfer)
- `issueBonus(address, amount)`: Send one-time bonus
- `startAutonomousExecution()`: Begin automatic salary processing

### Public Functions
- `getEmployee(address)`: Get employee details
- `getContractStats()`: Get contract statistics
- `getOwner()`: Get contract owner address
- `processSalaries()`: Process due salary payments (called autonomously)

### Autonomous Execution
The contract uses Massa's ASC to automatically:
- Check employee payment schedules every minute
- Transfer salaries when due
- Update next payment times
- Emit events for successful payments
- Handle insufficient balance scenarios

## 🔐 Security Features

- **Owner-only Functions**: Critical operations restricted to contract deployer
- **Input Validation**: All parameters validated before processing
- **Balance Checks**: Prevents overdrafts and failed transactions
- **Event Logging**: Complete audit trail of all operations
- **Safe Math**: Prevents overflow and underflow errors

## 🧪 Testing

### Local Buildnet Testing

1. **Setup local buildnet**
   ```bash
   # Follow Massa buildnet setup guide
   massa-node --local-buildnet
   ```

2. **Test smart contract**
   ```bash
   cd smart-contract
   # Deploy and test using Massa CLI tools
   ```

3. **Test frontend integration**
   ```bash
   cd frontend
   npm run dev
   # Test all user flows with local contract
   ```

## 📊 Example Workflow

1. **Employer deploys contract** and becomes owner
2. **Employer funds contract** with 1000 MAS
3. **Employer adds employee** with 100 MAS monthly salary
4. **Employer starts autonomous execution**
5. **Contract automatically pays** employee every 30 days
6. **Employee can check status** and view payment history
7. **Employer can issue bonuses** or remove employees as needed

## 🌟 Advanced Features

### Autonomous Smart Contracts (ASC)
- Self-executing logic without external triggers
- Scheduled payments based on blockchain time
- Automatic state updates and event emissions
- Resilient to network interruptions

### Gas Optimization
- Efficient storage patterns for employee data
- Batch processing capabilities
- Minimal computational overhead
- Optimized for frequent autonomous calls

### Scalability Considerations
- Support for hundreds of employees
- Configurable execution intervals
- Efficient iteration over active employees
- Planned upgrades for larger deployments

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Resources

- **Massa Documentation**: [https://docs.massa.net](https://docs.massa.net)
- **Massa Discord**: [Community Support](https://discord.gg/massa)
- **GitHub Issues**: [Report bugs or request features](../../issues)
- **DeWeb Guide**: [Deployment Documentation](https://docs.massa.net/docs/deweb)

## 🚧 Roadmap

- [ ] Multi-token support (beyond MAS)
- [ ] Employee self-registration with approval workflow
- [ ] Payroll analytics and reporting dashboard
- [ ] Integration with traditional HR systems
- [ ] Mobile-responsive UI improvements
- [ ] Advanced permission management

---

**Built with ❤️ on Massa Blockchain**
