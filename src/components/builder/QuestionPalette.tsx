import React, { useState } from 'react';
import { QuestionType } from '../../types';
import {
  Type,
  AlignLeft,
  CheckSquare,
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
  Search
} from 'lucide-react';

interface QuestionPaletteProps {
  onAddQuestion: (type: QuestionType) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({ onAddQuestion }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories: {
    category: string;
    items: { type: QuestionType; label: string; icon: React.FC<{ className?: string }> }[];
  }[] = [
    {
      category: 'Basic Question Types',
      items: [
        { type: 'short_answer', label: 'Short Answer', icon: Type },
        { type: 'paragraph', label: 'Paragraph', icon: AlignLeft },
        { type: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare },
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
        { type: 'time', label: 'Time Picker', icon: Clock },
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
        { type: 'signature', label: 'Digital Signature', icon: PenTool },
        { type: 'consent', label: 'Terms Consent', icon: ShieldCheck },
        { type: 'section', label: 'New Section', icon: Layers }
      ]
    }
  ];

  return (
    <aside className="w-60 bg-[#121820] border-r border-[#2A3647] p-3 space-y-4 overflow-y-auto hidden lg:block h-[calc(100vh-3.5rem)]">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">Component Library</h3>
        <p className="text-[10px] text-[#84A1C0] mt-0.5 font-mono">Click or drag elements to canvas.</p>
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
              <div className="space-y-0.5">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => onAddQuestion(item.type)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#2563EB] text-xs text-slate-200 hover:text-white transition-all group text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#38BDF8] transition-colors" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#38BDF8] transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
