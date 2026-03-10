import React, { useState } from 'react';
import { Brain, Sparkles, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { generateQuiz, QuizQuestion } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

export const QuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setQuestions([]);
    setCurrentStep(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);

    try {
      const result = await generateQuiz(topic);
      setQuestions(result);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionId: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(optionId);
    if (optionId === questions[currentStep].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">AI Quiz Generator</h2>
        <p className="text-slate-600">Test your knowledge on any topic with 5 beginner-friendly questions.</p>
      </div>

      {!questions.length && !showResult && (
        <form onSubmit={handleGenerate} className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Solar System, Basic Algebra, World War II"
            className="input-field flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Create Quiz
          </button>
        </form>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Crafting your custom quiz...</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {questions.length > 0 && !showResult && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-card p-8 space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
                  Question {currentStep + 1} of {questions.length}
                </span>
                <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500" 
                    style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <h3 className="text-2xl font-display font-bold text-slate-800">
                {questions[currentStep].question}
              </h3>

              <div className="grid gap-3">
                {questions[currentStep].options.map((option) => {
                  const isCorrect = option.id === questions[currentStep].correctAnswer;
                  const isSelected = selectedAnswer === option.id;
                  
                  let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all flex justify-between items-center ";
                  if (!selectedAnswer) {
                    buttonClass += "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50";
                  } else if (isCorrect) {
                    buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-700";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "border-rose-500 bg-rose-50 text-rose-700";
                  } else {
                    buttonClass += "border-slate-100 opacity-50";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      disabled={!!selectedAnswer}
                      className={buttonClass}
                    >
                      <span className="font-medium">{option.id}. {option.text}</span>
                      {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {selectedAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-indigo-50 rounded-2xl space-y-2"
                >
                  <p className="font-bold text-indigo-900">Explanation:</p>
                  <p className="text-indigo-800/80 leading-relaxed">
                    {questions[currentStep].explanation}
                  </p>
                  <button
                    onClick={nextQuestion}
                    className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    {currentStep === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center space-y-6"
          >
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-bold">Quiz Complete!</h3>
              <p className="text-slate-500">You scored {score} out of {questions.length}</p>
            </div>
            <div className="text-5xl font-display font-black text-indigo-600">
              {Math.round((score / questions.length) * 100)}%
            </div>
            <button
              onClick={() => {
                setQuestions([]);
                setShowResult(false);
                setTopic('');
              }}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Try Another Topic
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
