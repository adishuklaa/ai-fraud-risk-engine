export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type Action = 'Approve' | 'Flag' | 'Decline';

export interface Rule {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  currency: string;
  country: string;
  merchantCategory: string;
  device: string;
  ipRiskScore: number; // 0-100
  velocity: number; // transactions in last 24h
  accountAgeDays: number;
  previousBehaviorMatch: boolean;
  cardPresent: boolean;
  timeOfDay: string; // HH:mm
  
  // Computed properties
  riskScore?: number;
  riskLevel?: RiskLevel;
  triggeredRules?: Rule[];
  recommendedAction?: Action;
  explanation?: string;
}

export const RULES: Rule[] = [
  { id: 'R01', name: 'High Amount', description: 'Transaction amount unusually high for this account', weight: 30 },
  { id: 'R02', name: 'Foreign Country', description: 'Transaction from a country different from base', weight: 25 },
  { id: 'R03', name: 'High Velocity', description: 'Multiple transactions in a short period', weight: 20 },
  { id: 'R04', name: 'New Account', description: 'Account age is less than 30 days', weight: 15 },
  { id: 'R05', name: 'Anomalous Device', description: 'Device used has not been seen before', weight: 15 },
  { id: 'R06', name: 'Suspicious IP', description: 'IP address has a high risk score', weight: 35 },
  { id: 'R07', name: 'Odd Hour', description: 'Transaction at unusual local time', weight: 10 },
  { id: 'R08', name: 'Behavior Mismatch', description: 'Does not match past purchasing behavior', weight: 20 },
];

export const generateSyntheticData = (count: number): Transaction[] => {
  const countries = ['US', 'CA', 'GB', 'FR', 'DE', 'JP', 'NG', 'RU', 'CN'];
  const merchants = ['Electronics', 'Grocery', 'Travel', 'Crypto', 'Gaming', 'Retail'];
  const devices = ['iPhone 13', 'Windows PC', 'MacBook Pro', 'Android Phone', 'Unknown Device'];
  
  const transactions: Transaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isRisky = Math.random() > 0.8;
    const time = new Date(now.getTime() - Math.random() * 86400000 * 7); // Last 7 days
    
    const txn: Transaction = {
      id: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      timestamp: time.toISOString(),
      amount: isRisky ? Math.floor(Math.random() * 5000) + 500 : Math.floor(Math.random() * 200) + 5,
      currency: 'USD',
      country: isRisky ? countries[Math.floor(Math.random() * countries.length)] : 'US',
      merchantCategory: merchants[Math.floor(Math.random() * merchants.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      ipRiskScore: isRisky ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 20),
      velocity: isRisky ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 3),
      accountAgeDays: isRisky ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 1000) + 30,
      previousBehaviorMatch: !isRisky,
      cardPresent: Math.random() > 0.5,
      timeOfDay: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
    };
    
    // Evaluate rules
    const triggered: Rule[] = [];
    if (txn.amount > 1000) triggered.push(RULES[0]);
    if (txn.country !== 'US') triggered.push(RULES[1]);
    if (txn.velocity > 5) triggered.push(RULES[2]);
    if (txn.accountAgeDays < 30) triggered.push(RULES[3]);
    if (txn.device === 'Unknown Device') triggered.push(RULES[4]);
    if (txn.ipRiskScore > 75) triggered.push(RULES[5]);
    const hour = parseInt(txn.timeOfDay.split(':')[0]);
    if (hour >= 1 && hour <= 5) triggered.push(RULES[6]);
    if (!txn.previousBehaviorMatch) triggered.push(RULES[7]);
    
    const score = triggered.reduce((acc, rule) => acc + rule.weight, 0);
    // Normalize to 0-100 roughly (cap at 100)
    txn.riskScore = Math.min(100, Math.floor(score * 0.8));
    txn.triggeredRules = triggered;
    
    if (txn.riskScore < 20) {
      txn.riskLevel = 'Low';
      txn.recommendedAction = 'Approve';
      txn.explanation = 'Transaction looks normal. Routine patterns matched.';
    } else if (txn.riskScore < 50) {
      txn.riskLevel = 'Medium';
      txn.recommendedAction = 'Flag';
      txn.explanation = 'Slight anomalies detected. Recommend manual review or step-up authentication.';
    } else if (txn.riskScore < 80) {
      txn.riskLevel = 'High';
      txn.recommendedAction = 'Decline';
      txn.explanation = 'Multiple risk factors present. High probability of fraud.';
    } else {
      txn.riskLevel = 'Critical';
      txn.recommendedAction = 'Decline';
      txn.explanation = 'Severe risk factors triggered. Immediate block recommended.';
    }
    
    transactions.push(txn);
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
