import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Lead, Withdrawal, UserProfile } from '../types';
import { Wallet, History, CreditCard, Clock, CheckCircle2, XCircle, Send, AlertCircle, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('PayPal');
  const [withdrawalDetails, setWithdrawalDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const leadsQ = query(collection(db, 'leads'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const withdrawalsQ = query(collection(db, 'withdrawals'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribeLeads = onSnapshot(leadsQ, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
    });

    const unsubscribeWithdrawals = onSnapshot(withdrawalsQ, (snapshot) => {
      setWithdrawals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Withdrawal)));
      setLoading(false);
    });

    return () => {
      unsubscribeLeads();
      unsubscribeWithdrawals();
    };
  }, [user.uid]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }
    if (amount > user.balance) {
      setMessage({ type: 'error', text: 'Insufficient balance.' });
      return;
    }
    if (amount < 10) {
      setMessage({ type: 'error', text: 'Minimum withdrawal is $10.00.' });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        amount,
        method: withdrawalMethod,
        details: withdrawalDetails,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setMessage({ type: 'success', text: 'Withdrawal request submitted!' });
      setWithdrawalAmount('');
      setWithdrawalDetails('');
    } catch (error) {
      console.error("Withdrawal failed", error);
      setMessage({ type: 'error', text: 'Failed to submit withdrawal request.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Stats and Withdrawal */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 opacity-80">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Available Balance</span>
              </div>
              <h2 className="text-5xl font-black mb-2 leading-none">${user.balance.toFixed(2)}</h2>
              <p className="text-indigo-100 text-sm font-medium">Total Earned: ${user.totalEarned.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <CreditCard className="text-indigo-600 w-6 h-6" />
              <h3 className="text-2xl font-black text-gray-900 leading-tight">Withdraw Funds</h3>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (Min $10)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="number" 
                    step="0.01"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Method</label>
                <select 
                  value={withdrawalMethod}
                  onChange={(e) => setWithdrawalMethod(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                >
                  <option>PayPal</option>
                  <option>Wire Transfer</option>
                  <option>Crypto (USDT)</option>
                  <option>Gift Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Details</label>
                <textarea 
                  value={withdrawalDetails}
                  onChange={(e) => setWithdrawalDetails(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none min-h-[100px]"
                  placeholder="Enter your email or wallet address..."
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Request Withdrawal
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`mt-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                >
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* History Tables */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <History className="text-indigo-600 w-6 h-6" />
              <h3 className="text-2xl font-black text-gray-900 leading-tight">Recent Leads</h3>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Offer</th>
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Payout</th>
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-medium italic">No leads found. Start completing offers!</td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 font-bold text-gray-900">{lead.offerTitle}</td>
                          <td className="px-8 py-6 font-black text-indigo-600">${lead.payout.toFixed(2)}</td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                            {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'Pending'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <CreditCard className="text-indigo-600 w-6 h-6" />
              <h3 className="text-2xl font-black text-gray-900 leading-tight">Withdrawal History</h3>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Method</th>
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-medium italic">No withdrawal requests yet.</td>
                      </tr>
                    ) : (
                      withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 font-black text-indigo-600">${w.amount.toFixed(2)}</td>
                          <td className="px-8 py-6 font-bold text-gray-900">{w.method}</td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(w.status)}`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                            {w.createdAt?.toDate ? w.createdAt.toDate().toLocaleDateString() : 'Pending'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
