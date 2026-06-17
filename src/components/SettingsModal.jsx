import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, settings, onSave }) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: Math.max(1, parseInt(value) || 1)
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Timer Settings</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="setting-group">
            <label htmlFor="work">Pomodoro (minutes)</label>
            <input 
              type="number" 
              id="work" 
              name="work" 
              value={localSettings.work} 
              onChange={handleChange}
              min="1"
            />
          </div>
          <div className="setting-group">
            <label htmlFor="shortBreak">Short Break (minutes)</label>
            <input 
              type="number" 
              id="shortBreak" 
              name="shortBreak" 
              value={localSettings.shortBreak} 
              onChange={handleChange}
              min="1"
            />
          </div>
          <div className="setting-group">
            <label htmlFor="longBreak">Long Break (minutes)</label>
            <input 
              type="number" 
              id="longBreak" 
              name="longBreak" 
              value={localSettings.longBreak} 
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-save" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
