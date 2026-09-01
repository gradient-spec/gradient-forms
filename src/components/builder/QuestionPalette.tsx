import React, { useState } from 'react';
import { QuestionType } from '../../types';
import {
  Type,
  AlignLeft,
  CheckSquare,
  CircleDot,
  List,
  ChevronDown,
  Sliders,
  Star,
  Calendar,
  Clock,
  Upload,
  Mail,
  Phone,
  Hash,
  Link,
  Layers,
  Grid,
  ShieldCheck,
  PenTool,
  Plus,
  Search,
  ChevronRight,
  Layers3
} from 'lucide-react';

interface QuestionPaletteProps {
  onAddQuestion: (type: QuestionType) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({ onAddQuestion }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const categories: {
    category: string;
    items: { type: QuestionType; label: string; icon: React.FC<{ className?: string }> }[];
  }[] = [
    {
      category: 'Basic Question Types',
      items: [
        { type: 'short_answer', label: 'Short Answer', icon: Type },
        { type: 'paragraph', label: 'Paragraph', icon: AlignLeft },
        { type: 'multiple_choice', label: 'Radio Button (Single Choice)', icon: CircleDot },
        { type: 'checkboxes', label: 'Checkboxes', icon: List },
        { type: 'dropdown', label: 'Dropdown', icon: ChevronDown }
      ]
    },
    {
      category: 'Advanced Fields',
      items: [
        { type: 'scale', label: 'Linear Scale', icon: Sliders },
        { type: 'rating', label: 'Star Rating', icon: Star },
        { type: 'date', label: 'Date Picker', icon: Calendar },
        { type: 'file_upload', label: 'File Upload', icon: Upload },
        { type: 'email', label: 'Email Address', icon: Mail },
        { type: 'phone', label: 'Phone Number', icon: Phone },
        { type: 'number', label: 'Numeric Input', icon: Hash },
        { type: 'url', label: 'Website URL', icon: Link }
      ]
    },
    {
      category: 'Special & Compliance',
      items: [
        { type: 'matrix', label: 'Matrix Grid', icon: Grid },
        { type: 'section', label: 'New Section', icon: Layers }
      ]
    }
  ];

  const allItems = categories.flatMap(c => c.items);

  return (
    <>
      {/* Mobile Component Bar / Trigger (< lg screens) */}
      <div className="lg:hidden bg-[#121820] border-b border-[#2A3647] p-2 px-3 flex items-center justify-between z-20 shrink-0">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/40 text-xs font-bold font-heading cursor-pointer"
        >
          <Layers3 className="w-4 h-4" />
          <span>+ Add Question Fields ({allItems.length})</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isMobileOpen ? 'rotate-90' : ''}`} />
        </button>

        {/* Quick Horizontal Scroll Pills on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[55vw] no-scrollbar py-0.5">
          {allItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => onAddQuestion(item.type)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-[11px] text-slate-200 shrink-0 cursor-pointer"
              >
                <Icon className="w-3 h-3 text-[#38BDF8]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Expandable Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-xs"
        />
      )}

      {/* Desktop Sidebar & Mobile Expandable Drawer Panel */}
      <aside
        className={`bg-[#121820] border-r border-[#2A3647] p-3 space-y-4 overflow-y-auto transition-all ${
          isMobileOpen
            ? 'fixed inset-x-0 top-26 z-50 max-h-[75vh] border-b shadow-2xl rounded-b-2xl block'
            : 'hidden lg:block w-60 h-[calc(100vh-3.5rem)]'
        }`}
      >
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading flex items-center justify-between">
            <span>Component Library</span>
            {isMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-xs text-[#38BDF8] font-mono hover:underline"
              >
                Close ✕
              </button>
            )}
          </h3>
          <p className="text-[10px] text-[#84A1C0] mt-0.5 font-mono">Tap any element to append to canvas.</p>
        </div>

        {/* Search Filter */}
        <div className="relative">
          <Search className="w-3 h-3 text-[#84A1C0] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter fields..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#1A2332] border border-[#2A3647] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="space-y-4">
          {categories.map((cat, idx) => {
            const filteredItems = cat.items.filter(item =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#84A1C0]">
                  {cat.category}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        onClick={() => {
                          onAddQuestion(item.type);
                          if (isMobileOpen) setIsMobileOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#2563EB] text-xs text-slate-200 hover:text-white transition-all group text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#38BDF8] transition-colors" />
                          <span className="text-xs">{item.label}</span>
                        </div>
                        <Plus className="w-3 h-3 text-[#38BDF8] opacity-60 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
