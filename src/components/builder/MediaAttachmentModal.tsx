import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link,
  Image as ImageIcon,
  PlaySquare,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';

interface MediaAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'image' | 'video';
  initialUrl?: string;
  initialCaption?: string;
  onSave: (url: string, caption?: string) => void;
  onRemove?: () => void;
}

export const MediaAttachmentModal: React.FC<MediaAttachmentModalProps> = ({
  isOpen,
  onClose,
  mediaType,
  initialUrl = '',
  initialCaption = '',
  onSave,
  onRemove
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [captionInput, setCaptionInput] = useState(initialCaption);
  const [previewError, setPreviewError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setUrlInput(initialUrl);
    setCaptionInput(initialCaption);
    setPreviewError(false);
    if (initialUrl && initialUrl.startsWith('http')) {
      setActiveTab('url');
    } else {
      setActiveTab('upload');
    }
  }, [initialUrl, initialCaption, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUrlInput(result);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  };

  const getYoutubeEmbedUrl = (rawUrl: string): string => {
    try {
      if (rawUrl.includes('youtube.com/watch?v=')) {
        const videoId = new URL(rawUrl).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (rawUrl.includes('youtu.be/')) {
        const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (rawUrl.includes('youtube.com/embed/')) {
        return rawUrl;
      }
    } catch (e) {
      console.error(e);
    }
    return rawUrl;
  };

  const handleSave = () => {
    if (!urlInput.trim()) {
      onRemove?.();
      onClose();
      return;
    }
    const finalUrl = mediaType === 'video' ? getYoutubeEmbedUrl(urlInput.trim()) : urlInput.trim();
    onSave(finalUrl, captionInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161D27] border border-[#2A3647] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A3647] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center">
              {mediaType === 'image' ? (
                <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
              ) : (
                <PlaySquare className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {mediaType === 'image' ? 'Attach Image to Question' : 'Embed Video in Question'}
              </h3>
              <p className="text-xs text-slate-400">
                {mediaType === 'image'
                  ? 'Add visual diagram, screenshot, or graphic to this question'
                  : 'Add YouTube tutorial, presentation, or demonstration video'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2634] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Tabs: Upload vs URL */}
          {mediaType === 'image' && (
            <div className="flex items-center gap-2 p-1 bg-[#10151E] rounded-xl border border-[#2A3647]">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Image URL</span>
              </button>
            </div>
          )}

          {/* Upload Dropzone */}
          {mediaType === 'image' && activeTab === 'upload' && (
            <label
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#38BDF8] bg-[#38BDF8]/10'
                  : 'border-[#2A3647] hover:border-[#38BDF8]/50 bg-[#121820]'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#38BDF8]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Click or drag image here to upload</p>
                <p className="text-[11px] text-slate-400">PNG, JPG, WebP, GIF, SVG up to 10MB</p>
              </div>
            </label>
          )}

          {/* URL Input */}
          {(mediaType === 'video' || activeTab === 'url') && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {mediaType === 'image' ? 'Image Direct URL' : 'YouTube or Video URL'}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setPreviewError(false);
                  }}
                  placeholder={
                    mediaType === 'image'
                      ? 'https://images.unsplash.com/photo-...'
                      : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                  }
                  className="w-full bg-[#121820] border border-[#2A3647] focus:border-[#38BDF8] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Media Caption / Alt Text (Optional)
            </label>
            <input
              type="text"
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
              placeholder="e.g. Figure 1: Architecture diagram for Question 3"
              className="w-full bg-[#121820] border border-[#2A3647] focus:border-[#38BDF8] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Live Preview Box */}
          {urlInput && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Live Preview
              </span>
              <div className="rounded-xl overflow-hidden border border-[#2A3647] bg-[#10151E] flex items-center justify-center min-h-[140px] max-h-[220px]">
                {mediaType === 'image' ? (
                  previewError ? (
                    <div className="p-4 flex items-center gap-2 text-xs text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Unable to load image. Please verify URL.</span>
                    </div>
                  ) : (
                    <img
                      src={urlInput}
                      alt={captionInput || 'Question media'}
                      onError={() => setPreviewError(true)}
                      className="max-h-[220px] w-full object-contain"
                    />
                  )
                ) : (
                  <iframe
                    src={getYoutubeEmbedUrl(urlInput)}
                    title="Video preview"
                    className="w-full aspect-video max-h-[220px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A3647] bg-[#121820] flex items-center justify-between">
          <div>
            {initialUrl && (
              <button
                type="button"
                onClick={() => {
                  onRemove?.();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Media</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#242F42] border border-[#2A3647] text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-bold text-white shadow-neo transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Attach to Question</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
