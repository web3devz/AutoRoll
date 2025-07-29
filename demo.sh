#!/bin/bash

# AutoRoll Demo Script
# This script demonstrates the key features of the AutoRoll payroll system

echo "🛠️ AutoRoll Demo - Smart Payroll System"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contract address (replace with your deployed contract)
CONTRACT_ADDRESS="AS12345abcdef..."  # Replace with actual address
EMPLOYER_ADDRESS="AU12345xyz..."     # Replace with employer address
EMPLOYEE_ADDRESS="AU67890abc..."     # Replace with employee address

echo -e "${BLUE}Prerequisites:${NC}"
echo "✅ Massa Station Wallet installed"
echo "✅ Connected to Massa Buildnet"  
echo "✅ Contract deployed at: $CONTRACT_ADDRESS"
echo "✅ Employer address: $EMPLOYER_ADDRESS"
echo "✅ Employee address: $EMPLOYEE_ADDRESS"
echo ""

echo -e "${YELLOW}Demo Scenario:${NC}"
echo "1. Employer funds the payroll contract"
echo "2. Employer adds employee with monthly salary"
echo "3. System starts autonomous salary processing"
echo "4. Employee checks their status"
echo "5. Employer issues a bonus"
echo ""

read -p "Press Enter to start the demo..."
echo ""

# Step 1: Fund Contract
echo -e "${BLUE}Step 1: Funding Contract${NC}"
echo "Employer funds contract with 1000 MAS..."
echo "Command: massa-cli contract call --contract-address $CONTRACT_ADDRESS --function fundContract --coins 1000000000000"
echo -e "${GREEN}✓ Contract funded successfully${NC}"
echo ""

# Step 2: Add Employee
echo -e "${BLUE}Step 2: Adding Employee${NC}"
echo "Adding employee with 100 MAS monthly salary..."
echo "Command: massa-cli contract call --contract-address $CONTRACT_ADDRESS --function addEmployee --parameter \"$EMPLOYEE_ADDRESS,100000000000,2592000\""
echo -e "${GREEN}✓ Employee added successfully${NC}"
echo "  - Address: $EMPLOYEE_ADDRESS"
echo "  - Salary: 100 MAS per month"
echo "  - Interval: 30 days (2592000 seconds)"
echo ""

# Step 3: Start Autonomous Execution
echo -e "${BLUE}Step 3: Starting Autonomous Execution${NC}"
echo "Enabling automatic salary processing..."
echo "Command: massa-cli contract call --contract-address $CONTRACT_ADDRESS --function startAutonomousExecution"
echo -e "${GREEN}✓ Autonomous execution started${NC}"
echo "  - Salaries will be processed automatically every minute"
echo "  - Payments will be made when due dates arrive"
echo ""

# Step 4: Check Employee Status
echo -e "${BLUE}Step 4: Employee Status Check${NC}"
echo "Employee checks their employment status..."
echo "Command: massa-cli contract call --contract-address $CONTRACT_ADDRESS --function getEmployee --parameter \"$EMPLOYEE_ADDRESS\" --read-only"
echo -e "${GREEN}✓ Employee status retrieved${NC}"
echo "  - Status: Active"
echo "  - Next payment: ~30 days"
echo "  - Total paid: 0 MAS (new employee)"
echo ""

# Step 5: Contract Statistics
echo -e "${BLUE}Step 5: Contract Statistics${NC}"
echo "Checking overall contract statistics..."
echo "Command: massa-cli contract call --contract-address $CONTRACT_ADDRESS --function getContractStats --read-only"
echo -e "${GREEN}✓ Statistics retrieved${NC}"
echo "  - Total employees: 1"
echo "  - Contract balance: 1000 MAS"
echo "  - Total paid: 0 MAS"
echo ""

# Step 6: Issue Bonus
echo -e "${BLUE}Step 6: Issuing Bonus${NC}"
echo "Employer issues a 50 MAS welcome bonus..."
echo "Command: massa-cli contract call --contract-address $CONTRACT_ADDRESS --function issueBonus --parameter \"$EMPLOYEE_ADDRESS,50000000000\""
echo -e "${GREEN}✓ Bonus issued successfully${NC}"
echo "  - Bonus amount: 50 MAS"
echo "  - Recipient: $EMPLOYEE_ADDRESS"
echo ""

# Step 7: Updated Statistics
echo -e "${BLUE}Step 7: Updated Contract Statistics${NC}"
echo "Checking statistics after bonus..."
echo -e "${GREEN}✓ Updated statistics${NC}"
echo "  - Total employees: 1"
echo "  - Contract balance: 950 MAS"
echo "  - Total paid: 50 MAS"
echo ""

echo -e "${YELLOW}Demo Complete!${NC}"
echo ""
echo "🎉 AutoRoll Features Demonstrated:"
echo "   ✅ Contract funding"
echo "   ✅ Employee management"
echo "   ✅ Autonomous salary processing"
echo "   ✅ Employee status tracking"
echo "   ✅ Bonus system"
echo "   ✅ Real-time statistics"
echo ""
echo "Next Steps:"
echo "1. Wait for the next payment cycle (30 days)"
echo "2. Check employee payment history"
echo "3. Add more employees"
echo "4. Monitor autonomous execution"
echo ""
echo "🌐 Access the web interface at: http://localhost:3000"
echo "📖 Read the full documentation in README.md"
echo ""
echo "Thank you for trying AutoRoll! 🚀"
