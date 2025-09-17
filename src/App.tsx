import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, ShieldCheck, Shield, AlertTriangle, 
  Activity, CreditCard, Smartphone, 
  Globe, Clock, Search, PlayCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { generateSyntheticData } from './data';
import type { Transaction } from './data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateSyntheticData(100));
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    const total = transactions.length;
    const approved = transactions.filter(t => t.recommendedAction === 'Approve').length;
    const flagged = transactions.filter(t => t.recommendedAction === 'Flag').length;
    const declined = transactions.filter(t => t.recommendedAction === 'Decline').length;
    const highRisk = transactions.filter(t => t.riskLevel === 'High' || t.riskLevel === 'Critical').length;
    
    return { total, approved, flagged, declined, highRisk };
  }, [transactions]);

  const riskDistribution = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    transactions.forEach(t => { if (t.riskLevel) counts[t.riskLevel]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const ruleFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      t.triggeredRules?.forEach(r => {
        counts[r.name] = (counts[r.name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [transactions]);

  const simulateNewTransaction = () => {
    const newTxns = generateSyntheticData(1);
    setTransactions(prev => [newTxns[0], ...prev]);
    setSelectedTxn(newTxns[0]);
  };

  const filteredTxns = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.merchantCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444',
    Critical: '#991B1B'
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight">AI Fraud & Risk Engine</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={simulateNewTransaction}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
          >
            <PlayCircle className="w-4 h-4" />
            Simulate Transaction
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Column: Dashboard & List */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Volume" value={stats.total} icon={<Activity />} color="text-blue-600" />
            <StatCard title="Approved" value={stats.approved} icon={<ShieldCheck />} color="text-emerald-500" />
            <StatCard title="Flagged (Review)" value={stats.flagged} icon={<AlertTriangle />} color="text-amber-500" />
            <StatCard title="Declined" value={stats.declined} icon={<ShieldAlert />} color="text-red-500" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Risk Distribution</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Top Triggered Rules</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ruleFrequency} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search ID or Merchant..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium">Txn ID</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Merchant</th>
                    <th className="px-4 py-3 font-medium">Risk Score</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTxns.map(txn => (
                    <tr 
                      key={txn.id} 
                      onClick={() => setSelectedTxn(txn)}
                      className={cn(
                        "cursor-pointer hover:bg-blue-50 transition-colors",
                        selectedTxn?.id === txn.id && "bg-blue-50"
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{txn.id}</td>
                      <td className="px-4 py-3 font-medium">${txn.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">{txn.merchantCategory}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-bold",
                          txn.riskLevel === 'Low' && "bg-emerald-100 text-emerald-800",
                          txn.riskLevel === 'Medium' && "bg-amber-100 text-amber-800",
                          txn.riskLevel === 'High' && "bg-red-100 text-red-800",
                          txn.riskLevel === 'Critical' && "bg-red-900 text-white",
                        )}>
                          {txn.riskScore} / 100
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "flex items-center gap-1 text-xs font-semibold",
                          txn.recommendedAction === 'Approve' && "text-emerald-600",
                          txn.recommendedAction === 'Flag' && "text-amber-600",
                          txn.recommendedAction === 'Decline' && "text-red-600",
                        )}>
                          {txn.recommendedAction === 'Approve' && <ShieldCheck className="w-3 h-3" />}
                          {txn.recommendedAction === 'Flag' && <AlertTriangle className="w-3 h-3" />}
                          {txn.recommendedAction === 'Decline' && <ShieldAlert className="w-3 h-3" />}
                          {txn.recommendedAction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Transaction Details (Explainability) */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {selectedTxn ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header */}
              <div className={cn(
                "p-5 text-white border-b",
                selectedTxn.riskLevel === 'Low' && "bg-emerald-600",
                selectedTxn.riskLevel === 'Medium' && "bg-amber-500",
                selectedTxn.riskLevel === 'High' && "bg-red-500",
                selectedTxn.riskLevel === 'Critical' && "bg-red-800"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold">Transaction Details</h2>
                  <span className="px-2 py-1 bg-white/20 rounded text-sm font-bold shadow-sm backdrop-blur-sm">
                    {selectedTxn.riskScore} / 100
                  </span>
                </div>
                <p className="font-mono text-sm opacity-90">{selectedTxn.id}</p>
              </div>

              {/* Action Recommendation */}
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI Recommendation</h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    selectedTxn.recommendedAction === 'Approve' && "bg-emerald-100 text-emerald-600",
                    selectedTxn.recommendedAction === 'Flag' && "bg-amber-100 text-amber-600",
                    selectedTxn.recommendedAction === 'Decline' && "bg-red-100 text-red-600"
                  )}>
                    {selectedTxn.recommendedAction === 'Approve' && <ShieldCheck className="w-6 h-6" />}
                    {selectedTxn.recommendedAction === 'Flag' && <AlertTriangle className="w-6 h-6" />}
                    {selectedTxn.recommendedAction === 'Decline' && <ShieldAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{selectedTxn.recommendedAction}</div>
                    <div className="text-sm text-gray-600">Risk Level: <span className="font-semibold">{selectedTxn.riskLevel}</span></div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 mt-3 italic shadow-sm">
                  "{selectedTxn.explanation}"
                </p>
              </div>

              {/* Context Details */}
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Context</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <DetailItem icon={<CreditCard />} label="Amount" value={`$${selectedTxn.amount.toFixed(2)}`} />
                  <DetailItem icon={<Globe />} label="Country" value={selectedTxn.country} />
                  <DetailItem icon={<Smartphone />} label="Device" value={selectedTxn.device} />
                  <DetailItem icon={<Clock />} label="Time" value={selectedTxn.timeOfDay} />
                  <DetailItem icon={<Activity />} label="IP Risk" value={`${selectedTxn.ipRiskScore}/100`} />
                  <DetailItem icon={<Shield />} label="Card Present" value={selectedTxn.cardPresent ? "Yes" : "No"} />
                  <DetailItem icon={<Activity />} label="Velocity" value={`${selectedTxn.velocity} in 24h`} />
                  <DetailItem icon={<Clock />} label="Account Age" value={`${selectedTxn.accountAgeDays} days`} />
                </div>
              </div>

              {/* Triggered Rules (Explainability) */}
              <div className="p-5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Triggered Rules (Explainability)</h3>
                {selectedTxn.triggeredRules && selectedTxn.triggeredRules.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTxn.triggeredRules.map(rule => (
                      <div key={rule.id} className="bg-red-50 border border-red-100 rounded p-3 flex gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-red-800 text-sm">{rule.name}</span>
                            <span className="text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-mono">+{rule.weight}</span>
                          </div>
                          <p className="text-xs text-red-700">{rule.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded border border-emerald-100">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-medium">No high-risk rules triggered.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-gray-600">No Transaction Selected</p>
              <p className="text-sm mt-2">Select a transaction from the list to view its risk analysis and AI explanation.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-gray-50", color)}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
      </div>
      <div>
        <div className="text-sm text-gray-500 font-medium">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-gray-400 mt-0.5">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4" })}
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-medium text-gray-900 truncate">{value}</div>
      </div>
    </div>
  );
}
