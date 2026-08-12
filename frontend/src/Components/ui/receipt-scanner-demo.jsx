import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Scan,
  Sparkles,
  ArrowRight,
  Tag,
  Calendar,
  Store,
  CheckCircle,
  ScanLine,
  Layers,
  Zap,
} from "lucide-react";

export const ReceiptScannerDemo = () => {
  const receipts = [
    {
      id: "indomaret",
      title: "Indomaret (Kebutuhan)",
      merchant: "INDOMARET CIPETE",
      date: "12 Mei 2026",
      total: "Rp 68.500",
      rawTotal: 68500,
      categoryGroup: "Pos Kebutuhan (50%)",
      categoryDetail: "Kebutuhan Pokok & Sembako",
      badgeColor:
        "bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 border border-blue-200 dark:border-blue-900",
      items: [
        { name: "Susu UHT Full Cream 1L", price: "Rp 21.000" },
        { name: "Roti Tawar Gandum", price: "Rp 17.500" },
        { name: "Telur Ayam Omega 10's", price: "Rp 30.000" },
      ],
    },
    {
      id: "kopi",
      title: "Kafe Kopi (Gaya Hidup)",
      merchant: "KOPI KENANGAN GRAND INDO",
      date: "11 Mei 2026",
      total: "Rp 38.000",
      rawTotal: 38000,
      categoryGroup: "Pos Keinginan (30%)",
      categoryDetail: "Gaya Hidup & Rekreasi",
      badgeColor:
        "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900",
      items: [
        { name: "Kopi Kenangan Mantan Large", price: "Rp 24.000" },
        { name: "Cinnamon Roll Toast", price: "Rp 14.000" },
      ],
    },
    {
      id: "spbu",
      title: "SPBU (Transportasi)",
      merchant: "SPBU PERTAMINA 31.124.02",
      date: "10 Mei 2026",
      total: "Rp 150.000",
      rawTotal: 150000,
      categoryGroup: "Pos Kebutuhan (50%)",
      categoryDetail: "Bahan Bakar & Transportasi",
      badgeColor:
        "bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 border border-blue-200 dark:border-blue-900",
      items: [{ name: "Pertamax 92 (11.54 Liter)", price: "Rp 150.000" }],
    },
  ];

  const [activeReceipt, setActiveReceipt] = useState(receipts[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStep, setScannedStep] = useState(3);

  const handleSelect = (r) => {
    if (r.id === activeReceipt.id) return;
    setIsScanning(true);
    setScannedStep(0);

    setTimeout(() => {
      setActiveReceipt(r);
      setIsScanning(false);
      setScannedStep(3);
    }, 450);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Header Tabs with Framer Motion layoutId */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-400 shadow-xs">
            <ScanLine className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Simulasi Ekstraksi Struk Belanja
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih contoh struk kasir di bawah ini untuk melihat akurasi sistem AI OCR SADAR.
            </p>
          </div>
        </div>

        {/* Receipt Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl dark:bg-slate-800 self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
          {receipts.map((r) => {
            const isSelected = activeReceipt.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                className="relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors z-10"
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeReceiptTab"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs -z-10"
                  />
                )}
                <span
                  className={
                    isSelected
                      ? "text-[#1E3A8A] dark:text-sky-400 font-bold"
                      : "text-slate-600 dark:text-slate-400"
                  }
                >
                  {r.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Scan Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Visual Simulated Receipt (Left) */}
        <div className="lg:col-span-5 relative rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60 font-mono text-xs overflow-hidden shadow-inner">
          {/* Laser Scanning Line with Framer Motion Continuous / State Scan */}
          <AnimatePresence>
            {isScanning ? (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1E3A8A] dark:via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] z-20"
              />
            ) : (
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute top-0 right-0 p-1.5 z-10 text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-bl-lg"
              >
                <Zap className="w-3 h-3" />
                <span>OCR Ready</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
            <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              *** STRUK FISIK KASIR ***
            </span>
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <motion.div
            key={activeReceipt.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]"
          >
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {activeReceipt.merchant}
            </p>
            <p>Tgl: {activeReceipt.date} • Kasir #04</p>
            <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
              {activeReceipt.items.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex justify-between py-0.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 px-1 rounded transition-colors"
                >
                  <span className="truncate pr-2">{item.name}</span>
                  <span className="font-medium shrink-0">{item.price}</span>
                </motion.div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 mt-2 flex justify-between font-bold text-slate-900 dark:text-white text-xs">
              <span>TOTAL BELANJA</span>
              <span className="text-[#1E3A8A] dark:text-sky-400 font-extrabold">
                {activeReceipt.total}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Arrow Transition */}
        <div className="hidden lg:flex lg:col-span-1 justify-center text-slate-300 dark:text-slate-600">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-5 h-5 text-[#1E3A8A] dark:text-sky-400" />
          </motion.div>
        </div>

        {/* Extracted Clean Result (Right) */}
        <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4.5 border border-slate-200/90 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] dark:text-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
              Hasil Ekstraksi AI OCR Realtime
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${activeReceipt.badgeColor}`}
            >
              {activeReceipt.categoryGroup}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeReceipt.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs hover:border-[#1E3A8A]/40 transition-colors">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-slate-400" /> Merchant
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeReceipt.merchant}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs hover:border-[#1E3A8A]/40 transition-colors">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Transaksi
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeReceipt.date}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs hover:border-[#1E3A8A]/40 transition-colors">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Pos Anggaran
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeReceipt.categoryDetail}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1E3A8A] text-white shadow-sm font-medium">
                <span className="text-white/90 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Total Terverifikasi
                </span>
                <span className="text-base font-black">
                  {activeReceipt.total}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
