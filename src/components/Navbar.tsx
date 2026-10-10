import React from 'react';
import { TreePine, Plus } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'harvest' | 'tracking' | 'weighbridge' | 'sales';
  setActiveTab: (tab: 'overview' | 'harvest' | 'tracking' | 'weighbridge' | 'sales') => void;
  onOpenAddHarvest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddHarvest,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold">
              <TreePine className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">
              SawitTrack
            </span>
          </div>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'overview'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('harvest')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'harvest'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              Panen & TPH
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'tracking'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              Pelacakan Armada
            </button>
            <button
              onClick={() => setActiveTab('weighbridge')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'weighbridge'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              Jembatan Timbang
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'sales'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              Penjualan TBS
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddHarvest}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Panen Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer strip */}
      <div className="md:hidden flex overflow-x-auto border-t border-stone-200 px-4 py-2 gap-4 text-xs font-medium bg-stone-50">
        <button
          onClick={() => setActiveTab('overview')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'overview' ? 'text-emerald-800 font-bold border-b border-emerald-800' : 'text-stone-600'}`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('harvest')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'harvest' ? 'text-emerald-800 font-bold border-b border-emerald-800' : 'text-stone-600'}`}
        >
          Panen & TPH
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'tracking' ? 'text-emerald-800 font-bold border-b border-emerald-800' : 'text-stone-600'}`}
        >
          Pelacakan Armada
        </button>
        <button
          onClick={() => setActiveTab('weighbridge')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'weighbridge' ? 'text-emerald-800 font-bold border-b border-emerald-800' : 'text-stone-600'}`}
        >
          Jembatan Timbang
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeTab === 'sales' ? 'text-emerald-800 font-bold border-b border-emerald-800' : 'text-stone-600'}`}
        >
          Penjualan TBS
        </button>
      </div>
    </header>
  );
};
