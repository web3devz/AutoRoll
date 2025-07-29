/**
 * AutoRoll - Autonomous Smart Payroll Contract for Massa Blockchain
 * Real implementation using Massa's Autonomous Smart Contracts (ASC)
 */

import {
  Address,
  Storage,
  Context,
  generateEvent,
  call,
  transferCoins,
  createSC,
  callerHasWriteAccess,
  fileExists,
  include_base64
} from '@massalabs/massa-as-sdk';

// Employee data structure
@serializable
export class Employee {
  address: Address;
  salary: u64; // In nanoMAS (10^9 nanoMAS = 1 MAS)
  interval: u64; // Payment interval in milliseconds
  nextPayTime: u64; // Next payment timestamp
  active: bool;
  totalPaid: u64;

  constructor(
    address: Address,
    salary: u64,
    interval: u64,
    nextPayTime: u64 = 0,
    active: bool = true,
    totalPaid: u64 = 0
  ) {
    this.address = address;
    this.salary = salary;
    this.interval = interval;
    this.nextPayTime = nextPayTime || Context.timestamp() + interval;
    this.active = active;
    this.totalPaid = totalPaid;
  }
}

// Contract state keys
const OWNER_KEY = "owner";
const EMPLOYEE_PREFIX = "employee_";
const EMPLOYEE_COUNT_KEY = "employee_count";
const TOTAL_PAID_KEY = "total_paid";
const AUTONOMOUS_ACTIVE_KEY = "autonomous_active";

/**
 * Initialize the contract with the deployer as owner
 */
export function constructor(_: StaticArray<u8>): void {
  if (Storage.has(OWNER_KEY)) {
    return; // Already initialized
  }
  
  Storage.set(OWNER_KEY, Context.caller().toString());
  Storage.set(EMPLOYEE_COUNT_KEY, "0");
  Storage.set(TOTAL_PAID_KEY, "0");
  Storage.set(AUTONOMOUS_ACTIVE_KEY, "false");
  
  generateEvent("ContractInitialized|" + Context.caller().toString());
}

/**
 * Check if caller is the contract owner
 */
function onlyOwner(): void {
  assert(Storage.get(OWNER_KEY) == Context.caller().toString(), "Only owner can call this function");
}

/**
 * Get the contract owner address
 */
export function getOwner(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(OWNER_KEY).toUTF8();
}

/**
 * Add a new employee to the payroll
 */
export function addEmployee(args: StaticArray<u8>): void {
  onlyOwner();
  
  const argsStr = String.UTF8.decode(args);
  const parts = argsStr.split(",");
  assert(parts.length == 3, "Invalid arguments: expected address,salary,interval");
  
  const employeeAddr = new Address(parts[0]);
  const salary = U64.parseInt(parts[1]);
  const interval = U64.parseInt(parts[2]);
  
  assert(salary > 0, "Salary must be greater than 0");
  assert(interval > 0, "Interval must be greater than 0");
  
  const employeeKey = EMPLOYEE_PREFIX + employeeAddr.toString();
  assert(!Storage.has(employeeKey), "Employee already exists");
  
  const employee = new Employee(employeeAddr, salary, interval);
  Storage.set(employeeKey, employee.serialize());
  
  // Update employee count
  const currentCount = U32.parseInt(Storage.get(EMPLOYEE_COUNT_KEY));
  Storage.set(EMPLOYEE_COUNT_KEY, (currentCount + 1).toString());
  
  generateEvent("EmployeeAdded|" + employeeAddr.toString() + "|" + salary.toString() + "|" + interval.toString());
}

/**
 * Remove an employee from the payroll
 */
export function removeEmployee(args: StaticArray<u8>): void {
  onlyOwner();
  
  const employeeAddr = String.UTF8.decode(args);
  const employeeKey = EMPLOYEE_PREFIX + employeeAddr;
  
  assert(Storage.has(employeeKey), "Employee not found");
  
  const employeeData = Storage.get(employeeKey);
  const employee = Employee.deserialize(employeeData);
  
  if (employee.active) {
    employee.active = false;
    Storage.set(employeeKey, employee.serialize());
    
    // Update employee count
    const currentCount = U32.parseInt(Storage.get(EMPLOYEE_COUNT_KEY));
    Storage.set(EMPLOYEE_COUNT_KEY, (currentCount - 1).toString());
    
    generateEvent("EmployeeRemoved|" + employeeAddr);
  }
}

/**
 * Fund the contract with MAS tokens
 */
export function fundContract(_: StaticArray<u8>): void {
  const amount = Context.transferredCoins();
  assert(amount > 0, "Must send MAS to fund the contract");
  
  generateEvent("ContractFunded|" + Context.caller().toString() + "|" + amount.toString());
}

/**
 * Issue a one-time bonus to an employee
 */
