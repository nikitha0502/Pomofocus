import { useState, useEffect, useRef } from 'react';
import { Settings, Play, Pause, RotateCcw, SkipForward, Timer } from 'lucide-react';
import SettingsModal from './components/SettingsModal';

const SESSION_TYPES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

const playChime = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
  osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.5);
};

function App() {
  const [settings, setSettings] = useState({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
  });

  const [currentSession, setCurrentSession] = useState(SESSION_TYPES.WORK);
  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [workSessionsCompleted, setWorkSessionsCompleted] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const timerRef = useRef(null);

  // Update theme color based on session
  useEffect(() => {
    const root = document.documentElement;
    if (currentSession === SESSION_TYPES.WORK) {
      root.style.setProperty('--theme-color', 'var(--color-work)');
    } else if (currentSession === SESSION_TYPES.SHORT_BREAK) {
      root.style.setProperty('--theme-color', 'var(--color-short-break)');
    } else {
      root.style.setProperty('--theme-color', 'var(--color-long-break)');
    }
  }, [currentSession]);

  // Update time left if settings change and timer is not active
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(settings[currentSession] * 60);
    }
  }, [settings, currentSession]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }
    
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    playChime();
    clearInterval(timerRef.current);
    setIsActive(false);

    if (currentSession === SESSION_TYPES.WORK) {
      const newWorkCount = workSessionsCompleted + 1;
      setWorkSessionsCompleted(newWorkCount);
      
      if (newWorkCount % 4 === 0) {
        switchSession(SESSION_TYPES.LONG_BREAK);
      } else {
        switchSession(SESSION_TYPES.SHORT_BREAK);
      }
    } else {
      switchSession(SESSION_TYPES.WORK);
    }
  };

  const switchSession = (session) => {
    setCurrentSession(session);
    setTimeLeft(settings[session] * 60);
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[currentSession] * 60);
  };

  const skipSession = () => {
    handleSessionComplete();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    if (!isActive) {
      setTimeLeft(newSettings[currentSession] * 60);
    }
    setIsSettingsOpen(false);
  };

  return (
    <div className="app-container">
      <div className="glass-panel">
        <header className="app-header">
          <div className="logo">
            <Timer size={28} />
            Pomofocus
          </div>
          <button className="btn-icon" onClick={() => setIsSettingsOpen(true)} aria-label="Settings">
            <Settings size={24} />
          </button>
        </header>

        <div className="session-types">
          <button 
            className={`session-pill ${currentSession === SESSION_TYPES.WORK ? 'active' : ''}`}
            onClick={() => switchSession(SESSION_TYPES.WORK)}
          >
            Pomodoro
          </button>
          <button 
            className={`session-pill ${currentSession === SESSION_TYPES.SHORT_BREAK ? 'active' : ''}`}
            onClick={() => switchSession(SESSION_TYPES.SHORT_BREAK)}
          >
            Short Break
          </button>
          <button 
            className={`session-pill ${currentSession === SESSION_TYPES.LONG_BREAK ? 'active' : ''}`}
            onClick={() => switchSession(SESSION_TYPES.LONG_BREAK)}
          >
            Long Break
          </button>
        </div>

        <div className="timer-display">
          {formatTime(timeLeft)}
        </div>

        <div className="controls-container">
          <button className="btn-icon" onClick={resetTimer} aria-label="Reset Timer">
            <RotateCcw size={24} />
          </button>
          
          <button className="btn-primary" onClick={toggleTimer}>
            {isActive ? 'PAUSE' : 'START'}
          </button>

          <button className="btn-icon" onClick={skipSession} aria-label="Skip Session">
            <SkipForward size={24} />
          </button>
        </div>

        <div className="session-tracker">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`dot ${i < (workSessionsCompleted % 4) || (workSessionsCompleted > 0 && workSessionsCompleted % 4 === 0 && i === 3 && currentSession !== SESSION_TYPES.WORK) ? 'active' : ''}`} 
            />
          ))}
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={updateSettings}
      />
    </div>
  );
}

export default App;
