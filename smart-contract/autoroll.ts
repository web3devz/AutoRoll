import {
  Address,
  Storage,
  Context,
  call,
  transferCoins,
  generateEvent,
  callerHasWriteAccess,
  isDeployingContract,
  fileToByteArray,
} from '@massalabs/massa-as-sdk';

// Employee structure
@serializable
export class Employee {
  wallet: Address;
  salary: u64;
  interval: u64; // in seconds
  nextPayTime: u64;
  active: bool;
  totalPaid: u64;

  constructor(
    wallet: Address = new Address(),
    salary: u64 = 0,
    interval: u64 = 0,
    nextPayTime: u64 = 0,
    active: bool = false,
    totalPaid: u64 = 0
  ) {
    this.wallet = wallet;
    this.salary = salary;
    this.interval = interval;
    this.nextPayTime = nextPayTime;
    this.active = active;
    this.totalPaid = totalPaid;
  }
}

// Storage keys
const OWNER_KEY = 'owner';
const EMPLOYEES_KEY = 'employees';
const EMPLOYEE_COUNT_KEY = 'employeeCount';
const CONTRACT_BALANCE_KEY = 'contractBalance';
const TOTAL_PAID_KEY = 'totalPaid';

/**
 * Initialize the contract
 */
export function constructor(_: StaticArray<u8>): void {
  if (!isDeployingContract()) {
    return;
  }
  
  // Set the deployer as the owner
  Storage.set(OWNER_KEY, Context.caller().toString());
  Storage.set(EMPLOYEE_COUNT_KEY, '0');
  Storage.set(CONTRACT_BALANCE_KEY, '0');
  Storage.set(TOTAL_PAID_KEY, '0');

  generateEvent('Contract initialized with owner: ' + Context.caller().toString());
}

/**
 * Add a new employee to the payroll
 * @param args - serialized array containing [employeeAddress, salary, interval]
 */
export function addEmployee(args: StaticArray<u8>): void {
  onlyOwner();
  
  const argsArray = args.toString().split(',');
  if (argsArray.length < 3) {
    throw new Error('Invalid arguments. Expected: address,salary,interval');
  }

  const employeeAddress = new Address(argsArray[0].trim());
  const salary = u64(parseInt(argsArray[1].trim()));
  const interval = u64(parseInt(argsArray[2].trim()));
  
  if (salary == 0 || interval == 0) {
    throw new Error('Salary and interval must be greater than 0');
  }

  const employeeKey = EMPLOYEES_KEY + ':' + employeeAddress.toString();
  
  // Check if employee already exists
  if (Storage.has(employeeKey)) {
    throw new Error('Employee already exists');
  }

  const currentTime = Context.timestamp();
  const nextPayTime = currentTime + interval * 1000; // Convert seconds to milliseconds

  const employee = new Employee(
    employeeAddress,
    salary,
    interval,
    nextPayTime,
    true,
    0
  );

  Storage.set(employeeKey, employee.serialize());
  
  // Increment employee count
  const count = parseInt(Storage.get(EMPLOYEE_COUNT_KEY));
  Storage.set(EMPLOYEE_COUNT_KEY, (count + 1).toString());

  generateEvent(`Employee added: ${employeeAddress.toString()}, salary: ${salary}, interval: ${interval}s`);
}

/**
 * Remove an employee from the payroll
 * @param args - serialized employee address
 */
export function removeEmployee(args: StaticArray<u8>): void {
  onlyOwner();
  
  const employeeAddress = new Address(args.toString().trim());
  const employeeKey = EMPLOYEES_KEY + ':' + employeeAddress.toString();
  
  if (!Storage.has(employeeKey)) {
    throw new Error('Employee not found');
  }

  const employeeData = Storage.get(employeeKey);
  const employee = Employee.deserialize(employeeData);
  
  if (!employee.active) {
    throw new Error('Employee is already inactive');
  }

  employee.active = false;
  Storage.set(employeeKey, employee.serialize());

  generateEvent(`Employee removed: ${employeeAddress.toString()}`);
}

/**
 * Fund the contract with coins
 */
export function fundContract(_: StaticArray<u8>): void {
  onlyOwner();
  
  const amount = Context.transferredCoins();
  if (amount == 0) {
    throw new Error('No coins transferred');
  }

  const currentBalance = u64(parseInt(Storage.get(CONTRACT_BALANCE_KEY)));
  const newBalance = currentBalance + amount;
  Storage.set(CONTRACT_BALANCE_KEY, newBalance.toString());

  generateEvent(`Contract funded with: ${amount} coins. New balance: ${newBalance}`);
}

/**
 * Process salary payments (autonomous execution)
 */
