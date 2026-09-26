// AuraFinance OS — 3D-Look Nested Capital Allocation Donut Chart
// Features dual-tier concentric rings (Outer: Categories, Inner: 50/30/20 Buckets)
// Includes active slice explosion, depth drop-shadows, and rolling numeric core
import { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../services/fxService';
import RollingNumber from '../common/RollingNumber';
import { playClickSound } from '../../services/soundService';
import { PieChart as PieIcon, ArrowRight, Sparkles } from 'lucide-react';

interface CategoryItem {
  name: string;
  value: number;
  bucket: 'needs' | 'wants' | 'savings';
  color: string;
}

interface NestedAllocationDonutProps {
  categories: CategoryItem[];
  totalSurplus: number;
  totalIncome: number;
}

export default function NestedAllocationDonut({
  categories,
  totalSurplus,
  totalIncome,
}: NestedAllocationDonutProps) {
  const { baseCurrency, theme } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Group into 50/30/20 buckets for inner ring
  const innerRingData = useMemo(() => {
    let needs = 0;
    let wants = 0;
    let savings = 0;

    categories.forEach((c) => {
      if (c.bucket === 'needs') needs += c.value;
      else if (c.bucket === 'wants') wants += c.value;
      else savings += c.value;
    });

    return [
      { name: 'Needs (50% Target)', value: Math.max(1, needs), color: '#3b82f6', bucket: 'needs' },
      { name: 'Wants (30% Target)', value: Math.max(1, wants), color: '#ec4899', bucket: 'wants' },
      { name: 'Future You (20% Target)', value: Math.max(1, savings), color: '#10b981', bucket: 'savings' },
    ];
  }, [categories]);

  // Outer ring data (categories)
  const outerRingData = useMemo(() => {
    if (categories.length === 0) {
      return [
        { name: 'Rashan & Groceries', value: 34500, color: '#3b82f6', bucket: 'needs' },
        { name: 'Bills & Utilities', value: 24500, color: '#60a5fa', bucket: 'needs' },
        { name: 'Transport & Fuel', value: 12000, color: '#93c5fd', bucket: 'needs' },
        { name: 'Dining & Treats', value: 9500, color: '#ec4899', bucket: 'wants' },
        { name: 'Kameti & Bachat', value: 40000, color: '#10b981', bucket: 'savings' },
      ];
    }
    return categories;
  }, [categories]);

  const totalExpense = outerRingData.reduce((s, c) => s + c.value, 0);

  const selectedItem = activeCategory
    ? outerRingData.find((c) => c.name === activeCategory)
    : null;

  const handleSliceClick = (entry: any) => {
    playClickSound();
    setActiveCategory(activeCategory === entry.name ? null : entry.name);
  };

  return (
    <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-aura-text flex items-center gap-2">
            <PieIcon size={16} className="text-aura-accent" />
            3D Capital Allocation Orbit
          </h3>
          <p className="text-xs text-aura-text-muted">
            Inner: 50/30/20 Buckets | Outer: Itemized Outflow Categories
          </p>
        </div>
        {activeCategory && (
          <button
            onClick={() => setActiveCategory(null)}
            className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 text-aura-text-muted hover:text-aura-text"
          >
            Reset Focus
          </button>
        )}
      </div>

      {/* Donut Container with Rolling Numeric Core */}
      <div className="relative h-64 w-full flex items-center justify-center my-2">
        {/* Rolling Numeric Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center">
          <p className="text-[10px] uppercase font-bold tracking-wider text-aura-text-muted">
            {selectedItem ? selectedItem.name : 'Net Surplus'}
          </p>
          <p className="text-xl md:text-2xl font-black text-aura-text mt-0.5">
            {selectedItem ? (
              formatCurrency(selectedItem.value, baseCurrency)
            ) : (
              <RollingNumber
                value={totalSurplus}
                prefix={baseCurrency === 'PKR' ? '₨ ' : '$ '}
              />
            )}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-0.5">
            {selectedItem
              ? `${Math.round((selectedItem.value / Math.max(1, totalExpense)) * 100)}% of Outflows`
              : 'Available for Bachat'}
          </span>
        </div>

        {/* Recharts Nested Concentric Donut */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#0d1322' : '#ffffff',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                borderRadius: '14px',
                fontSize: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              }}
            />

            {/* Inner Ring: 50/30/20 Target */}
            <Pie
              data={innerRingData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={68}
              stroke="none"
              paddingAngle={3}
              opacity={0.85}
            >
              {innerRingData.map((entry, idx) => (
                <Cell key={`inner-${idx}`} fill={entry.color} />
              ))}
            </Pie>

            {/* Outer Ring: Itemized Categories */}
            <Pie
              data={outerRingData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={74}
              outerRadius={96}
              stroke="none"
              paddingAngle={4}
              cursor="pointer"
              onClick={handleSliceClick}
            >
              {outerRingData.map((entry, idx) => {
                const isSelected = activeCategory === entry.name;
                const isDimmed = activeCategory && !isSelected;
                return (
                  <Cell
                    key={`outer-${idx}`}
                    fill={entry.color}
                    opacity={isDimmed ? 0.35 : 1.0}
                    style={{
                      transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                      transformOrigin: 'center center',
                      transition: 'transform 0.3s ease, opacity 0.3s ease',
                      filter: isSelected ? 'drop-shadow(0 0 10px rgba(124, 92, 252, 0.6))' : 'none',
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Active Slice Inspection Card / Legend */}
      <AnimatePresence mode="wait">
        {selectedItem ? (
          <motion.div
            key={selectedItem.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-white/[0.04] border border-aura-accent/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedItem.color }} />
              <div>
                <p className="text-xs font-bold text-aura-text">{selectedItem.name}</p>
                <p className="text-[10px] text-aura-text-muted capitalize">
                  {selectedItem.bucket} Bucket Allocation
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-aura-text">
                {formatCurrency(selectedItem.value, baseCurrency)}
              </span>
              <p className="text-[10px] text-emerald-400">
                {Math.round((selectedItem.value / Math.max(1, totalExpense)) * 100)}% of total
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-aura-border">
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-400 font-semibold">
              Needs: 50%
            </div>
            <div className="p-1.5 rounded-xl bg-pink-500/10 text-pink-400 font-semibold">
              Wants: 30%
            </div>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold">
              Future: 20%
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
