import React, { useState, useEffect } from 'react';
import { X, Upload, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Trade, TradeDirection, TradeResult, EmotionType, JournalSettings } from '../../types/journal';
import { calculateTradeProfit } from '../../utils/calculations';
import { getLastUsedPair, saveLastUsedPair } from '../../utils/storage';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
  settings: JournalSettings;
  tradeToEdit?: Trade | null;
}

const COMMON_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'AUD/USD', 'EUR/JPY'];
const EMOTIONS: EmotionType[] = ['Calm', 'Confident', 'Nervous', 'FOMO', 'Revenge', 'Greedy', 'Unsure'];

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  settings,
  tradeToEdit,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [pair, setPair] = useState<string>(getLastUsedPair());
  const [direction, setDirection] = useState<TradeDirection>('CALL');
  const [amount, setAmount] = useState<number>(settings.defaultAmount);
  const [payout, setPayout] = useState<number>(settings.defaultPayout);
  const [result, setResult] = useState<TradeResult>('WIN');
  const [strategy, setStrategy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [emotion, setEmotion] = useState<EmotionType>('Calm');
  const [followedPlan, setFollowedPlan] = useState<boolean>(true);

  useEffect(() => {
    if (tradeToEdit) {
      setDate(tradeToEdit.date);
      setTime(tradeToEdit.time);
      setPair(tradeToEdit.pair);
      setDirection(tradeToEdit.direction);
      setAmount(tradeToEdit.amount);
      setPayout(tradeToEdit.payout);
      setResult(tradeToEdit.result);
      setStrategy(tradeToEdit.strategy || '');
      setNotes(tradeToEdit.notes || '');
      setScreenshotUrl(tradeToEdit.screenshotUrl || '');
      setEmotion(tradeToEdit.emotion);
      setFollowedPlan(tradeToEdit.followedPlan);
    } else {
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      setPair(getLastUsedPair());
      setDirection('CALL');
      setAmount(settings.defaultAmount);
      setPayout(settings.defaultPayout);
      setResult('WIN');
      setStrategy('');
      setNotes('');
      setScreenshotUrl('');
      setEmotion('Calm');
      setFollowedPlan(true);
    }
  }, [tradeToEdit, isOpen, settings]);

  if (!isOpen) return null;

  const calculatedProfit = calculateTradeProfit(amount || 0, payout || 0, result);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('Image file size must be under 4MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair.trim()) {
      alert('Please enter an Asset/Pair');
      return;
    }

    const tradeData: Trade = {
      id: tradeToEdit ? tradeToEdit.id : `tr-${Date.now()}`,
      date,
      time,
      pair: pair.trim().toUpperCase(),
      direction,
      amount: Number(amount),
      payout: Number(payout),
      result,
      profit: calculatedProfit,
      strategy: strategy.trim(),
      notes: notes.trim(),
      screenshotUrl,
      emotion,
      followedPlan,
      createdAt: tradeToEdit ? tradeToEdit.createdAt : Date.now(),
    };

    saveLastUsedPair(pair.trim().toUpperCase());
    onSaveTrade(tradeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg desk-card border border-[#252930] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#252930] bg-[#0F1114]">
          <div>
            <h2 className="text-sm font-bold text-[#f0f1f4]">
              {tradeToEdit ? 'Edit Trade Entry' : 'Order Entry Terminal'}
            </h2>
            <p className="text-xs text-[#8a8f9d]">Record trade metrics and execution notes</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8a8f9d] hover:text-[#f0f1f4] hover:bg-[#191C21] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Row 1: Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#8a8f9d] mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full desk-input px-3 py-1.5 font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#8a8f9d] mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full desk-input px-3 py-1.5 font-mono text-xs"
                required
              />
            </div>
          </div>

          {/* Row 2: Asset / Pair */}
          <div>
            <label className="block font-medium text-[#8a8f9d] mb-1">Asset Pair</label>
            <input
              type="text"
              placeholder="EUR/USD"
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full desk-input px-3 py-1.5 font-mono uppercase font-bold text-xs"
              required
            />
            {/* Quick pair selection chips */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {COMMON_PAIRS.map((cp) => (
                <button
                  type="button"
                  key={cp}
                  onClick={() => setPair(cp)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                    pair.toUpperCase() === cp
                      ? 'bg-[#191C21] border-[#383d47] text-[#f0f1f4] font-bold'
                      : 'bg-[#090A0C] border-[#252930] text-[#8a8f9d] hover:text-[#f0f1f4]'
                  }`}
                >
                  {cp}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Direction (CALL / PUT) */}
          <div>
            <label className="block font-medium text-[#8a8f9d] mb-1">Direction</label>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <button
                type="button"
                onClick={() => setDirection('CALL')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded font-bold border transition-all cursor-pointer ${
                  direction === 'CALL'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-[#090A0C] border-[#252930] text-[#8a8f9d] hover:bg-[#14171B]'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                CALL
              </button>
              <button
                type="button"
                onClick={() => setDirection('PUT')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded font-bold border transition-all cursor-pointer ${
                  direction === 'PUT'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-[#090A0C] border-[#252930] text-[#8a8f9d] hover:bg-[#14171B]'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                PUT
              </button>
            </div>
          </div>

          {/* Row 4: Amount & Payout */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#8a8f9d] mb-1">
                Amount ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full desk-input px-3 py-1.5 font-mono font-bold text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#8a8f9d] mb-1">Payout (%)</label>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                value={payout}
                onChange={(e) => setPayout(parseFloat(e.target.value) || 0)}
                className="w-full desk-input px-3 py-1.5 font-mono font-bold text-xs"
                required
              />
            </div>
          </div>

          {/* Row 5: Trade Result (WIN / LOSS) */}
          <div>
            <label className="block font-medium text-[#8a8f9d] mb-1">Result</label>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <button
                type="button"
                onClick={() => setResult('WIN')}
                className={`py-2 rounded font-bold border transition-all cursor-pointer ${
                  result === 'WIN'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-[#090A0C] border-[#252930] text-[#8a8f9d] hover:bg-[#14171B]'
                }`}
              >
                WIN
              </button>
              <button
                type="button"
                onClick={() => setResult('LOSS')}
                className={`py-2 rounded font-bold border transition-all cursor-pointer ${
                  result === 'LOSS'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-[#090A0C] border-[#252930] text-[#8a8f9d] hover:bg-[#14171B]'
                }`}
              >
                LOSS
              </button>
            </div>
          </div>

          {/* Live Calculated P/L Preview Card */}
          <div
            className={`p-3 rounded border flex items-center justify-between font-mono ${
              result === 'WIN'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
            }`}
          >
            <span className="text-[11px] font-sans text-[#8a8f9d]">Calculated Profit / Loss:</span>
            <span className="text-sm font-bold">
              {result === 'WIN' ? '+' : ''}
              {settings.currencySymbol}
              {calculatedProfit.toFixed(2)}
            </span>
          </div>

          {/* Optional: Strategy & Notes */}
          <div>
            <label className="block font-medium text-[#8a8f9d] mb-1">Strategy / Setup</label>
            <input
              type="text"
              placeholder="e.g. Resistance Rejection"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full desk-input px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-[#8a8f9d] mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Trade observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full desk-input p-2 text-xs resize-none"
            />
          </div>

          {/* Emotion & Plan Followed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#8a8f9d] mb-1">Emotion State</label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value as EmotionType)}
                className="w-full desk-input px-3 py-1.5 text-xs"
              >
                {EMOTIONS.map((emo) => (
                  <option key={emo} value={emo} className="bg-[#090A0C] text-[#f0f1f4]">
                    {emo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#8a8f9d] mb-1">Followed Plan?</label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFollowedPlan(true)}
                  className={`flex-1 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                    followedPlan
                      ? 'bg-[#191C21] border-[#383d47] text-[#f0f1f4]'
                      : 'bg-[#090A0C] border-[#252930] text-[#8a8f9d]'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFollowedPlan(false)}
                  className={`flex-1 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                    !followedPlan
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-[#090A0C] border-[#252930] text-[#8a8f9d]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Optional Screenshot Upload */}
          <div>
            <label className="block font-medium text-[#8a8f9d] mb-1">Chart Screenshot (Optional)</label>
            {screenshotUrl ? (
              <div className="relative rounded overflow-hidden border border-[#252930] bg-[#090A0C]">
                <img src={screenshotUrl} alt="Screenshot" className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => setScreenshotUrl('')}
                  className="absolute top-1 right-1 p-1 rounded bg-black/70 text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-2 rounded border border-dashed border-[#252930] hover:border-[#383d47] bg-[#090A0C] text-[#8a8f9d] hover:text-[#f0f1f4] cursor-pointer text-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Chart Image</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252930]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-medium text-[#8a8f9d] hover:text-[#f0f1f4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow-sm"
            >
              {tradeToEdit ? 'Update Order' : 'Save Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
