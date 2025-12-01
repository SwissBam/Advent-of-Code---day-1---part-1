import React, { useState, useEffect, useRef } from 'react';
import { parseAndSolve } from './utils/puzzleSolver';
import { generateMissionReport } from './services/geminiService';
import Dial from './components/Dial';
import { SolveResult, RotationStep, SimulationState } from './types';

// Example input based on the prompt description
const DEFAULT_INPUT = `L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`;

export default function App() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [simulationState, setSimulationState] = useState<SimulationState>(SimulationState.IDLE);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [dialValue, setDialValue] = useState(50);
  const [matchCount, setMatchCount] = useState(0);
  const [speed, setSpeed] = useState(500); // ms delay
  const [missionReport, setMissionReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const stepsRef = useRef<RotationStep[]>([]);
  const timerRef = useRef<number | null>(null);

  const handleSolve = () => {
    // Reset state
    setSimulationState(SimulationState.IDLE);
    setMissionReport(null);
    setMatchCount(0);
    setDialValue(50);
    setCurrentStepIndex(-1);

    // Solve
    const solveResult = parseAndSolve(input);
    setResult(solveResult);
    stepsRef.current = solveResult.history;

    // Start Simulation
    setSimulationState(SimulationState.RUNNING);
  };

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSimulationState(SimulationState.PAUSED);
  };

  const handleResume = () => {
    setSimulationState(SimulationState.RUNNING);
  };

  const handleReset = () => {
    handleStop();
    setSimulationState(SimulationState.IDLE);
    setResult(null);
    setDialValue(50);
    setMatchCount(0);
    setCurrentStepIndex(-1);
    setMissionReport(null);
  };

  // Simulation Loop
  useEffect(() => {
    if (simulationState === SimulationState.RUNNING) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          const nextIndex = prev + 1;
          
          if (nextIndex >= stepsRef.current.length) {
            // Finished
            setSimulationState(SimulationState.COMPLETED);
            return prev;
          }

          const step = stepsRef.current[nextIndex];
          setDialValue(step.result);
          if (step.isMatch) {
            setMatchCount((c) => c + 1);
          }
          return nextIndex;
        });
      }, speed);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [simulationState, speed]);

  // Handle Completion
  useEffect(() => {
    if (simulationState === SimulationState.COMPLETED && result && !missionReport && !isGeneratingReport) {
      const fetchReport = async () => {
        setIsGeneratingReport(true);
        const report = await generateMissionReport(result.password, stepsRef.current.length, matchCount);
        setMissionReport(report);
        setIsGeneratingReport(false);
      };
      fetchReport();
    }
  }, [simulationState, result, missionReport, matchCount, isGeneratingReport]);

  const currentStep = currentStepIndex >= 0 && stepsRef.current[currentStepIndex];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          <span className="text-red-500">NORTH POLE</span> SECURITY ACCESS
        </h1>
        <p className="text-slate-400 mt-2 font-mono text-sm">
          :: DECOY BYPASS PROTOCOL :: DAY 01 CHALLENGE ::
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Controls & Input */}
        <div className="space-y-6">
          
          {/* Status Panel */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 shadow-sm backdrop-blur-sm">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Operation Controls</h2>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {simulationState === SimulationState.IDLE && (
                <button 
                  onClick={handleSolve}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg transition-colors flex items-center gap-2"
                >
                  RUN DECODER
                </button>
              )}
              
              {simulationState === SimulationState.RUNNING && (
                <button 
                  onClick={handleStop}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded shadow-lg transition-colors"
                >
                  PAUSE
                </button>
              )}

              {simulationState === SimulationState.PAUSED && (
                <button 
                  onClick={handleResume}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg transition-colors"
                >
                  RESUME
                </button>
              )}

              <button 
                onClick={handleReset}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded shadow transition-colors"
              >
                RESET
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Simulation Speed: {speed}ms</label>
              <input 
                type="range" 
                min="10" 
                max="1000" 
                step="10"
                value={speed} // Slider is reverse logic visually usually, but let's keep it simple
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rotation Sequence Input</h2>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-64 bg-slate-900 border border-slate-700 rounded p-4 font-mono text-sm text-green-400 focus:outline-none focus:border-green-500 resize-none"
              placeholder="Paste puzzle input here..."
              disabled={simulationState === SimulationState.RUNNING}
            />
          </div>

        </div>

        {/* Right Column: Visualization & Results */}
        <div className="space-y-6">
          
          {/* Dial Visualization */}
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/30 to-transparent pointer-events-none"></div>
             
             <Dial 
                currentValue={dialValue} 
                isMatch={currentStep ? currentStep.isMatch : dialValue === 0 && currentStepIndex > -1} 
                isAnimating={simulationState === SimulationState.RUNNING}
             />

             {/* Live Step Info */}
             <div className="mt-8 w-full max-w-sm">
                <div className="flex justify-between items-end border-b border-slate-700 pb-2 mb-2">
                   <span className="text-xs text-slate-500 uppercase">Current Instruction</span>
                   <span className="text-xl font-mono font-bold text-white">
                     {currentStep ? (
                       <>
                         <span className={currentStep.direction === 'L' ? 'text-blue-400' : 'text-orange-400'}>
                           {currentStep.direction}
                         </span>
                         {currentStep.distance}
                       </>
                     ) : '--'}
                   </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-500 uppercase">Password (Zeros Matched)</span>
                  <span className="text-2xl font-mono font-bold text-green-500">{matchCount}</span>
                </div>
             </div>
          </div>

          {/* Mission Report */}
          {(simulationState === SimulationState.COMPLETED || missionReport) && (
            <div className={`rounded-lg p-6 border transition-all duration-500 ${
              missionReport ? 'bg-green-900/20 border-green-700/50' : 'bg-slate-800/50 border-slate-700'
            }`}>
              <h2 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Mission Log
              </h2>
              
              {isGeneratingReport ? (
                <div className="font-mono text-sm text-green-400/70 animate-pulse">
                  > Establishing secure link...
                  <br/>> Decrypting mission summary...
                </div>
              ) : (
                <div className="font-mono text-sm text-green-300 leading-relaxed whitespace-pre-wrap">
                  {missionReport || "Waiting for mission confirmation..."}
                </div>
              )}
              
              {!isGeneratingReport && result && (
                <div className="mt-4 pt-4 border-t border-green-800/50 flex justify-between items-center">
                   <span className="text-xs text-green-500/70 uppercase">Final Password Code</span>
                   <span className="text-xl font-bold font-mono text-white bg-green-900/40 px-3 py-1 rounded">
                     {result.password}
                   </span>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
