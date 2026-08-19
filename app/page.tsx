'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookSearchEngine, EngineStrategy } from '../services/SearchEngine';
import { Book } from '../moduls/Book';
import { MainThreadHeartbeat } from '../components/MainThreadHeartbeat';
import { BookCard } from '../components/BookCard';
import { Search, Layers, BarChart2, Clock, AlertTriangle, BookOpen } from 'lucide-react';

export default function Home() {
  const [engine] = useState(() => new BookSearchEngine(50000));
  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useState<EngineStrategy>('sync');
  const [results, setResults] = useState<Book[]>([]);
  
  const [inp, setInp] = useState<number | null>(null);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [longTasks, setLongTasks] = useState(0);
  const [chunksProcessed, setChunksProcessed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeTaskId = useRef(0);

  // Cargar catálogo inicial
  useEffect(() => {
    setResults(engine.getCatalog().slice(0, 50));
  }, [engine]);

  // Listener para Long Tasks
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const obs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              setLongTasks((prev) => prev + 1);
            }
          }
        });
        obs.observe({ entryTypes: ['longtask'] });
        return () => obs.disconnect();
      } catch (e) {
        // Ignorar si el navegador no lo soporta
      }
    }
  }, []);

  const finishSearch = useCallback((startTime: number, duration: number, finalResults: Book[]) => {
    setResults(finalResults.slice(0, 100));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const paintTime = performance.now();
        setInp(Math.round(paintTime - startTime));
        setExecTime(Math.round(duration));
        setIsProcessing(false);
      });
    });
  }, []);

  const executeSearch = useCallback((searchTerm: string, currentStrategy: EngineStrategy) => {
    const inputTime = performance.now();
    const taskId = ++activeTaskId.current;

    setIsProcessing(true);
    setInp(null);
    setExecTime(null);
    setChunksProcessed(0);

    if (!searchTerm.trim()) {
      setResults(engine.getCatalog().slice(0, 50));
      setIsProcessing(false);
      return;
    }

    if (currentStrategy === 'sync') {
      const start = performance.now();
      const res = engine.searchSync(searchTerm);
      const end = performance.now();
      finishSearch(inputTime, end - start, res);
    } 
    else if (currentStrategy === 'microtask') {
      const start = performance.now();
      engine.searchMicrotask(
        searchTerm,
        (processed) => setChunksProcessed(processed),
        (res) => {
          if (activeTaskId.current === taskId) {
            finishSearch(inputTime, performance.now() - start, res);
          }
        }
      );
    } 
    else if (currentStrategy === 'macrotask') {
      const start = performance.now();
      engine.searchMacrotask(
        searchTerm,
        (processed) => setChunksProcessed(processed),
        (res) => {
          if (activeTaskId.current === taskId) {
            finishSearch(inputTime, performance.now() - start, res);
          }
        }
      );
    }
  }, [engine, finishSearch]);

  // Ejecutar búsqueda cuando cambia el texto o la estrategia
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    executeSearch(val, strategy);
  };

  const handleStrategyChange = (newStrategy: EngineStrategy) => {
    setStrategy(newStrategy);
    if (query) {
      executeSearch(query, newStrategy);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Buscador de Libros (POO & Components)</h1>
            <p className="text-sm text-slate-400">Lab de Event Loop, Microtasks & INP</p>
          </div>
        </div>
        <MainThreadHeartbeat isProcessing={isProcessing} strategy={strategy} />
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-300">
              Buscar en Catálogo (50,000 Libros)
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Escribe título, autor, género o ISBN (ej. 'viento', 'garcía')..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-12 pr-4 py-3.5 text-slate-100 outline-none transition-colors"
              />
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Lotes procesados: {chunksProcessed} / {engine.getTotalChunks()}</span>
              <span>Resultados encontrados: {results.length}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Estrategia de Event Loop
            </h3>
            {(['sync', 'microtask', 'macrotask'] as EngineStrategy[]).map((strat) => (
              <button
                key={strat}
                onClick={() => handleStrategyChange(strat)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                  strategy === strat
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {strat === 'sync' && '1. Síncrono (Bloqueante)'}
                {strat === 'microtask' && '2. Microtasks (queueMicrotask)'}
                {strat === 'macrotask' && '3. Macrotasks (Yielding / setTimeout)'}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>MÉTRICA INP</span>
              <BarChart2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold my-2">{inp !== null ? `${inp} ms` : '--'}</div>
            <p className="text-[11px] text-slate-500">Latencia total percibida por el usuario</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>TIEMPO EJECUCIÓN JS</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold my-2">{execTime !== null ? `${execTime} ms` : '--'}</div>
            <p className="text-[11px] text-slate-500">Tiempo total de cómputo</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>LONG TASKS (&gt;50ms)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold my-2">{longTasks}</div>
            <p className="text-[11px] text-slate-500">Bloqueos detectados por el navegador</p>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold">Resultados ({results.length})</h3>
          {results.length === 0 ? (
            <p className="text-sm text-slate-500">No se encontraron libros que coincidan con la búsqueda.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.slice(0, 12).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}