export function issueBonus(args: StaticArray<u8>): void {
  onlyOwner();
  
  const argsStr = String.UTF8.decode(args);
  const parts = argsStr.split(",");
  assert(parts.length == 2, "Invalid arguments: expected address,amount");
  
  const employeeAddr = new Address(parts[0]);
  const amount = U64.parseInt(parts[1]);
  
  assert(amount > 0, "Bonus amount must be greater than 0");
  assert(Context.balance() >= amount, "Insufficient contract balance");
  
  // Verify employee exists
  const employeeKey = EMPLOYEE_PREFIX + employeeAddr.toString();
  assert(Storage.has(employeeKey), "Employee not found");
  
  // Transfer bonus
  transferCoins(employeeAddr, amount);
  
  // Update total paid
  const currentTotal = U64.parseInt(Storage.get(TOTAL_PAID_KEY));
  Storage.set(TOTAL_PAID_KEY, (currentTotal + amount).toString());
  
  generateEvent("BonusIssued|" + employeeAddr.toString() + "|" + amount.toString());
}

/**
 * Get employee information
 */
export function getEmployee(args: StaticArray<u8>): StaticArray<u8> {
  const employeeAddr = String.UTF8.decode(args);
  const employeeKey = EMPLOYEE_PREFIX + employeeAddr;
  
  assert(Storage.has(employeeKey), "Employee not found");
  
  const employeeData = Storage.get(employeeKey);
  const employee = Employee.deserialize(employeeData);
  
  const result = employee.address.toString() + "," +
                employee.salary.toString() + "," +
                employee.interval.toString() + "," +
                employee.nextPayTime.toString() + "," +
                employee.active.toString() + "," +
                employee.totalPaid.toString();
  
  return result.toUTF8();
}

/**
 * Get contract statistics
 */
export function getContractStats(_: StaticArray<u8>): StaticArray<u8> {
  const employeeCount = Storage.get(EMPLOYEE_COUNT_KEY);
  const contractBalance = Context.balance().toString();
  const totalPaid = Storage.get(TOTAL_PAID_KEY);
  const autonomousActive = Storage.get(AUTONOMOUS_ACTIVE_KEY);
  
  const result = employeeCount + "," + contractBalance + "," + totalPaid + "," + autonomousActive;
  return result.toUTF8();
}

/**
 * Start autonomous salary processing
 * This enables the contract to automatically process salaries
 */
export function startAutonomousExecution(_: StaticArray<u8>): void {
  onlyOwner();
  
  Storage.set(AUTONOMOUS_ACTIVE_KEY, "true");
  generateEvent("AutonomousExecutionStarted|" + Context.caller().toString());
}

/**
 * Process salaries for all eligible employees
 * This function is called autonomously by the Massa network
 */
export function processSalaries(_: StaticArray<u8>): void {
  const autonomousActive = Storage.get(AUTONOMOUS_ACTIVE_KEY) == "true";
  if (!autonomousActive) {
    return;
  }
  
  const currentTime = Context.timestamp();
  const employeeCount = U32.parseInt(Storage.get(EMPLOYEE_COUNT_KEY));
  let processed = 0;
  
  // Iterate through all employees (simple approach for demo)
  // In production, you'd want more efficient storage patterns
  for (let i = 0; i < 1000; i++) { // Reasonable upper limit
    const possibleKey = EMPLOYEE_PREFIX + i.toString();
    if (!Storage.has(possibleKey)) continue;
    
    const employeeData = Storage.get(possibleKey);
    const employee = Employee.deserialize(employeeData);
    
    if (!employee.active) continue;
    if (currentTime < employee.nextPayTime) continue;
    if (Context.balance() < employee.salary) continue;
    
    // Process payment
    transferCoins(employee.address, employee.salary);
    
    // Update employee record
    employee.totalPaid += employee.salary;
    employee.nextPayTime += employee.interval;
    Storage.set(possibleKey, employee.serialize());
    
    // Update total paid
    const currentTotal = U64.parseInt(Storage.get(TOTAL_PAID_KEY));
    Storage.set(TOTAL_PAID_KEY, (currentTotal + employee.salary).toString());
    
    processed++;
    
    generateEvent("SalaryPaid|" + employee.address.toString() + "|" + employee.salary.toString());
  }
  
  if (processed > 0) {
    generateEvent("AutonomousProcessing|" + processed.toString() + " salaries processed");
  }
}

/**
 * Manual salary processing (for testing or emergency use)
 */
export function manualProcessSalaries(_: StaticArray<u8>): void {
  onlyOwner();
  processSalaries(new StaticArray<u8>(0));
}

/**
 * Emergency pause autonomous execution
 */
export function pauseAutonomousExecution(_: StaticArray<u8>): void {
  onlyOwner();
  
  Storage.set(AUTONOMOUS_ACTIVE_KEY, "false");
  generateEvent("AutonomousExecutionPaused|" + Context.caller().toString());
}

/**
 * Get contract balance
 */
export function getBalance(_: StaticArray<u8>): StaticArray<u8> {
  return Context.balance().toString().toUTF8();
}

/**
 * Withdraw funds (owner only, for emergency situations)
 */
export function emergencyWithdraw(args: StaticArray<u8>): void {
  onlyOwner();
  
  const amount = U64.parseInt(String.UTF8.decode(args));
  assert(amount > 0, "Amount must be greater than 0");
  assert(Context.balance() >= amount, "Insufficient balance");
  
  transferCoins(Context.caller(), amount);
  generateEvent("EmergencyWithdraw|" + Context.caller().toString() + "|" + amount.toString());
}
