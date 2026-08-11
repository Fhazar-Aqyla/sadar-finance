import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Scan,
  Sparkles,
  Check,
  ArrowRight,
  Tag,
  Calendar,
  Store,
} from "lucide-react";

export const ReceiptScannerDemo = () => {
  const receipts = [
    {
      id: "indomaret",
      title: "Struk Minimarket",
      merchant: "INDOMARET CIPETE",
      date: "12 Mei 2026",
      total: "Rp 68.500",
      rawTotal: 68500,
      categoryGroup: "Needs",
      categoryDetail: "Kebutuhan Pokok",
      badgeColor:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      items: [
        { name: "Susu UHT Full Cream 1L", price: "Rp 21.000" },
        { name: "Roti Tawar Gandum", price: "Rp 17.500" },
        { name: "Telur Ayam Omega 10's", price: "Rp 30.000" },
      ],
    },
    {
      id: "kopi",
      title: "Struk Kafe Kopi",
      merchant: "KOPI KENANGAN GRAND INDO",
      date: "11 Mei 2026",
      total: "Rp 38.000",
      rawTotal: 38000,
      categoryGroup: "Wants",
      categoryDetail: "Gaya Hidup / Kuliner",
      badgeColor:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
      items: [
        { name: "Kopi Kenangan Mantan Large", price: "Rp 24.000" },
        { name: "Cinnamon Roll Toast", price: "Rp 14.000" },
      ],
    },
    {
      id: "spbu",
      title: "Struk SPBU Bensin",
      merchant: "SPBU PERTAMINA 31.124.02",
      date: "10 Mei 2026",
      total: "Rp 150.000",
      rawTotal: 150000,
      categoryGroup: "Needs",
      categoryDetail: "Transportasi",
      badgeColor:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      items: [{ name: "Pertamax 92 (11.54 Liter)", price: "Rp 150.000" }],
    },
  ];

  const [activeReceipt, setActiveReceipt] = useState(receipts[0]);
  const [isScanning, setIsScanning] = useState(false);

  const handleSelect = (r) => {
    if (r.id === activeReceipt.id) return;
    setIsScanning(true);
    setTimeout(() => {
      setActiveReceipt(r);
      setIsScanning(false);
    }, 450);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Simulasi Ekstraksi Struk Belanja
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih contoh struk fisik di bawah ini untuk melihat cara kerja OCR
              SADAR.
            </p>
          </div>
        </div>

        {/* Receipt Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl dark:bg-slate-800 self-start sm:self-auto">
          {receipts.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeReceipt.id === r.id
                  ? "bg-white text-teal-700 shadow-sm dark:bg-slate-900 dark:text-teal-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Scan Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Visual Simulated Receipt (Left) */}
        <div className="lg:col-span-5 relative rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50 font-mono text-xs overflow-hidden">
          {/* Laser Scanning Line */}
          {isScanning && (
            <motion.div
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 0.45, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_rgba(20,184,166,0.8)] z-20"
            />
          )}

          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
            <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              *** STRUK BELANJA ***
            </span>
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {activeReceipt.merchant}
            </p>
            <p>Tgl: {activeReceipt.date} • Kasir #04</p>
            <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
              {activeReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-0.5">
                  <span className="truncate pr-2">{item.name}</span>
                  <span className="font-medium shrink-0">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 mt-2 flex justify-between font-bold text-slate-900 dark:text-white text-xs">
              <span>TOTAL</span>
              <span className="text-teal-600 dark:text-teal-400">
                {activeReceipt.total}
              </span>
            </div>
          </div>
        </div>

        {/* Arrow Transition */}
        <div className="hidden lg:flex lg:col-span-1 justify-center text-slate-300 dark:text-slate-600">
          <ArrowRight className="w-5 h-5 animate-pulse text-teal-500" />
        </div>

        {/* Extracted Clean Result (Right) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-xl p-4.5 border border-teal-100 dark:from-slate-900 dark:to-slate-900/50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              Ekstraksi Cerdas Terdeteksi
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${activeReceipt.badgeColor}`}
            >
              {activeReceipt.categoryGroup}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-400" /> Merchant
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {activeReceipt.merchant}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {activeReceipt.date}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Pos & Detail
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {activeReceipt.categoryDetail}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-teal-600 text-white shadow-sm font-medium">
              <span className="text-teal-100">Nominal Terbaca</span>
              <span className="text-base font-extrabold">
                {activeReceipt.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
