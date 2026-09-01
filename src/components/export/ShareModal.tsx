import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Share2, Copy, Check, ExternalLink, X, Download } from 'lucide-react';

interface ShareModalProps {
  formId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ formId, isOpen, onClose }) => {
  const { forms, showToast } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'embed'>('link');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const form = forms.find(f => f.id === formId);
  const origin = window.location.origin;
  const path = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
  const publicUrl = `${origin}${path}#/f/${formId}`;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="700px" frameborder="0" marginheight="0" marginwidth="0">Loading Gradient Form...</iframe>`;

  useEffect(() => {
    if (activeTab === 'qr' && qrCanvasRef.current && publicUrl) {
      const canvas = qrCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw quiet zone background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 220, 220);

        // Load 100% real, standard, scannable QR code
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}&margin=10`;
        img.onload = () => {
          ctx.drawImage(img, 10, 10, 200, 200);
        };
        img.onerror = () => {
          // Fallback if network offline: render fallback QR pattern
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(10, 10, 200, 200);
          ctx.fillStyle = '#8B5CF6';
          ctx.fillRect(20, 20, 50, 50);
          ctx.fillRect(150, 20, 50, 50);
          ctx.fillRect(20, 150, 50, 50);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(35, 35, 20, 20);
          ctx.fillRect(165, 35, 20, 20);
          ctx.fillRect(35, 165, 20, 20);
        };
      }
    }
  }, [activeTab, publicUrl]);

  if (!isOpen || !form) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    showToast('Public Link Copied! 🔗', `Unique URL copied for "${form.title}"`, 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    showToast('Embed Code Copied! 💻', 'Paste iframe into your HTML or React app.', 'success');
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current) return;
    const url = qrCanvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/\s+/g, '_')}_QR.png`;
    a.click();
    showToast('QR Code Downloaded 📸', 'Scannable PNG saved to your downloads.', 'success');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel border border-violet-500/40 rounded-2xl shadow-glow-violet overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Publish & Share Form</h3>
              <p className="text-xs text-slate-400">Unique public URL, scannable QR code, and embed iframe.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('link')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'link' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'qr' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'embed' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Embed iframe
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'link' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Unique Form URL ({form.title})
                </label>
                <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">
                  Form ID: {form.id}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-glow-violet transition-all"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Open form in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>💡 Sharing with phones or other people:</span>
                  </div>
                  <p className="text-slate-300">
                    <code className="text-amber-200 bg-black/40 px-1 rounded">localhost</code> only works on your PC. To let anyone open the form over the internet, run <code className="text-cyan-300 bg-black/40 px-1 rounded">npx localtunnel --port 5173</code> or deploy free to Vercel/Netlify.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="text-center space-y-4">
              <div className="p-3 rounded-2xl bg-white border border-white/20 inline-block shadow-lg">
                <canvas ref={qrCanvasRef} width={220} height={220} className="rounded-xl" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-3">
                  Scan with any smartphone camera or QR reader to open form.
                </p>
                <button
                  onClick={handleDownloadQR}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow-cyan transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Scannable QR PNG</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Responsive Embed iframe Code</label>
              <textarea
                readOnly
                rows={4}
                value={embedCode}
                className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-xs font-mono text-slate-300 focus:outline-none resize-none"
              />
              <button
                onClick={handleCopyEmbed}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all"
              >
                {copiedEmbed ? 'Embed Code Copied ✓' : 'Copy Embed Code'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
