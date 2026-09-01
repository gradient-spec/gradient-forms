import React, { useState } from 'react';
import { Comment } from '../../types';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Send, CheckCircle2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentDrawerProps {
  isOpen: boolean;
  formId: string;
  questionId: string | null;
  questionTitle?: string;
  onClose: () => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  isOpen,
  formId,
  questionId,
  questionTitle,
  onClose
}) => {
  const { comments, addComment, resolveComment } = useApp();
  const [newCommentText, setNewCommentText] = useState('');

  if (!isOpen) return null;

  const relevantComments = comments.filter(c => c.formId === formId && (questionId ? c.questionId === questionId : true));

  const handleSend = () => {
    if (!newCommentText.trim() || !questionId) return;
    addComment(formId, questionId, newCommentText);
    setNewCommentText('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm h-full glass-panel border-l border-white/10 p-6 flex flex-col justify-between overflow-hidden animate-slide-left">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-400" />
              <h3 className="text-sm font-bold font-display text-white">Collaboration Comments</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {questionTitle && (
            <div className="mt-3 p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
              <span className="font-semibold text-slate-500 uppercase text-[10px] block">Target Question:</span>
              <p className="font-medium line-clamp-1 text-white">{questionTitle}</p>
            </div>
          )}

          {/* Comment Thread List */}
          <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {relevantComments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No comments on this field yet.</p>
            ) : (
              relevantComments.map((c) => (
                <div key={c.id} className={`p-3 rounded-xl border text-xs space-y-2 ${c.resolved ? 'bg-white/5 border-white/5 opacity-60' : 'glass-panel border-violet-500/30'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={c.authorAvatar} alt={c.authorName} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-bold text-white text-[11px]">{c.authorName}</span>
                    </div>
                    <button
                      onClick={() => resolveComment(c.id)}
                      className={`text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded ${c.resolved ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'}`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{c.resolved ? 'Resolved' : 'Resolve'}</span>
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input Box */}
        {questionId && (
          <div className="pt-4 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Write a comment..."
              className="flex-1 bg-white/5 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 border border-white/10 focus:border-violet-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-glow-violet"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
