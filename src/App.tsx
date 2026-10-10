/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { HarvestModule } from './components/HarvestModule';
import { TrackingMap } from './components/TrackingMap';
import { WeighbridgeModule } from './components/WeighbridgeModule';
import { SalesModule } from './components/SalesModule';
import { AddHarvestModal } from './components/AddHarvestModal';
import { 
  HarvestRecord, 
  TruckFleet, 
  WeighbridgeTicket, 
  SalesRecord 
} from './types/palm';
import { 
  INITIAL_HARVEST, 
  INITIAL_FLEET, 
  INITIAL_WEIGHBRIDGE, 
  INITIAL_SALES 
} from './data/mockData';
import { TreePine, CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'harvest' | 'tracking' | 'weighbridge' | 'sales'>('overview');
  
  // Persistent data states
  const [harvests, setHarvests] = useState<HarvestRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sawit_harvests');
      return saved ? JSON.parse(saved) : INITIAL_HARVEST;
    } catch {
      return INITIAL_HARVEST;
    }
  });

  const [fleet, setFleet] = useState<TruckFleet[]>(INITIAL_FLEET);

  const [tickets, setTickets] = useState<WeighbridgeTicket[]>(() => {
    try {
      const saved = localStorage.getItem('sawit_weighbridge');
      return saved ? JSON.parse(saved) : INITIAL_WEIGHBRIDGE;
    } catch {
      return INITIAL_WEIGHBRIDGE;
    }
  });

  const [sales, setSales] = useState<SalesRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sawit_sales');
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  // Modal & Transition states
  const [isAddHarvestOpen, setIsAddHarvestOpen] = useState(false);
  const [salePreselectedTicketId, setSalePreselectedTicketId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sawit_harvests', JSON.stringify(harvests));
  }, [harvests]);

  useEffect(() => {
    localStorage.setItem('sawit_weighbridge', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('sawit_sales', JSON.stringify(sales));
  }, [sales]);

  // Toast auto-dismiss
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handlers
  const handleAddHarvest = (record: HarvestRecord) => {
    setHarvests([record, ...harvests]);
    showToast(`Data panen ${record.id} (${record.blok}) berhasil dicatat di TPH.`);
  };

  const handleUpdateHarvest = (updated: HarvestRecord) => {
    setHarvests(harvests.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleAssignTruck = (harvestId: string, truckId: string, spbNo: string) => {
    const targetTruck = fleet.find((t) => t.id === truckId);
    setHarvests(
      harvests.map((h) => {
        if (h.id === harvestId) {
          return {
            ...h,
            status: 'Diangkut',
            noSpb: spbNo,
            armadaId: truckId,
          };
        }
        return h;
      })
    );

    // Update truck
    if (targetTruck) {
      setFleet(
        fleet.map((t) => {
          if (t.id === truckId) {
            return {
              ...t,
              status: 'Perjalanan ke PKS',
              noSpbAktif: spbNo,
              targetDestination: 'PKS Tapung Sentosa (Timbangan Masuk)',
              asalBlok: `${harvests.find((h) => h.id === harvestId)?.blok} (${harvests.find((h) => h.id === harvestId)?.afdeling})`,
              janjangMuat: harvests.find((h) => h.id === harvestId)?.jumlahJanjang,
            };
          }
          return t;
        })
      );
    }

    showToast(`SPB ${spbNo} berhasil diterbitkan. Truk ${targetTruck?.platNomor} mulai perjalanan.`);
    setActiveTab('tracking');
  };

  const handleAddWeighbridgeTicket = (newTicket: WeighbridgeTicket) => {
    setTickets([newTicket, ...tickets]);
    // Also mark associated harvest record as 'Selesai Timbang'
    setHarvests(
      harvests.map((h) => {
        if (h.noSpb === newTicket.noSpb) {
          return { ...h, status: 'Selesai Timbang' };
        }
        return h;
      })
    );
    showToast(`Tiket timbang ${newTicket.id} berhasil disimpan & siap difakturkan.`);
  };

  const handleUpdateWeighbridgeTicket = (updated: WeighbridgeTicket) => {
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleNavigateToWeighbridge = (truck: TruckFleet) => {
    setActiveTab('weighbridge');
    showToast(`Memuat data timbangan untuk armada ${truck.platNomor}.`);
  };

  const handleConvertToSale = (ticket: WeighbridgeTicket) => {
    setSalePreselectedTicketId(ticket.id);
    setActiveTab('sales');
  };

  const handleAddSale = (newSale: SalesRecord) => {
    setSales([newSale, ...sales]);
    // Mark included tickets as 'Terjual'
    setTickets(
      tickets.map((t) => {
        if (newSale.tiketTimbangIds.includes(t.id)) {
          return { ...t, statusPenjualan: 'Terjual', status: 'Terbit Faktur' };
        }
        return t;
      })
    );
    // Mark harvest records as 'Terjual'
    const spbList = tickets
      .filter((t) => newSale.tiketTimbangIds.includes(t.id))
      .map((t) => t.noSpb);
    setHarvests(
      harvests.map((h) => {
        if (h.noSpb && spbList.includes(h.noSpb)) {
          return { ...h, status: 'Terjual' };
        }
        return h;
      })
    );
    showToast(`Faktur penjualan ${newSale.id} berhasil diterbitkan.`);
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan semua data monitoring ke kondisi awal perkebunan?')) {
      localStorage.removeItem('sawit_harvests');
      localStorage.removeItem('sawit_weighbridge');
      localStorage.removeItem('sawit_sales');
      setHarvests(INITIAL_HARVEST);
      setFleet(INITIAL_FLEET);
      setTickets(INITIAL_WEIGHBRIDGE);
      setSales(INITIAL_SALES);
      showToast('Data monitoring berhasil direset ke data default.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      {/* Strict 3-zone Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddHarvest={() => setIsAddHarvestOpen(true)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            harvests={harvests}
            fleet={fleet}
            tickets={tickets}
            sales={sales}
            onNavigateTab={setActiveTab}
            onOpenAddHarvest={() => setIsAddHarvestOpen(true)}
          />
        )}

        {activeTab === 'harvest' && (
          <HarvestModule
            harvests={harvests}
            fleet={fleet}
            onAddHarvestClick={() => setIsAddHarvestOpen(true)}
            onUpdateHarvest={handleUpdateHarvest}
            onAssignTruck={handleAssignTruck}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingMap
            fleet={fleet}
            onUpdateFleet={setFleet}
            onNavigateToWeighbridge={handleNavigateToWeighbridge}
          />
        )}

        {activeTab === 'weighbridge' && (
          <WeighbridgeModule
            tickets={tickets}
            fleet={fleet}
            harvests={harvests}
            onAddTicket={handleAddWeighbridgeTicket}
            onUpdateTicket={handleUpdateWeighbridgeTicket}
            onConvertToSale={handleConvertToSale}
          />
        )}

        {activeTab === 'sales' && (
          <SalesModule
            sales={sales}
            tickets={tickets}
            onAddSale={handleAddSale}
            onUpdateSale={(updated) => setSales(sales.map((s) => (s.id === updated.id ? updated : s)))}
            preselectedTicketId={salePreselectedTicketId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-emerald-800" />
            <span className="font-semibold text-stone-800">SawitTrack Enterprise</span>
            <span>· Sistem Monitoring Panen & Logistik Kelapa Sawit Terpadu</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetToDefault}
              className="text-stone-400 hover:text-stone-600 transition-colors inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Demo</span>
            </button>
            <span className="text-stone-400">© 2026 PT Perkebunan Bukit Sawit Raya</span>
          </div>
        </div>
      </footer>

      {/* Global Add Harvest Modal */}
      <AddHarvestModal
        isOpen={isAddHarvestOpen}
        onClose={() => setIsAddHarvestOpen(false)}
        onAddHarvest={handleAddHarvest}
        nextId={`HVT-2026-10-${String(harvests.length + 6).padStart(3, '0')}`}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl border border-stone-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
