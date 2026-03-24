import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Offer, UserProfile } from '../types';
import { ExternalLink, DollarSign, Tag, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OfferWallProps {
  user: UserProfile | null;
}

export const OfferWall: React.FC<OfferWallProps> = ({ user }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'offers'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const offersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
      setOffers(offersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleComplete = async (offer: Offer) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please sign in to complete offers.' });
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'leads'), {
        userId: user.uid,
        offerId: offer.id,
        offerTitle: offer.title,
        payout: offer.payout,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setMessage({ type: 'success', text: 'Lead submitted! It will be reviewed shortly.' });
      setSelectedOffer(null);
    } catch (error) {
      console.error("Lead submission failed", error);
      setMessage({ type: 'error', text: 'Failed to submit lead. Please try again.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Available Offers</h1>
          <p className="text-lg text-gray-500">Complete simple tasks and earn real cash rewards.</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100">
          <DollarSign className="text-indigo-600 w-6 h-6" />
          <div>
            <span className="block text-sm font-medium text-indigo-900">Total Offers</span>
            <span className="text-2xl font-bold text-indigo-600 leading-none">{offers.length}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {offers.map((offer) => (
          <motion.div 
            key={offer.id}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-indigo-50 p-3 rounded-2xl">
                <Tag className="text-indigo-600 w-6 h-6" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Payout</span>
                <span className="text-3xl font-black text-indigo-600">${offer.payout.toFixed(2)}</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{offer.title}</h3>
            <p className="text-gray-500 text-sm mb-8 line-clamp-3 flex-grow">{offer.description}</p>

            <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
              <button 
                onClick={() => setSelectedOffer(offer)}
                className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-colors"
              >
                View Details
              </button>
              <a 
                href={offer.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors"
              >
                <ExternalLink className="w-6 h-6" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedOffer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] max-w-2xl w-full p-10 shadow-2xl relative"
          >
            <button 
              onClick={() => setSelectedOffer(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-600 p-4 rounded-3xl">
                <DollarSign className="text-white w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedOffer.title}</h2>
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <span>{selectedOffer.category}</span>
                  <span className="text-gray-300">•</span>
                  <span>${selectedOffer.payout.toFixed(2)} Payout</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{selectedOffer.description}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Instructions</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Click the link below to visit the offer page.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Complete the required steps (e.g., sign up, survey).</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Click "Submit Lead" here once you've finished.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={selectedOffer.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-indigo-600 text-white font-bold py-5 rounded-2xl hover:bg-indigo-700 transition-all text-center flex items-center justify-center gap-3"
              >
                <ExternalLink className="w-5 h-5" />
                Open Offer Link
              </a>
              <button 
                onClick={() => handleComplete(selectedOffer)}
                disabled={submitting}
                className="flex-1 bg-gray-900 text-white font-bold py-5 rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Submit Lead
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
