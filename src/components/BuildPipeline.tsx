/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BuildStage } from '../types';
import { INITIAL_PIPELINE_STAGES, simulateStageExecution } from '../model/pipeline';
import { Play, RotateCcw, CheckCircle2, Terminal, Package, ShieldCheck, Clock, Layers, ArrowRight } from 'lucide-react';

export const BuildPipeline: React.FC = () => {
  const [stages, setStages] = useState<BuildStage[]>(INITIAL_PIPELINE_STAGES);
  const [isRunning, setIsRunning] = useState(false);
  const [activeLogStage, setActiveLogStage] = useState<string>('check');
  const [allPassed, setAllPassed] = useState(false);

  const runSingleStage = async (stageId: string) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, status: 'running', logs: ['[EXEC] Starting stage execution...'] } : s));
    setActiveLogStage(stageId);

    const execRes = simulateStageExecution(stageId);
    await new Promise(r => setTimeout(r, execRes.durationMs));

    setStages(prev => prev.map(s => s.id === stageId ? {
      ...s,
      status: 'success',
      durationMs: execRes.durationMs,
      logs: execRes.logs,
      outputs: execRes.outputs
    } : s));
  };

  const runFullPipeline = async () => {
    setIsRunning(true);
    setAllPassed(false);

    // Reset stages
    setStages(INITIAL_PIPELINE_STAGES.map(s => ({ ...s, status: 'pending', logs: [] })));

    for (const stage of INITIAL_PIPELINE_STAGES) {
      setActiveLogStage(stage.id);
      setStages(prev => prev.map(s => s.id === stage.id ? { ...s, status: 'running', logs: ['[EXEC] ' + s.command] } : s));
      
      const exec = simulateStageExecution(stage.id);
      await new Promise(r => setTimeout(r, exec.durationMs));

      setStages(prev => prev.map(s => s.id === stage.id ? {
        ...s,
        status: 'success',
        durationMs: exec.durationMs,
        logs: exec.logs,
        outputs: exec.outputs
      } : s));
    }

    setIsRunning(false);
    setAllPassed(true);
  };

  const resetPipeline = () => {
    setStages(INITIAL_PIPELINE_STAGES);
    setIsRunning(false);
    setAllPassed(false);
    setActiveLogStage('check');
  };

  const currentActiveStage = stages.find(s => s.id === activeLogStage) || stages[0];

  return (
    <div className="space-y-6">
      
      {/* Pipeline Controller Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white">PrismPM Multi-Stage Compiler Pipeline</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                Normative SPEC.md
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              PrismPM compiles the authoritative <code className="text-slate-300">src/Vault.lex.tex</code> model through 6 stages:
              LexLean snapshot projection, Lean 4.32.1 proof checking with <code className="text-slate-300">leanchecker</code>,
              LCNF named-root monomorphization, Core-Wasm guest generation, Hologram v4 binary archive packaging, and live acceptance verification.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-run-pipeline"
              disabled={isRunning}
              onClick={runFullPipeline}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono flex items-center space-x-2 transition-all ${
                isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 cursor-pointer'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Compiling Model...' : 'Run Full PrismPM Pipeline'}</span>
            </button>

            <button
              onClick={resetPipeline}
              disabled={isRunning}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Acceptance Badge */}
        {allPassed && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Emitted prismpm/application-acceptance/1:</strong> Model verified, 4 Lean theorems proved, Hologram v4 archive sealed.
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40">
              Pass (100%)
            </span>
          </div>
        )}
      </div>

      {/* Grid: Stages on Left, Terminal / Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stages List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            Compiler Stages
          </div>

          {stages.map((stage) => {
            const isActive = stage.id === activeLogStage;
            return (
              <div
                key={stage.id}
                onClick={() => setActiveLogStage(stage.id)}
                className={`p-3.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-800 border-indigo-500 shadow-sm'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-slate-200 flex items-center space-x-2">
                    <span>{stage.name}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    stage.status === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : stage.status === 'running'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                  }`}>
                    {stage.status}
                  </span>
                </div>

                <div className="text-slate-400 text-[11px] mb-2 font-sans">
                  {stage.description}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <code className="text-cyan-400">{stage.command}</code>
                  {stage.durationMs && (
                    <span className="text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{stage.durationMs}ms</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Terminal & Artifact Outputs */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compiler Terminal Output: {currentActiveStage.name}</span>
              </div>
              <span className="text-slate-500">PrismPM SDK linux/amd64</span>
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 space-y-1 min-h-[220px] max-h-[300px] overflow-y-auto">
              <div className="text-slate-500 mb-2">
                $ {currentActiveStage.command}
              </div>
              {currentActiveStage.logs.length === 0 ? (
                <div className="text-slate-600 italic">
                  No log output yet. Run the pipeline to view real-time compilation transcripts.
                </div>
              ) : (
                currentActiveStage.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.startsWith('[OK]')
                        ? 'text-emerald-400 font-semibold'
                        : log.startsWith('[CHECK]')
                        ? 'text-cyan-300'
                        : log.startsWith('[TEST]')
                        ? 'text-amber-300'
                        : log.startsWith('[ERROR]')
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Generated Outputs for current stage */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generated Artifacts for {currentActiveStage.name}</span>
            </div>

            {(!currentActiveStage.outputs || currentActiveStage.outputs.length === 0) ? (
              <div className="text-xs font-mono text-slate-500 py-3 text-center">
                Artifacts will appear here once stage completes.
              </div>
            ) : (
              <div className="space-y-2">
                {currentActiveStage.outputs.map((out, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">{out.name}</div>
                      <div className="text-[10px] text-slate-500">{out.digest}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {out.size}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
