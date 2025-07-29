// AutoRoll Frontend - Hybrid Implementation
// Works in both demo mode and real Massa blockchain mode

interface Employee {
  address: string;
  salary: bigint;
  interval: bigint;
  nextPayTime: bigint;
  active: boolean;
  totalPaid: bigint;
}

interface ContractStats {
  employeeCount: number;
  contractBalance: bigint;
  totalPaid: bigint;
  autonomousActive: boolean;
}

declare global {
  interface Window {
    massa?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isConnected: () => boolean;
      on: (event: string, handler: (data: any) => void) => void;
    };
  }
}

// Demo mock contract for when Massa wallet is not available
class MockContract {
  private employees: Map<string, Employee> = new Map();
  private contractBalance: bigint = 0n;
  private totalPaid: bigint = 0n;

  addEmployee(address: string, salary: bigint, interval: bigint): void {
    if (this.employees.has(address)) {
      throw new Error('Employee already exists');
    }

    const employee: Employee = {
      address: address,
      salary: salary,
      interval: interval,
      nextPayTime: BigInt(Date.now()) + interval,
      active: true,
      totalPaid: 0n
    };

    this.employees.set(address, employee);
  }

  removeEmployee(address: string): void {
    const employee = this.employees.get(address);
    if (!employee) {
      throw new Error('Employee not found');
    }
    employee.active = false;
    this.employees.set(address, employee);
  }

  fundContract(amount: bigint): void {
    this.contractBalance += amount;
  }

  issueBonus(address: string, amount: bigint): void {
    if (this.contractBalance < amount) {
      throw new Error('Insufficient contract balance');
    }
    this.contractBalance -= amount;
    this.totalPaid += amount;
  }

  getEmployee(address: string): Employee | null {
    return this.employees.get(address) || null;
  }

  getStats(): ContractStats {
    let activeCount = 0;
    this.employees.forEach(emp => {
      if (emp.active) activeCount++;
    });

    return {
      employeeCount: activeCount,
      contractBalance: this.contractBalance,
      totalPaid: this.totalPaid,
      autonomousActive: true
    };
  }

  processSalaries(): number {
    let processed = 0;
    const now = BigInt(Date.now());
    
    this.employees.forEach((employee, address) => {
      if (employee.active && now >= employee.nextPayTime) {
        if (this.contractBalance >= employee.salary) {
          this.contractBalance -= employee.salary;
          this.totalPaid += employee.salary;
          employee.totalPaid += employee.salary;
          employee.nextPayTime += employee.interval;
          processed++;
          this.employees.set(address, employee);
        }
      }
    });

    return processed;
  }
}

class AutoRollUI {
  private connectedAccount: string = '';
  private contractAddress: string = '';
  private massa: any = null;
  private isDemoMode: boolean = false;
  private mockContract: MockContract = new MockContract();

  constructor() {
    this.initializeUI();
    this.setupEventListeners();
    this.checkMassaWallet();
  }

