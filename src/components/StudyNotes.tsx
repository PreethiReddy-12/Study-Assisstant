import React, { useState } from 'react';
import { BookOpen, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { generateStudyNotes, StudyNotes as StudyNotesType } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

export const StudyNotes: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<StudyNotesType | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const result = await generateStudyNotes(topic);
      setNotes(result);
    } catch (error) {
      console.error('Error generating notes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">Study Notes Generator</h2>
        <p className="text-slate-600">Enter a topic and get simplified notes perfect for beginners.</p>
      </div>

      <form onSubmit={handleGenerate} className="flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Photosynthesis, Quantum Physics, French Revolution"
          className="input-field flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Generate
        </button>
      </form>

      <AnimatePresence mode="wait">
        {notes && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass-card p-8 space-y-6">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-display font-bold text-xl uppercase tracking-wider">Explanation</h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-lg">{notes.explanation}</p>
              </section>

              <div className="h-px bg-slate-100" />

              <section className="space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-800">Key Points</h3>
                <ul className="grid gap-3">
                  {notes.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 items-start text-slate-600">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="h-px bg-slate-100" />

              <section className="space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-800">Important Terms</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {notes.importantTerms.map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-indigo-600 block mb-1">{item.term}</span>
                      <span className="text-sm text-slate-600">{item.definition}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
