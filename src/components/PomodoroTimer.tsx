import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings as SettingsIcon, 
  Maximize2, 
  Minimize2, 
  Bell, 
  Coffee, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sparkles 
} from 'lucide-react';

interface PomodoroTimerProps {
  onLogActivity: (action: string, details: string) => void;
}

export default function PomodoroTimer({ onLogActivity }: PomodoroTimerProps) {
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins initial
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Time customization
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortMinutes, setShortMinutes] = useState(5);
  const [longMinutes, setLongMinutes] = useState(15);
  const [showConfig, setShowConfig] = useState(false);

  // Stats
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mode times
  useEffect(() => {
    if (!isActive) {
      if (mode === 'work') setTimeLeft(workMinutes * 60);
      else if (mode === 'short') setTimeLeft(shortMinutes * 60);
      else setTimeLeft(longMinutes * 60);
    }
  }, [mode, workMinutes, shortMinutes, longMinutes]);

  // Main countdown trigger
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const handleTimerExpiry = () => {
    setIsActive(false);
    
    // Play alert sound if not muted
    if (!isMuted) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioContext.currentTime); // high tone
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        osc.start();
        osc.stop(audioContext.currentTime + 0.5);
      } catch (err) {
        console.log('Audio playback ignored or blocked', err);
      }
    }

    // Trigger Linux notification mock if requested
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer expired!', {
        body: mode === 'work' ? 'Time for a well-deserved short break!' : 'Break is over, let us lock back in!',
      });
    }

    // Update stats and logs
    if (mode === 'work') {
      setCompletedSessions(prev => prev + 1);
      onLogActivity('Pomodoro Session', 'Completed 1 highly-focused work block.');
      setMode('short'); // auto transition to break
    } else {
      setMode('work'); // back to work
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') setTimeLeft(workMinutes * 60);
    else if (mode === 'short') setTimeLeft(shortMinutes * 60);
    else setTimeLeft(longMinutes * 60);
  };

  const handleApplyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfig(false);
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Percent completed helper for circular path
  const totalSeconds = mode === 'work' ? workMinutes * 60 : mode === 'short' ? shortMinutes * 60 : longMinutes * 60;
  const completionPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className={`transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 bg-[#0C0C0E] flex flex-col justify-center items-center p-8 text-white' 
        : 'bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-6 relative overflow-hidden'
    }`}>
      
      {/* Absolute Header for Fullscreen */}
      {isFullscreen && (
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-xs font-mono tracking-wider text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sophisticated-accent animate-pulse" />
            <span>FULLSCREEN DEEP FOCUS MODE</span>
          </div>
          <button 
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-sophisticated-border hover:bg-sophisticated-active rounded-lg text-white cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" /> Exit
          </button>
        </div>
      )}

      {/* Main Content wrapper */}
      <div className="max-w-md w-full mx-auto flex flex-col items-center gap-6">
        
        {/* Mode Selector buttons */}
        <div className="flex items-center bg-gray-50 dark:bg-sophisticated-bg p-1 rounded-lg border border-gray-100 dark:border-sophisticated-border shadow-xs">
          {(['work', 'short', 'long'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setIsActive(false); }}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono transition-all cursor-pointer ${
                mode === m 
                  ? 'bg-white dark:bg-sophisticated-active text-sophisticated-accent dark:text-sophisticated-text shadow-xs' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-sophisticated-muted'
              }`}
            >
              {m === 'work' ? 'Work Interval' : m === 'short' ? 'Short Break' : 'Long Break'}
            </button>
          ))}
        </div>

        {/* Big circular or text countdown layout */}
        <div className="relative flex flex-col items-center justify-center py-6">
          
          {/* Subtle Breathing Ripple if active */}
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full bg-sophisticated-accent/5 animate-ping" />
            </div>
          )}

          <div className={`text-6xl md:text-7xl font-mono font-bold tracking-tight select-none ${
            isFullscreen ? 'text-white' : 'text-gray-800 dark:text-sophisticated-text'
          }`}>
            {formatTime(timeLeft)}
          </div>

          <div className="text-[10px] text-gray-400 dark:text-sophisticated-muted font-mono uppercase tracking-widest mt-2 flex items-center gap-1.5">
            {mode === 'work' ? (
              <>
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Locked In Focused
              </>
            ) : (
              <>
                <Coffee className="w-3.5 h-3.5 text-emerald-500" /> Rest and Rehydrate
              </>
            )}
          </div>
        </div>

        {/* Operational buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTimer}
            className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              isActive 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-sophisticated-accent/80 dark:hover:bg-sophisticated-accent text-white'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause Timer' : 'Begin Focus'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-2 border border-gray-100 dark:border-sophisticated-border hover:bg-gray-50 dark:hover:bg-sophisticated-active text-gray-600 dark:text-sophisticated-text rounded-xl transition-colors cursor-pointer"
            title="Reset Countdown"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {!isFullscreen && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 border border-gray-100 dark:border-sophisticated-border hover:bg-gray-50 dark:hover:bg-sophisticated-active text-gray-600 dark:text-sophisticated-text rounded-xl transition-colors cursor-pointer"
              title="Fullscreen Focus"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 border border-gray-100 dark:border-sophisticated-border hover:bg-gray-50 dark:hover:bg-sophisticated-active text-gray-600 dark:text-sophisticated-text rounded-xl transition-colors cursor-pointer"
            title={isMuted ? "Unmute alarm" : "Mute alarm"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 border rounded-xl transition-colors cursor-pointer ${
              showConfig ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-sophisticated-active dark:border-sophisticated-accent dark:text-sophisticated-accent' : 'border-gray-100 dark:border-sophisticated-border hover:bg-gray-50 dark:hover:bg-sophisticated-active text-gray-600 dark:text-sophisticated-text'
            }`}
            title="Configure Times"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Stats footer block */}
        <div className={`w-full grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-sophisticated-border ${isFullscreen ? 'text-zinc-400' : 'text-gray-500'}`}>
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider block text-gray-400 dark:text-sophisticated-muted">Intervals Done</span>
            <span className="text-sm font-bold text-gray-900 dark:text-sophisticated-text font-mono mt-0.5 block">{completedSessions}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider block text-gray-400 dark:text-sophisticated-muted">Total Focus</span>
            <span className="text-sm font-bold text-gray-900 dark:text-sophisticated-text font-mono mt-0.5 block">{completedSessions * workMinutes} mins</span>
          </div>
        </div>

        {/* Custom configuration modal overlay form */}
        {showConfig && (
          <form onSubmit={handleApplyConfig} className="w-full bg-gray-50 dark:bg-sophisticated-bg p-4 border border-gray-100 dark:border-sophisticated-border rounded-xl mt-2 space-y-3.5 animate-in slide-in-from-top-4 duration-250 text-gray-900 dark:text-sophisticated-text">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-sophisticated-muted uppercase tracking-wider font-mono">Customize Durations</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Work (mins)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border px-2.5 py-1 text-xs outline-none rounded text-gray-900 dark:text-sophisticated-text"
                  value={workMinutes}
                  onChange={e => setWorkMinutes(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Short (mins)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border px-2.5 py-1 text-xs outline-none rounded text-gray-900 dark:text-sophisticated-text"
                  value={shortMinutes}
                  onChange={e => setShortMinutes(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 dark:text-sophisticated-muted font-mono mb-1 uppercase">Long (mins)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border px-2.5 py-1 text-xs outline-none rounded text-gray-900 dark:text-sophisticated-text"
                  value={longMinutes}
                  onChange={e => setLongMinutes(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-2.5 py-1 text-[10px] font-bold border border-gray-200 dark:border-sophisticated-border text-gray-500 rounded hover:bg-gray-100 dark:hover:bg-sophisticated-active cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 dark:bg-sophisticated-accent text-white rounded hover:bg-indigo-700 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