  private initializeUI(): void {
    // Set up tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = (button as HTMLElement).dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(targetTab!)?.classList.add('active');
      });
    });
  }

  private setupEventListeners(): void {
    console.log('Setting up event listeners...');

    // Wallet connection
    const connectWalletBtn = document.getElementById('connectWallet');
    if (connectWalletBtn) {
      connectWalletBtn.addEventListener('click', () => {
        console.log('Connect wallet button clicked');
        this.connectWallet();
      });
    } else {
      console.error('Connect wallet button not found');
    }

    // Contract operations
    const connectContractBtn = document.getElementById('connectContractBtn');
    if (connectContractBtn) {
      connectContractBtn.addEventListener('click', () => {
        console.log('Connect contract button clicked');
        this.connectToContract();
      });
    }

    const deployBtn = document.getElementById('deployBtn');
    if (deployBtn) {
      deployBtn.addEventListener('click', () => {
        console.log('Deploy button clicked');
        this.deployContract();
      });
    }

    // Employer operations
    const fundBtn = document.getElementById('fundBtn');
    if (fundBtn) {
      fundBtn.addEventListener('click', () => {
        console.log('Fund button clicked');
        this.fundContract();
      });
    }

    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    if (addEmployeeBtn) {
      addEmployeeBtn.addEventListener('click', () => {
        console.log('Add employee button clicked');
        this.addEmployee();
      });
    }

    const removeEmployeeBtn = document.getElementById('removeEmployeeBtn');
    if (removeEmployeeBtn) {
      removeEmployeeBtn.addEventListener('click', () => {
        console.log('Remove employee button clicked');
        this.removeEmployee();
      });
    }

    const issueBonusBtn = document.getElementById('issueBonusBtn');
    if (issueBonusBtn) {
      issueBonusBtn.addEventListener('click', () => {
        console.log('Issue bonus button clicked');
        this.issueBonus();
      });
    }

    const startAutonomousBtn = document.getElementById('startAutonomousBtn');
    if (startAutonomousBtn) {
      startAutonomousBtn.addEventListener('click', () => {
        console.log('Start autonomous button clicked');
        this.startAutonomousExecution();
      });
    }

    // Employee operations
    const checkStatusBtn = document.getElementById('checkStatusBtn');
    if (checkStatusBtn) {
      checkStatusBtn.addEventListener('click', () => {
        console.log('Check status button clicked');
        this.checkEmployeeStatus();
      });
    }

    // Auto-refresh contract stats
    setInterval(() => {
      if ((this.contractAddress && this.connectedAccount) || this.isDemoMode) {
        this.refreshContractStats();
      }
    }, 10000); // Refresh every 10 seconds

    console.log('Event listeners setup complete');
  }

  private async checkMassaWallet(): Promise<void> {
    if (typeof window !== 'undefined' && window.massa) {
      this.massa = window.massa;
      this.showNotification('🎉 Massa Wallet detected! Click Connect for real blockchain interaction.', 'success');
    } else {
      this.isDemoMode = true;
      this.showNotification('⚠️ Massa Wallet not found. Running in demo mode. Install Massa Station for real blockchain interaction.', 'warning');
      
      // Set demo mode indicators
      const connectBtn = document.getElementById('connectWallet');
      if (connectBtn) {
        connectBtn.textContent = 'Connect Demo Wallet';
      }
      
      // Start demo processing
      this.startDemoProcessing();
    }
  }

  private async connectWallet(): Promise<void> {
    try {
      this.showLoading(true);
      
      if (this.isDemoMode) {
        // Demo mode connection
        setTimeout(() => {
          this.connectedAccount = 'AU12345demo...owner';
          this.updateWalletUI();
          this.showNotification('Demo wallet connected! This simulates real functionality.', 'success');
          this.showLoading(false);
        }, 1000);
        return;
      }

      if (!this.massa) {
        throw new Error('Massa Wallet not available. Please install Massa Station.');
      }

      // Real wallet connection
      const accounts = await this.massa.request({
        method: 'massa_accounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in Massa Wallet.');
      }

      this.connectedAccount = accounts[0];
      this.updateWalletUI();
      this.showNotification('Massa wallet connected successfully!', 'success');
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this.showNotification(`Failed to connect wallet: ${error}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  private updateWalletUI(): void {
    const addressElement = document.getElementById('walletAddress');
    if (addressElement) {
      addressElement.textContent = `${this.connectedAccount.slice(0, 8)}...${this.connectedAccount.slice(-6)}`;
    }

    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
      connectBtn.textContent = this.isDemoMode ? 'Demo Connected ✓' : 'Connected ✓';
      (connectBtn as HTMLButtonElement).disabled = true;
      connectBtn.style.background = '#28a745';
    }
  }

  private async deployContract(): Promise<void> {
    if (!this.connectedAccount) {
      this.showNotification('Please connect wallet first', 'warning');
      return;
    }

    if (this.isDemoMode) {
      this.contractAddress = 'AS12345demo...contract';
      const addressInput = document.getElementById('contractAddress') as HTMLInputElement;
      if (addressInput) {
        addressInput.value = this.contractAddress;
      }
      this.showNotification('Demo contract deployed successfully!', 'success');
      await this.refreshContractStats();
      return;
    }

    this.showNotification('Real contract deployment requires Massa wallet and network connection', 'warning');
  }

  private async connectToContract(): Promise<void> {
    const addressInput = document.getElementById('contractAddress') as HTMLInputElement;
    
    if (this.isDemoMode) {
      this.contractAddress = 'AS12345demo...contract';
      if (addressInput) {
        addressInput.value = this.contractAddress;
      }
      await this.refreshContractStats();
      this.showNotification('Connected to demo contract successfully!', 'success');
      return;
    }

    if (!addressInput || !addressInput.value.trim()) {
      this.showNotification('Please enter a contract address', 'warning');
      return;
    }

    this.contractAddress = addressInput.value.trim();
    
    try {
      await this.refreshContractStats();
      this.showNotification('Connected to contract successfully!', 'success');
    } catch (error) {
      console.error('Failed to connect to contract:', error);
      this.showNotification(`Failed to connect to contract: ${error}`, 'error');
    }
  }

  private async refreshContractStats(): Promise<void> {
    if (this.isDemoMode) {
      const stats = this.mockContract.getStats();
      this.updateStatsDisplay(stats);
      return;
    }

    if (!this.massa || !this.contractAddress || !this.connectedAccount) return;

    try {
      const result = await this.massa.request({
        method: 'massa_callSmartContract',
        params: [{
          targetAddress: this.contractAddress,
          targetFunction: 'getContractStats',
          parameter: [],
          callerAddress: this.connectedAccount
        }]
      });

      const parts = result.split(',');
      if (parts.length >= 4) {
        const stats: ContractStats = {
          employeeCount: parseInt(parts[0]),
          contractBalance: BigInt(parts[1]),
          totalPaid: BigInt(parts[2]),
          autonomousActive: parts[3] === 'true'
        };

        this.updateStatsDisplay(stats);
      }

    } catch (error) {
      console.error('Failed to refresh contract stats:', error);
    }
  }

  private updateStatsDisplay(stats: ContractStats): void {
    const balanceElement = document.getElementById('contractBalance');
    const countElement = document.getElementById('employeeCount');
    const totalPaidElement = document.getElementById('totalPaid');

    if (balanceElement) {
      const balanceInMAS = Number(stats.contractBalance) / 1e9;
      balanceElement.textContent = `${balanceInMAS.toFixed(4)} MAS`;
    }
    if (countElement) {
      countElement.textContent = stats.employeeCount.toString();
    }
    if (totalPaidElement) {
      const totalInMAS = Number(stats.totalPaid) / 1e9;
      totalPaidElement.textContent = `${totalInMAS.toFixed(4)} MAS`;
    }
  }

  private async fundContract(): Promise<void> {
    if (!this.connectedAccount) {
      this.showNotification('Please connect wallet first', 'warning');
      return;
    }

    const amountInput = document.getElementById('fundAmount') as HTMLInputElement;
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
      this.showNotification('Please enter a valid amount', 'warning');
      return;
    }

    try {
      this.showLoading(true);

      if (this.isDemoMode) {
        setTimeout(() => {
          const amountInNanoMAS = BigInt(Math.floor(amount * 1e9));
          this.mockContract.fundContract(amountInNanoMAS);
          this.showNotification(`Demo contract funded with ${amount} MAS`, 'success');
          amountInput.value = '';
          this.refreshContractStats();
          this.showLoading(false);
        }, 800);
        return;
      }

      const amountInNanoMAS = BigInt(Math.floor(amount * 1e9));

      await this.massa.request({
        method: 'massa_callSmartContract',
        params: [{
          targetAddress: this.contractAddress,
          targetFunction: 'fundContract',
          parameter: [amountInNanoMAS.toString()],
          callerAddress: this.connectedAccount,
          coins: amountInNanoMAS.toString()
        }]
      });

      this.showNotification(`Contract funded with ${amount} MAS`, 'success');
      amountInput.value = '';
      await this.refreshContractStats();

    } catch (error) {
      console.error('Failed to fund contract:', error);
      this.showNotification(`Failed to fund contract: ${error}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  private async addEmployee(): Promise<void> {
    if (!this.connectedAccount) {
      this.showNotification('Please connect wallet first', 'warning');
      return;
    }

    const addressInput = document.getElementById('employeeAddress') as HTMLInputElement;
    const salaryInput = document.getElementById('employeeSalary') as HTMLInputElement;
    const intervalInput = document.getElementById('paymentInterval') as HTMLInputElement;

    const address = addressInput.value.trim();
    const salary = parseFloat(salaryInput.value);
    const interval = parseInt(intervalInput.value);

    if (!address || !salary || !interval) {
      this.showNotification('Please fill all fields', 'warning');
      return;
    }

    try {
      this.showLoading(true);

      if (this.isDemoMode) {
        setTimeout(() => {
          const salaryInNanoMAS = BigInt(Math.floor(salary * 1e9));
          const intervalInMs = BigInt(interval * 1000);
          this.mockContract.addEmployee(address, salaryInNanoMAS, intervalInMs);
          this.showNotification('Demo employee added successfully!', 'success');
          
          addressInput.value = '';
          salaryInput.value = '';
          intervalInput.value = '2592000';
          
          this.refreshContractStats();
          this.showLoading(false);
        }, 800);
        return;
      }

      const salaryInNanoMAS = BigInt(Math.floor(salary * 1e9));

      await this.massa.request({
        method: 'massa_callSmartContract',
        params: [{
          targetAddress: this.contractAddress,
          targetFunction: 'addEmployee',
          parameter: [address, salaryInNanoMAS.toString(), interval.toString()],
          callerAddress: this.connectedAccount
        }]
      });

      this.showNotification('Employee added successfully!', 'success');
      
      addressInput.value = '';
      salaryInput.value = '';
      intervalInput.value = '2592000';
      
      await this.refreshContractStats();

    } catch (error) {
      console.error('Failed to add employee:', error);
      this.showNotification(`Failed to add employee: ${error}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  private async removeEmployee(): Promise<void> {
    if (!this.connectedAccount) {
      this.showNotification('Please connect wallet first', 'warning');
      return;
    }

    const addressInput = document.getElementById('removeAddress') as HTMLInputElement;
    const address = addressInput.value.trim();

    if (!address) {
      this.showNotification('Please enter employee address', 'warning');
      return;
    }

    try {
      this.showLoading(true);

      if (this.isDemoMode) {
        setTimeout(() => {
          this.mockContract.removeEmployee(address);
          this.showNotification('Demo employee removed successfully!', 'success');
          addressInput.value = '';
          this.refreshContractStats();
          this.showLoading(false);
        }, 800);
        return;
      }

      await this.massa.request({
        method: 'massa_callSmartContract',
        params: [{
          targetAddress: this.contractAddress,
          targetFunction: 'removeEmployee',
          parameter: [address],
          callerAddress: this.connectedAccount
        }]
      });

      this.showNotification('Employee removed successfully!', 'success');
      addressInput.value = '';
      await this.refreshContractStats();

    } catch (error) {
      console.error('Failed to remove employee:', error);
      this.showNotification(`Failed to remove employee: ${error}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  private async issueBonus(): Promise<void> {
    if (!this.connectedAccount) {
      this.showNotification('Please connect wallet first', 'warning');
      return;
    }

    const addressInput = document.getElementById('bonusAddress') as HTMLInputElement;
    const amountInput = document.getElementById('bonusAmount') as HTMLInputElement;

    const address = addressInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!address || !amount || amount <= 0) {
      this.showNotification('Please enter valid address and amount', 'warning');
      return;
    }

    try {
      this.showLoading(true);

      if (this.isDemoMode) {
        setTimeout(() => {
          const amountInNanoMAS = BigInt(Math.floor(amount * 1e9));
          this.mockContract.issueBonus(address, amountInNanoMAS);
          this.showNotification(`Demo bonus of ${amount} MAS issued successfully!`, 'success');
          
          addressInput.value = '';
          amountInput.value = '';
          this.refreshContractStats();
          this.showLoading(false);
        }, 800);
        return;
      }

      const amountInNanoMAS = BigInt(Math.floor(amount * 1e9));

      await this.massa.request({
        method: 'massa_callSmartContract',
        params: [{
          targetAddress: this.contractAddress,
          targetFunction: 'issueBonus',
          parameter: [address, amountInNanoMAS.toString()],
          callerAddress: this.connectedAccount
        }]
      });

      this.showNotification(`Bonus of ${amount} MAS issued successfully!`, 'success');
      
      addressInput.value = '';
      amountInput.value = '';
      await this.refreshContractStats();

    } catch (error) {
      console.error('Failed to issue bonus:', error);
      this.showNotification(`Failed to issue bonus: ${error}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  private async startAutonomousExecution(): Promise<void> {
    if (!this.connectedAccount) {
      this.showNotification('Please connect wallet first', 'warning');
      return;
    }

    try {
      this.showLoading(true);

      if (this.isDemoMode) {
        this.showNotification('Demo autonomous salary processing started!', 'success');
        this.updateAutonomousButton();
        this.showLoading(false);
        return;
      }

      await this.massa.request({
        method: 'massa_callSmartContract',
        params: [{
          targetAddress: this.contractAddress,
          targetFunction: 'startAutonomousExecution',
          parameter: [],
          callerAddress: this.connectedAccount
        }]
      });

      this.showNotification('Autonomous salary processing started!', 'success');
      this.updateAutonomousButton();

    } catch (error) {
      console.error('Failed to start autonomous execution:', error);
      this.showNotification(`Failed to start autonomous execution: ${error}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  private updateAutonomousButton(): void {
    const btn = document.getElementById('startAutonomousBtn') as HTMLButtonElement;
    if (btn) {
      btn.textContent = 'Auto-Processing Active ✓';
      btn.style.background = '#28a745';
      btn.disabled = true;
    }
  }

  private async checkEmployeeStatus(): Promise<void> {
    if (!this.connectedAccount) {
      this.showNotification('Please connect wallet first', 'warning');
      return;
    }

    try {
      this.showLoading(true);

      if (this.isDemoMode) {
        setTimeout(() => {
          const employee = this.mockContract.getEmployee(this.connectedAccount);
          this.displayEmployeeInfo(employee);
          this.showNotification('Demo employee status checked!', 'success');
          this.showLoading(false);
        }, 800);
        return;
      }

      const result = await this.massa.request({
        method: 'massa_callSmartContract',
        params: [{
          targetAddress: this.contractAddress,
          targetFunction: 'getEmployee',
          parameter: [this.connectedAccount],
          callerAddress: this.connectedAccount
        }]
      });

      const parts = result.split(',');
      if (parts.length >= 6) {
        const employee: Employee = {
          address: parts[0],
          salary: BigInt(parts[1]),
          interval: BigInt(parts[2]),
          nextPayTime: BigInt(parts[3]),
          active: parts[4] === 'true',
          totalPaid: BigInt(parts[5])
        };

        this.displayEmployeeInfo(employee);
      }

      this.showNotification('Employee status retrieved!', 'success');

    } catch (error) {
      console.error('Failed to check employee status:', error);
      this.displayEmployeeInfo(null);
      this.showNotification('Employee not found in contract', 'warning');
    } finally {
      this.showLoading(false);
    }
  }

  private displayEmployeeInfo(employee: Employee | null): void {
    const employeeInfoElement = document.getElementById('employeeInfo');
    if (!employeeInfoElement) return;

    if (employee && employee.active) {
      const salaryInMAS = Number(employee.salary) / 1e9;
      const totalPaidInMAS = Number(employee.totalPaid) / 1e9;
      const intervalInDays = Number(employee.interval) / (1000 * 60 * 60 * 24);
      const nextPayDate = new Date(Number(employee.nextPayTime)).toLocaleDateString();

      employeeInfoElement.innerHTML = `
        <h3>✅ Employment Status: ${employee.active ? 'Active' : 'Inactive'}</h3>
        <p><strong>Address:</strong> ${employee.address}</p>
        <p><strong>Salary:</strong> ${salaryInMAS.toFixed(4)} MAS</p>
        <p><strong>Payment Interval:</strong> ${intervalInDays.toFixed(1)} days</p>
        <p><strong>Next Payment:</strong> ${nextPayDate}</p>
        <p><strong>Total Paid:</strong> ${totalPaidInMAS.toFixed(4)} MAS</p>
      `;
    } else {
      employeeInfoElement.innerHTML = `
        <h3>❌ Employment Status: Not Found</h3>
        <p>You are not registered as an employee in this contract.</p>
        <p><strong>Connected Address:</strong> ${this.connectedAccount}</p>
      `;
    }
  }

  private startDemoProcessing(): void {
    if (!this.isDemoMode) return;

    // Simulate autonomous salary processing every 30 seconds in demo mode
    setInterval(() => {
      const processed = this.mockContract.processSalaries();
      if (processed > 0) {
        this.showNotification(`🤖 Demo autonomous processing: ${processed} salary payment(s) processed`, 'success');
        this.refreshContractStats();
      }
    }, 30000);
  }

  private showLoading(show: boolean): void {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      if (show) {
        loadingElement.classList.remove('hidden');
      } else {
        loadingElement.classList.add('hidden');
      }
    }
  }

  public showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notificationsContainer.appendChild(notification);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing AutoRoll...');
  const ui = new AutoRollUI();
  
  // Show welcome message
  setTimeout(() => {
    ui.showNotification('🎯 AutoRoll initialized! All buttons are now working. Try connecting the demo wallet!', 'success');
  }, 1000);
});

// Export for module usage
export default AutoRollUI;
