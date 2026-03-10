import React, { useState } from 'react';
import { FileText, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { summarizeText } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

export const TextSummarizer: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; points: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length < 50) return;

    setLoading(true);
    try {
      const summaryResult = await summarizeText(text);
      setResult(summaryResult);
    } catch (error) {
      console.error('Error summarizing text:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const content = `${result.summary}\n\nKey Points:\n${result.points.map(p => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">AI Text Summarizer</h2>
        <p className="text-slate-600">Paste long paragraphs or study materials to get a clear, concise summary.</p>
      </div>

      <form onSubmit={handleSummarize} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your long text here (minimum 50 characters)..."
          className="input-field min-h-[200px] resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">{text.length} characters</span>
          <button 
            type="submit" 
            disabled={loading || text.length < 50} 
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Summarize Now
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8 space-y-6 relative"
          >
            <button
              onClick={copyToClipboard}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <FileText className="w-5 h-5" />
                <h3 className="font-display font-bold text-xl uppercase tracking-wider">Summary</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">{result.summary}</p>
            </section>

            <div className="h-px bg-slate-100" />

            <section className="space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800">Highlighted Points</h3>
              <ul className="grid gap-3">
                {result.points.map((point, i) => (
                  <li key={i} className="flex gap-3 items-start text-slate-600">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
