
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { RepairDocument, RepairCategory } from '../types';
import RepairCard from '../components/RepairCard';

const FeedScreen: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairDocument[]>([]);
  const [filter, setFilter] = useState<RepairCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setRepairs(storageService.getPublicRepairs());
  }, []);

  const filteredRepairs = repairs.filter(r => {
    const matchesCategory = filter === 'all' || r.category === filter;
    const matchesSearch = r.objectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.issueType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: (RepairCategory | 'all')[] = ['all', 'electronics', 'plumbing', 'appliance', 'furniture', 'other'];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Community Repairs</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search repairs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
                  filter === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredRepairs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredRepairs.map(repair => (
            <RepairCard key={repair.repairId} repair={repair} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <div className="text-4xl">🛠️</div>
          <p className="text-slate-500 font-medium">No repairs found here yet. Be the first to post!</p>
        </div>
      )}
    </div>
  );
};

export default FeedScreen;
