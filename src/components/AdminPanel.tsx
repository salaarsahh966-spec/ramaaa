import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy, getDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Offer, Lead, Withdrawal, UserProfile } from '../types';
import { Plus, Check, X, Users, DollarSign, List, BarChart3, Trash2, Edit3, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminPanelProps {
  user: UserProfile;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'offers' | 'leads' | 'withdrawals' | 'users'>('offers');

  // New Offer Form
  const [newOffer, setNewOffer] = useState({ title: '', description: '', payout: '', link: '', category: 'Survey' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email !== 'salaarsahh966@gmail.com') return;
    const unsubOffers = onSnapshot(query(collection(db, 'offers'), orderBy('createdAt', 'desc')), (s) => setOffers(s.docs.map(d => ({ id: d.id, ...d.data() } as Offer))), (error) => {
      handleFirestoreError(error, OperationType.LIST, 'offers');
    });
    const unsubLeads = onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc')), (s) => setLeads(s.docs.map(d => ({ id: d.id, ...d.data() } as Lead))), (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });
    const unsubWithdrawals = onSnapshot(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')), (s) => setWithdrawals(s.docs.map(d => ({ id: d.id, ...d.data() } as Withdrawal))), (error) => {
      handleFirestoreError(error, OperationType.LIST, 'withdrawals');
    });
    const unsubUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (s) => setUsers(s.docs.map(d => ({ uid: d.id, ...d.data() } as unknown as UserProfile))), (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    setLoading(false);
    return () => { unsubOffers(); unsubLeads(); unsubWithdrawals(); unsubUsers(); };
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'offers'), {
        ...newOffer,
        payout: parseFloat(newOffer.payout),
        status: 'active',
        createdAt: serverTimestamp()
      });
      setNewOffer({ title: '', description: '', payout: '', link: '', category: 'Survey' });
    } catch (error) {
      console.error("Create offer failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveLead = async (lead: Lead) => {
    try {
      await updateDoc(doc(db, 'leads', lead.id), { status: 'approved', updatedAt: serverTimestamp() });
      await updateDoc(doc(db, 'users', lead.userId), { 
        balance: increment(lead.payout),
        totalEarned: increment(lead.payout)
      });
    } catch (error) {
      console.error("Approve lead failed", error);
    }
  };

  const handleRejectLead = async (leadId: string) => {
    await updateDoc(doc(db, 'leads', leadId), { status: 'rejected', updatedAt: serverTimestamp() });
  };

  const handlePayWithdrawal = async (withdrawal: Withdrawal) => {
    try {
      await updateDoc(doc(db, 'withdrawals', withdrawal.id), { status: 'paid' });
      await updateDoc(doc(db, 'users', withdrawal.userId), { 
        balance: increment(-withdrawal.amount)
      });
    } catch (error) {
      console.error("Pay withdrawal failed", error);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    await updateDoc(doc(db, 'withdrawals', withdrawalId), { status: 'rejected' });
  };

  const chartData = [
    { name: 'Leads', value: leads.length, color: '#6366f1' },
    { name: 'Offers', value: offers.length, color: '#8b5cf6' },
    { name: 'Users', value: users.length, color: '#ec4899' },
    { name: 'Paid', value: withdrawals.filter(w => w.status === 'paid').length, color: '#10b981' }
  ];

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Admin Control</h1>
          <p className="text-gray-500 font-medium">Manage your CPA network, users, and payments.</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          {(['offers', 'leads', 'withdrawals', 'users'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-indigo-600">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Total Users</span>
          </div>
          <span className="text-4xl font-black text-gray-900">{users.length}</span>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-pink-600">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Total Payouts</span>
          </div>
          <span className="text-4xl font-black text-gray-900">${withdrawals.filter(w => w.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</span>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm lg:col-span-2">
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'offers' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Plus className="text-indigo-600 w-6 h-6" />
                Create New Offer
              </h3>
              <form onSubmit={handleCreateOffer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Offer Title</label>
                  <input required value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" placeholder="e.g. Complete Survey for $5" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea required value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 transition-all outline-none min-h-[100px]" placeholder="Explain what the user needs to do..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payout ($)</label>
                  <input required type="number" step="0.01" value={newOffer.payout} onChange={e => setNewOffer({...newOffer, payout: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" placeholder="5.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select value={newOffer.category} onChange={e => setNewOffer({...newOffer, category: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 transition-all outline-none appearance-none">
                    <option>Survey</option>
                    <option>App Install</option>
                    <option>Sign Up</option>
                    <option>Video</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Offer Link</label>
                  <input required type="url" value={newOffer.link} onChange={e => setNewOffer({...newOffer, link: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-600 transition-all outline-none" placeholder="https://..." />
                </div>
                <button disabled={submitting} className="md:col-span-2 bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-100">
                  {submitting ? 'Creating...' : 'Publish Offer'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Title</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Payout</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {offers.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-gray-900">{o.title}</td>
                      <td className="px-8 py-6 font-black text-indigo-600">${o.payout.toFixed(2)}</td>
                      <td className="px-8 py-6 text-sm text-gray-500">{o.category}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${o.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User ID</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Offer</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Payout</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 text-xs font-mono text-gray-400">{l.userId.slice(0, 8)}...</td>
                    <td className="px-8 py-6 font-bold text-gray-900">{l.offerTitle}</td>
                    <td className="px-8 py-6 font-black text-indigo-600">${l.payout.toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${l.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' : l.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {l.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleApproveLead(l)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleRejectLead(l.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'withdrawals' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Method</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Details</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 text-xs font-mono text-gray-400">{w.userId.slice(0, 8)}...</td>
                    <td className="px-8 py-6 font-black text-indigo-600">${w.amount.toFixed(2)}</td>
                    <td className="px-8 py-6 font-bold text-gray-900">{w.method}</td>
                    <td className="px-8 py-6 text-sm text-gray-500">{w.details}</td>
                    <td className="px-8 py-6 text-right">
                      {w.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handlePayWithdrawal(w)} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors">Pay</button>
                          <button onClick={() => handleRejectWithdrawal(w.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      )}
                      {w.status === 'paid' && <span className="text-xs font-black text-green-600 uppercase tracking-widest">Paid</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Balance</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Total Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-gray-900">{u.email}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-indigo-600">${u.balance.toFixed(2)}</td>
                    <td className="px-8 py-6 font-bold text-gray-500">${u.totalEarned.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
