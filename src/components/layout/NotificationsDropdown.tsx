import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, X, MessageSquareText, Globe, RefreshCw, Sparkles, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'New Submission Received 📩',
    description: 'Customer CS Feedback form received a new response.',
    time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unread: true,
    formId: 'form-cs-feedback',
    type: 'submission'
  },
  {
    id: 'notif-2',
    title: 'Google Sheets Auto-Synced 📊',
    description: 'Response dataset synced to Google Sheets cloud spreadsheet.',
    time: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    unread: true,
    formId: 'form-cs-feedback',
    type: 'sync'
  },
  {
    id: 'notif-3',
    title: 'Form Status Live Published 🟢',
    description: 'Event Registration form is actively accepting responses.',
    time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    unread: true,
    formId: 'form-event-reg',
    type: 'publish'
  },
  {
    id: 'notif-4',
    title: 'Quiz Scorer Engine Ready ⚡',
    description: 'Quiz mode grading evaluation verified across all question fields.',
    time: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    unread: false,
    formId: 'form-cs-feedback',
    type: 'system'
  }
];

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  const { setActiveView, setActiveFormId } = useApp();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleItemClick = (formId?: string) => {
    if (formId) {
      setActiveFormId(formId);
      setActiveView('analytics');
    } else {
      setActiveView('dashboard');
    }
    onClose();
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#121820] border border-[#2A3647] shadow-[0_12px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden text-slate-100 animate-fadeIn">
      {/* Header Bar */}
      <div className="p-3.5 px-4 bg-[#1A2332] border-b border-[#2A3647] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-bold font-heading text-white">Notifications & Activity</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#2563EB] text-white">
              {unreadCount} New
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-mono text-[#38BDF8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Read all</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#121820] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#2A3647]/50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No notifications available.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item));
                handleItemClick(n.formId);
              }}
              className={`p-3.5 px-4 hover:bg-[#1A2332]/80 transition-colors cursor-pointer flex items-start gap-3 relative ${
                n.unread ? 'bg-[#2563EB]/5' : ''
              }`}
            >
              {/* Type Icon */}
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                n.type === 'submission'
                  ? 'bg-[#2563EB]/20 text-[#38BDF8] border-[#2563EB]/40'
                  : n.type === 'sync'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : n.type === 'publish'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-violet-500/20 text-violet-300 border-violet-500/40'
              }`}>
                {n.type === 'submission' && <MessageSquareText className="w-4 h-4" />}
                {n.type === 'sync' && <RefreshCw className="w-4 h-4" />}
                {n.type === 'publish' && <Globe className="w-4 h-4" />}
                {n.type === 'system' && <Sparkles className="w-4 h-4" />}
              </div>

              {/* Text Body */}
              <div className="flex-1 space-y-0.5 pr-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{n.description}</p>
              </div>

              {/* Unread Pill Indicator */}
              {n.unread && (
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] shrink-0 mt-2 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