export function processSalaries(_: StaticArray<u8>): void {
  const currentTime = Context.timestamp();
  const employeeCount = parseInt(Storage.get(EMPLOYEE_COUNT_KEY));
  
  if (employeeCount == 0) {
    return;
  }

  let contractBalance = u64(parseInt(Storage.get(CONTRACT_BALANCE_KEY)));
  let totalPaid = u64(parseInt(Storage.get(TOTAL_PAID_KEY)));
  let paymentsProcessed = 0;

  // Iterate through all possible employees (this is a simplified approach)
  // In a production system, you'd want a more efficient way to track active employees
  const keys = Storage.getKeys();
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.startsWith(EMPLOYEES_KEY + ':')) {
      const employeeData = Storage.get(key);
      const employee = Employee.deserialize(employeeData);
      
      if (employee.active && currentTime >= employee.nextPayTime) {
        if (contractBalance >= employee.salary) {
          // Transfer salary to employee
          transferCoins(employee.wallet, employee.salary);
          
          // Update employee data
          employee.nextPayTime += employee.interval * 1000; // Next payment time
          employee.totalPaid += employee.salary;
          
          // Update contract state
          contractBalance -= employee.salary;
          totalPaid += employee.salary;
          paymentsProcessed++;
          
          // Save updated employee data
          Storage.set(key, employee.serialize());
          
          generateEvent(`Salary paid: ${employee.salary} to ${employee.wallet.toString()}`);
        } else {
          generateEvent(`Insufficient funds to pay ${employee.wallet.toString()}`);
        }
      }
    }
  }

  // Update contract balance and total paid
  Storage.set(CONTRACT_BALANCE_KEY, contractBalance.toString());
  Storage.set(TOTAL_PAID_KEY, totalPaid.toString());

  if (paymentsProcessed > 0) {
    generateEvent(`Processed ${paymentsProcessed} salary payments`);
  }

  // Schedule next execution (autonomous smart contract feature)
  // This will be called again after a certain period
  scheduleNextExecution();
}

/**
 * Schedule the next autonomous execution
 */
function scheduleNextExecution(): void {
  const nextExecutionTime = Context.timestamp() + 60000; // Execute every minute
  
  // Use Massa's ASC to schedule the next execution
  call(
    Context.callee(),
    'processSalaries',
    new StaticArray<u8>(0),
    nextExecutionTime
  );
}

/**
 * Issue a bonus to an employee
 * @param args - serialized array containing [employeeAddress, bonusAmount]
 */
export function issueBonus(args: StaticArray<u8>): void {
  onlyOwner();
  
  const argsArray = args.toString().split(',');
  if (argsArray.length < 2) {
    throw new Error('Invalid arguments. Expected: address,amount');
  }

  const employeeAddress = new Address(argsArray[0].trim());
  const bonusAmount = u64(parseInt(argsArray[1].trim()));
  
  if (bonusAmount == 0) {
    throw new Error('Bonus amount must be greater than 0');
  }

  const employeeKey = EMPLOYEES_KEY + ':' + employeeAddress.toString();
  
  if (!Storage.has(employeeKey)) {
    throw new Error('Employee not found');
  }

  const contractBalance = u64(parseInt(Storage.get(CONTRACT_BALANCE_KEY)));
  
  if (contractBalance < bonusAmount) {
    throw new Error('Insufficient contract balance for bonus');
  }

  // Transfer bonus
  transferCoins(employeeAddress, bonusAmount);
  
  // Update contract balance
  const newBalance = contractBalance - bonusAmount;
  Storage.set(CONTRACT_BALANCE_KEY, newBalance.toString());
  
  // Update total paid
  const totalPaid = u64(parseInt(Storage.get(TOTAL_PAID_KEY)));
  Storage.set(TOTAL_PAID_KEY, (totalPaid + bonusAmount).toString());

  generateEvent(`Bonus issued: ${bonusAmount} to ${employeeAddress.toString()}`);
}

/**
 * Get employee information
 * @param args - serialized employee address
 */
export function getEmployee(args: StaticArray<u8>): StaticArray<u8> {
  const employeeAddress = new Address(args.toString().trim());
  const employeeKey = EMPLOYEES_KEY + ':' + employeeAddress.toString();
  
  if (!Storage.has(employeeKey)) {
    throw new Error('Employee not found');
  }

  return Storage.get(employeeKey);
}

/**
 * Get contract statistics
 */
export function getContractStats(_: StaticArray<u8>): StaticArray<u8> {
  const employeeCount = Storage.get(EMPLOYEE_COUNT_KEY);
  const contractBalance = Storage.get(CONTRACT_BALANCE_KEY);
  const totalPaid = Storage.get(TOTAL_PAID_KEY);
  
  const stats = `${employeeCount},${contractBalance},${totalPaid}`;
  return stringToBytes(stats);
}

/**
 * Get contract owner
 */
export function getOwner(_: StaticArray<u8>): StaticArray<u8> {
  return stringToBytes(Storage.get(OWNER_KEY));
}

/**
 * Only owner modifier
 */
function onlyOwner(): void {
  const owner = Storage.get(OWNER_KEY);
  if (Context.caller().toString() !== owner) {
    throw new Error('Only owner can call this function');
  }
}

/**
 * Utility function to convert string to bytes
 */
function stringToBytes(str: string): StaticArray<u8> {
  const bytes = new StaticArray<u8>(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

/**
 * Start autonomous execution
 */
export function startAutonomousExecution(_: StaticArray<u8>): void {
  onlyOwner();
  scheduleNextExecution();
  generateEvent('Autonomous salary processing started');
}
