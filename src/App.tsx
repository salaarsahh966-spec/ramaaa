import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { OfferWall } from './components/OfferWall';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { DollarSign, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'offers' | 'dashboard' | 'admin'>('offers');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Setup real-time listener for user profile
        const unsubUser = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
          } else {
            // Create new user profile
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              role: firebaseUser.email === 'salaarsahh966@gmail.com' ? 'admin' : 'user',
              balance: 0,
              totalEarned: 0,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, {
              ...newUser,
              createdAt: serverTimestamp()
            });
            setUser(newUser);
          }
          setLoading(false);
        });

        return () => unsubUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-indigo-600 p-4 rounded-3xl animate-pulse">
            <DollarSign className="text-white w-10 h-10" />
          </div>
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading CPA Elite</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar user={user} onViewChange={setView} currentView={view} />

      <main>
        {view === 'offers' && (
          <>
            {!user && (
              <section className="relative overflow-hidden pt-20 pb-16 min-h-[80vh] flex items-center">
                {/* User's Background Photo */}
                <div 
                  className="absolute inset-0 z-0 opacity-20"
                  style={{
                    backgroundImage: 'url("https://picsum.photos/seed/cpa/1920/1080")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(20%)'
                  }}
                ></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="text-center max-w-4xl mx-auto">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-indigo-100"
                    >
                      <Zap className="w-3 h-3" />
                      The World's #1 CPA Network
                    </motion.div>
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight leading-[0.9] mb-8"
                    >
                      TURN YOUR <span className="text-indigo-600">TRAFFIC</span> INTO <span className="text-indigo-600">REVENUE</span>
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto"
                    >
                      Join thousands of publishers earning daily payouts by completing high-converting CPA offers from top brands.
                    </motion.p>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                      <button 
                        onClick={() => setView('offers')}
                        className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-3 group"
                      >
                        Start Earning Now
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <div className="flex items-center gap-4 px-8 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <div className="flex -space-x-3">
                          {[1,2,3].map(i => (
                            <img key={i} src={`https://picsum.photos/seed/user${i}/40/40`} className="w-10 h-10 rounded-full border-4 border-white" referrerPolicy="no-referrer" />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-600">10k+ Active Publishers</span>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
                </div>
              </section>
            )}
            <OfferWall user={user} />
          </>
        )}
        {view === 'dashboard' && user && <Dashboard user={user} />}
        {view === 'admin' && user?.role === 'admin' && <AdminPanel />}
      </main>

      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <DollarSign className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">CPA ELITE</span>
              </div>
              <p className="text-gray-500 font-medium max-w-sm mb-8">
                The most transparent and high-paying CPA network for publishers worldwide. We provide the tools you need to scale your earnings.
              </p>
              <div className="flex gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <ShieldCheck className="text-indigo-600 w-5 h-5" />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Globe className="text-indigo-600 w-5 h-5" />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Zap className="text-indigo-600 w-5 h-5" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><button onClick={() => setView('offers')} className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Offer Wall</button></li>
                <li><button onClick={() => setView('dashboard')} className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Publisher Dashboard</button></li>
                <li><a href="#" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Payment Proofs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-bold text-gray-400">© 2026 CPA Elite Marketing. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Network Status: Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
