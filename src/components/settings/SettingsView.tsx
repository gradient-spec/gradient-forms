import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_AVATAR } from '../../data/seedData';
import {
  User,
  Check,
  Upload,
  Image as ImageIcon,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Move,
  Database,
  ArrowLeft,
  Building2,
  KeyRound,
  Laptop,
  LogOut,
  Edit3,
  ShieldCheck,
  Settings as SettingsIcon,
  Maximize2,
  Minimize2,
  RefreshCw,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckSquare,
  Square,
  Clock,
  ArchiveRestore
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { IntegrationDetailModal, IntegrationType } from '../integrations/IntegrationDetailModal';
import {
  GoogleSheetsCard,
  GoogleDriveCard,
  ResendEmailCard,
  SlackAlertsCard,
  ZapierCard,
  WebhookCard
} from '../cards/IntegrationVisualCards';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    workspace,
    forms,
    trashForms,
    restoreForm,
    bulkRestoreForms,
    permanentlyDeleteForm,
    bulkPermanentlyDeleteForms,
    emptyTrash,
    updateUserProfile,
    updateWorkspaceName,
    showToast,
    setActiveView,
    activeView
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Settings Tab state (profile, integrations, or trash)
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'trash'>(
    activeView === 'integrations' ? 'integrations' : 'profile'
  );

  useEffect(() => {
    if (activeView === 'integrations') {
      setActiveTab('integrations');
    }
  }, [activeView]);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Recycle Bin selection & modal state
  const [selectedTrashIds, setSelectedTrashIds] = useState<Set<string>>(new Set());
  const [confirmPermanentDeleteId, setConfirmPermanentDeleteId] = useState<string | null>(null);
  const [isConfirmEmptyTrashOpen, setIsConfirmEmptyTrashOpen] = useState(false);
  const [isConfirmBulkPermanentOpen, setIsConfirmBulkPermanentOpen] = useState(false);

  // Profile Edit fields
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar || DEFAULT_AVATAR);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Workspace Edit fields
  const [editWorkspaceName, setEditWorkspaceName] = useState(workspace.name);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Integrations state
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>(null);

  // High-Precision Cropper Modal State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string>('');
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const cropImageRef = useRef<HTMLImageElement | null>(null);

  // Ensure default dark theme
  useEffect(() => {
    document.documentElement.classList.remove('light');
    document.body.classList.remove('light');
    localStorage.removeItem('gradient_forms_theme');
  }, []);

  // Sync profile state with currentUser
  useEffect(() => {
    setEditName(currentUser.name);
    setEditEmail(currentUser.email);
    setEditAvatar(currentUser.avatar || DEFAULT_AVATAR);
  }, [currentUser]);

  // Sync workspace state
  useEffect(() => {
    setEditWorkspaceName(workspace.name);
  }, [workspace.name]);

  // Handle local Image File Upload -> Measures image & Opens Cropper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File Too Large', 'Please select an image smaller than 10MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        const testImg = new Image();
        testImg.onload = () => {
          setImgDimensions({ width: testImg.naturalWidth || testImg.width, height: testImg.naturalHeight || testImg.height });
          setCropSrc(dataUrl);
          setZoom(1.0);
          setRotation(0);
          setOffset({ x: 0, y: 0 });
          setIsCropperOpen(true);
        };
        testImg.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOpenCropperForCurrent = () => {
    const src = editAvatar && editAvatar !== DEFAULT_AVATAR ? editAvatar : DEFAULT_AVATAR;
    const testImg = new Image();
    testImg.onload = () => {
      setImgDimensions({ width: testImg.naturalWidth || testImg.width, height: testImg.naturalHeight || testImg.height });
      setCropSrc(src);
      setZoom(1.0);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setIsCropperOpen(true);
    };
    testImg.src = src;
  };

  // Fit to frame / Fit to circle
  const handleFit = () => {
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  // Fill / Cover frame
  const handleFill = () => {
    if (imgDimensions.width && imgDimensions.height) {
      const maxDim = Math.max(imgDimensions.width, imgDimensions.height);
      const minDim = Math.min(imgDimensions.width, imgDimensions.height);
      const fillRatio = maxDim / (minDim || 1);
      setZoom(Math.min(3.0, Math.max(1.0, fillRatio)));
    } else {
      setZoom(1.5);
    }
    setOffset({ x: 0, y: 0 });
  };

  // Mouse / Touch Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global drag listeners for fluid panning
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom(prev => Math.min(4.0, Math.max(0.2, prev + delta)));
  };

  // High-Precision Pixel-Perfect Canvas Export
  const handleApplyCrop = () => {
    const canvas = document.createElement('canvas');
    const outSize = 400;
    canvas.width = outSize;
    canvas.height = outSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, outSize, outSize);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.beginPath();
      ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.translate(outSize / 2, outSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const CROP_DIAMETER = 220;
      const outputMultiplier = outSize / CROP_DIAMETER;
      const maxDim = Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height) || 1;
      const baseScale = CROP_DIAMETER / maxDim;
      const finalScale = baseScale * zoom * outputMultiplier;

      const drawW = (img.naturalWidth || img.width) * finalScale;
      const drawH = (img.naturalHeight || img.height) * finalScale;
      const drawX = (offset.x * outputMultiplier) - (drawW / 2);
      const drawY = (offset.y * outputMultiplier) - (drawH / 2);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      const croppedDataUrl = canvas.toDataURL('image/png', 0.95);
      setEditAvatar(croppedDataUrl);
      updateUserProfile({ avatar: croppedDataUrl });
      setIsCropperOpen(false);

      showToast('Profile Picture Updated 📸', 'Your photo has been cropped and applied successfully.', 'success');
    };
    img.src = cropSrc;
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!editName.trim()) {
      showToast('Name Required', 'Please enter a valid display name.', 'error');
      return;
    }
    if (!editEmail.trim()) {
      showToast('Email Required', 'Please enter a valid email address.', 'error');
      return;
    }

    updateUserProfile({
      name: editName.trim(),
      email: editEmail.trim(),
      avatar: editAvatar
    });

    setIsEditProfileOpen(false);
  };

  const handleResetToDefaultAvatar = () => {
    setEditAvatar(DEFAULT_AVATAR);
    updateUserProfile({ avatar: DEFAULT_AVATAR });
    showToast('Default Avatar Restored', 'Profile picture reset to default avatar.', 'info');
  };

  const handleSaveWorkspace = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editWorkspaceName.trim()) {
      showToast('Name Required', 'Workspace name cannot be empty.', 'error');
      return;
    }
    updateWorkspaceName(editWorkspaceName.trim());
    setIsWorkspaceModalOpen(false);
  };

  const handleUpdatePassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalOpen(false);
    showToast('Password Updated 🔒', 'Admin master credentials updated successfully.', 'success');
  };

  const handleSignOut = () => {
    showToast('Signed Out 👋', 'Administrative session terminated.', 'info');
    setActiveView('dashboard');
  };

  // Trash Multi-Selection Handlers
  const handleToggleSelectTrash = (formId: string) => {
    setSelectedTrashIds(prev => {
      const next = new Set(prev);
      if (next.has(formId)) {
        next.delete(formId);
      } else {
        next.add(formId);
      }
      return next;
    });
  };

  const handleToggleSelectAllTrash = () => {
    if (selectedTrashIds.size === trashForms.length && trashForms.length > 0) {
      setSelectedTrashIds(new Set());
    } else {
      setSelectedTrashIds(new Set(trashForms.map(f => f.id)));
    }
  };

  const handleBulkRestoreSelected = () => {
    const ids = Array.from(selectedTrashIds);
    bulkRestoreForms(ids);
    setSelectedTrashIds(new Set());
  };

  const handleConfirmBulkPermanentDelete = () => {
    const ids = Array.from(selectedTrashIds);
    bulkPermanentlyDeleteForms(ids);
    setSelectedTrashIds(new Set());
    setIsConfirmBulkPermanentOpen(false);
  };

  // Compute CSS sizing for interactive viewfinder
  const CROP_DIAMETER = 220;
  const naturalW = imgDimensions.width || 220;
  const naturalH = imgDimensions.height || 220;
  const maxDim = Math.max(naturalW, naturalH) || 220;
  const baseScale = CROP_DIAMETER / maxDim;
  const previewW = naturalW * baseScale * zoom;
  const previewH = naturalH * baseScale * zoom;

  return (
    <div className="text-slate-100 pb-24">
      {/* Top Edge Sub-header Navigation Bar */}
      <div className="w-full border-b border-[#2A3647]/80 bg-[#0B0F14]/90 backdrop-blur-md px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#38BDF8]/60 text-slate-300 hover:text-white text-xs font-semibold shadow-xs transition-all duration-200 group cursor-pointer"
          title="Back to Forms Workspace"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          <span>&lt; Back to Forms</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="hidden sm:inline">Operator:</span>
          <span className="text-slate-200 font-bold">{currentUser.name}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#2563EB]/15 text-[#38BDF8] border border-[#2563EB]/35">
            OWNER
          </span>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Header Bar */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#2563EB]/15 text-[#38BDF8] border border-[#2563EB]/30">
              Admin Control Panel
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-white">
            Admin Profile &amp; Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage single-owner identity, profile picture, workspace settings, system integrations, and deleted forms recycle bin.
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2A3647]/70 pb-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#2563EB]/20 text-white border border-[#2563EB]/50 shadow-xs'
                : 'bg-[#121820] hover:bg-[#1A2332] text-slate-400 hover:text-slate-200 border border-[#2A3647]'
            }`}
          >
            <User className="w-4 h-4 text-[#38BDF8]" />
            <span>Admin Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-[#2563EB]/20 text-white border border-[#2563EB]/50 shadow-xs'
                : 'bg-[#121820] hover:bg-[#1A2332] text-slate-400 hover:text-slate-200 border border-[#2A3647]'
            }`}
          >
            <Database className="w-4 h-4 text-[#38BDF8]" />
            <span>Integrations &amp; Automations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trash')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trash'
                ? 'bg-rose-500/20 text-white border border-rose-500/50 shadow-xs'
                : 'bg-[#121820] hover:bg-[#1A2332] text-slate-400 hover:text-slate-200 border border-[#2A3647]'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Recycle Bin</span>
            {trashForms.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40">
                {trashForms.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: SIMPLIFIED ADMIN PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-5 animate-fadeIn">
            {/* CARD 1: ADMIN PROFILE */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#121820] border border-[#2A3647] shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#2A3647]/70 mb-5">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#38BDF8]" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Admin Profile
                  </h2>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0 group">
                    <img
                      src={currentUser.avatar || DEFAULT_AVATAR}
                      alt={currentUser.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#2A3647] shadow-md bg-[#1A2332]"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                      title="Upload New Photo"
                    >
                      <Upload className="w-5 h-5 text-[#38BDF8]" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold font-heading text-white">{currentUser.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#2563EB]/15 text-[#38BDF8] border border-[#2563EB]/35">
                        OWNER
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
                    <p className="text-[11px] text-slate-500">
                      Workspace: <span className="text-slate-300 font-medium">{workspace.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditName(currentUser.name);
                      setEditEmail(currentUser.email);
                      setEditAvatar(currentUser.avatar || DEFAULT_AVATAR);
                      setIsEditProfileOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#38BDF8]/60 text-slate-200 hover:text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: WORKSPACE */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#121820] border border-[#2A3647] shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#2A3647]/70 mb-5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Workspace
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {forms.length} {forms.length === 1 ? 'Form' : 'Forms'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-heading text-white">{workspace.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>Role: <strong className="text-white font-medium">Owner</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-emerald-400 font-medium">Active</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditWorkspaceName(workspace.name);
                    setIsWorkspaceModalOpen(true);
                  }}
                  className="self-start sm:self-center px-4 py-2 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#38BDF8]/60 text-slate-200 hover:text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Workspace Settings</span>
                </button>
              </div>
            </div>

            {/* CARD 3: SECURITY */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#121820] border border-[#2A3647] shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#2A3647]/70 mb-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Security
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {/* Change Password Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#161D27] border border-[#2A3647]/60">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-white">Change Password</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Update master admin authentication credentials</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                      setIsPasswordModalOpen(true);
                    }}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Change Password
                  </button>
                </div>

                {/* Active Session Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#161D27] border border-[#2A3647]/60">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-white">Active Session</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        CURRENT
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Browser Session • Active Now • Desktop Workstation
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 self-start sm:self-auto">
                    Authenticated
                  </span>
                </div>

                {/* Sign Out Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#2A3647]/40">
                  <p className="text-[11px] text-slate-500">
                    Sign out of your single-admin workspace session on this browser
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTEGRATIONS & AUTOMATIONS */}
        {activeTab === 'integrations' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-[#121820] border border-[#2A3647] space-y-2">
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#38BDF8]" /> Integrations &amp; Systems Automation Hub
              </h3>
              <p className="text-xs text-slate-400">
                Connect forms with external services. Click any integration card to inspect setup details or execute live payload tests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <GoogleSheetsCard onClick={() => setSelectedIntegration('sheets')} />
              <GoogleDriveCard onClick={() => setSelectedIntegration('drive')} />
              <ResendEmailCard onClick={() => setSelectedIntegration('resend')} />
              <SlackAlertsCard onClick={() => setSelectedIntegration('slack')} />
              <ZapierCard onClick={() => setSelectedIntegration('zapier')} />
              <WebhookCard onClick={() => setSelectedIntegration('webhook')} />
            </div>

            <IntegrationDetailModal
              type={selectedIntegration}
              onClose={() => setSelectedIntegration(null)}
            />
          </div>
        )}

        {/* TAB 3: RECYCLE BIN / TRASH */}
        {activeTab === 'trash' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-[#121820] border border-[#2A3647] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-400" /> Forms Recycle Bin
                </h3>
                <p className="text-xs text-slate-400">
                  Deleted forms are safely stored here. You can restore them back to your workspace or permanently purge them.
                </p>
              </div>

              {trashForms.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => bulkRestoreForms(trashForms.map(f => f.id))}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArchiveRestore className="w-3.5 h-3.5" />
                    <span>Restore All ({trashForms.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsConfirmEmptyTrashOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Empty Recycle Bin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Trash Multi-Select Bar */}
            {trashForms.length > 0 && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#161D27] border border-[#2A3647] flex-wrap">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllTrash}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    {selectedTrashIds.size === trashForms.length && trashForms.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedTrashIds.size === trashForms.length && trashForms.length > 0
                        ? 'Deselect All'
                        : `Select All (${trashForms.length})`}
                    </span>
                  </button>

                  {selectedTrashIds.size > 0 && (
                    <span className="text-xs font-mono text-cyan-300">
                      • {selectedTrashIds.size} selected
                    </span>
                  )}
                </div>

                {selectedTrashIds.size > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBulkRestoreSelected}
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Selected ({selectedTrashIds.size})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsConfirmBulkPermanentOpen(true)}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete ({selectedTrashIds.size})</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Trash List */}
            {trashForms.length === 0 ? (
              <div className="p-12 text-center bg-[#121820] rounded-2xl border border-[#2A3647] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1A2332] text-slate-500 flex items-center justify-center mx-auto border border-[#2A3647]">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Recycle Bin is Empty</h4>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  When you delete forms from your workspace, they will appear here so you can safely restore or permanently purge them.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trashForms.map((form) => {
                  const isSelected = selectedTrashIds.has(form.id);
                  return (
                    <div
                      key={form.id}
                      className={`p-4 rounded-2xl bg-[#121820] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected ? 'border-[#38BDF8] ring-1 ring-[#38BDF8]/40 bg-[#16202E]' : 'border-[#2A3647] hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectTrash(form.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#2563EB] border-[#38BDF8] text-white shadow-sm'
                              : 'bg-[#1A2332] border-[#475569] hover:border-[#38BDF8]'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100 stroke-[3]' : 'opacity-0'}`} />
                        </button>

                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{form.title}</h4>
                          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
                            <span>{form.questions?.length || 0} questions</span>
                            <span>•</span>
                            <span>{form.responseCount || 0} responses</span>
                            {form.deletedAt && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Clock className="w-3 h-3 text-rose-400" />
                                  <span>Deleted {formatDistanceToNow(new Date(form.deletedAt), { addSuffix: true })}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => restoreForm(form.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Restore form to active workspace"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmPermanentDeleteId(form.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Permanently wipe from database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Forever</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* MODAL 1: EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#121820] border border-[#2A3647] rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2A3647]/80 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-base font-bold font-heading text-white">Edit Admin Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2332] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Section */}
              <div className="space-y-3 p-4 rounded-xl bg-[#161D27] border border-[#2A3647]/60">
                <label className="block text-xs font-semibold text-slate-300">
                  Profile Photo
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={editAvatar || DEFAULT_AVATAR}
                      alt={editName}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#2A3647] bg-[#1A2332]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New</span>
                    </button>

                    {editAvatar && editAvatar !== DEFAULT_AVATAR && (
                      <button
                        type="button"
                        onClick={handleOpenCropperForCurrent}
                        className="px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>Crop / Resize</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResetToDefaultAvatar}
                      className="px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                      title="Reset to default icon"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Default</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{showUrlInput ? 'Hide URL' : 'URL Link'}</span>
                    </button>
                  </div>
                </div>

                {showUrlInput && (
                  <div className="pt-2">
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="Paste image URL (e.g. https://example.com/avatar.jpg)"
                      className="w-full bg-[#121820] border border-[#2A3647] px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                )}
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#161D27] border border-[#2A3647] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#161D27] border border-[#2A3647] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  placeholder="admin@gradientforms.io"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A3647]/80">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WORKSPACE SETTINGS MODAL */}
      {isWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121820] border border-[#2A3647] rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-[#2A3647]/80 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold font-heading text-white">Workspace Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWorkspaceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2332] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkspace} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Workspace Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editWorkspaceName}
                  onChange={(e) => setEditWorkspaceName(e.target.value)}
                  className="w-full bg-[#161D27] border border-[#2A3647] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  placeholder="e.g. Gradient Labs"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#161D27] border border-[#2A3647]/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Workspace Role:</span>
                  <span className="text-white font-semibold font-mono">Owner (Single Admin)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Forms Managed:</span>
                  <span className="text-slate-200 font-mono">{forms.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A3647]/80">
                <button
                  type="button"
                  onClick={() => setIsWorkspaceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121820] border border-[#2A3647] rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-[#2A3647]/80 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold font-heading text-white">Update Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2332] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {passwordError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#161D27] border border-[#2A3647] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#161D27] border border-[#2A3647] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#161D27] border border-[#2A3647] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A3647]/80">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM SINGLE PERMANENT DELETE */}
      {confirmPermanentDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121820] border border-rose-500/50 rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 border-b border-[#2A3647] pb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-white">Permanently Delete Form?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently purge{' '}
              <strong className="text-white">
                "{trashForms.find(f => f.id === confirmPermanentDeleteId)?.title || 'this form'}"
              </strong>? All associated response data will be wiped from storage.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2A3647]">
              <button
                type="button"
                onClick={() => setConfirmPermanentDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  permanentlyDeleteForm(confirmPermanentDeleteId);
                  setConfirmPermanentDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRM BULK PERMANENT DELETE */}
      {isConfirmBulkPermanentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121820] border border-rose-500/50 rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 border-b border-[#2A3647] pb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-white">
                  Permanently Delete {selectedTrashIds.size} Forms?
                </h3>
                <p className="text-xs text-slate-400">All questions, answers, and data will be permanently wiped.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              These <strong className="text-white">{selectedTrashIds.size} selected forms</strong> will be completely removed from your account. This action cannot be recovered.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2A3647]">
              <button
                type="button"
                onClick={() => setIsConfirmBulkPermanentOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkPermanentDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedTrashIds.size} Forms Forever</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIRM EMPTY RECYCLE BIN */}
      {isConfirmEmptyTrashOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121820] border border-rose-500/50 rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 border-b border-[#2A3647] pb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-white">Empty Entire Recycle Bin?</h3>
                <p className="text-xs text-slate-400">Permanently delete all {trashForms.length} forms in trash.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete all <strong className="text-white">{trashForms.length} forms</strong> currently in your Recycle Bin.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2A3647]">
              <button
                type="button"
                onClick={() => setIsConfirmEmptyTrashOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  emptyTrash();
                  setSelectedTrashIds(new Set());
                  setIsConfirmEmptyTrashOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Recycle Bin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIGH-PRECISION INTERACTIVE AVATAR CROPPER MODAL */}
      {isCropperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#121820] border border-[#2A3647] rounded-2xl p-5 sm:p-6 space-y-5 relative shadow-2xl text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2A3647] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/40">
                  <Crop className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-white">Adjust &amp; Crop Profile Photo</h3>
                  <p className="text-[11px] text-slate-400">Drag to reposition • Scroll or use slider to zoom</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2332] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewfinder Canvas & Controls Area */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Interactive Viewfinder Box */}
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onWheel={handleWheel}
                className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-2xl bg-[#090D12] border border-[#2A3647] overflow-hidden select-none flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner shrink-0"
              >
                {/* Image layer */}
                <div
                  style={{
                    position: 'absolute',
                    width: `${previewW}px`,
                    height: `${previewH}px`,
                    transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                    transformOrigin: 'center center'
                  }}
                  className="pointer-events-none flex items-center justify-center"
                >
                  <img
                    ref={cropImageRef}
                    src={cropSrc}
                    alt="Crop preview"
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Dark Mask with Circular Viewport cutout */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                  <defs>
                    <mask id="crop-circle-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <circle cx="50%" cy="50%" r="110" fill="black" />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" fill="rgba(6, 9, 14, 0.78)" mask="url(#crop-circle-mask)" />
                  {/* Circular Boundary Ring */}
                  <circle cx="50%" cy="50%" r="110" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 3" className="opacity-80" />
                </svg>

                {/* Pan Overlay Indicator */}
                <div className="absolute top-2.5 left-2.5 z-30 px-2 py-1 rounded bg-black/70 text-[10px] font-mono text-cyan-300 flex items-center gap-1 border border-[#2A3647] pointer-events-none">
                  <Move className="w-3 h-3" /> Drag to pan
                </div>
              </div>

              {/* Adjustments & Toolbar */}
              <div className="space-y-4 w-full flex-1">
                {/* Zoom Controls */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-[#38BDF8]" /> Zoom
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">{Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoom(prev => Math.max(0.2, Number((prev - 0.15).toFixed(2))))}
                      className="p-2 rounded-lg bg-[#161D27] hover:bg-[#1A2332] text-slate-300 border border-[#2A3647] cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <input
                      type="range"
                      min="0.2"
                      max="4.0"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-[#38BDF8] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setZoom(prev => Math.min(4.0, Number((prev + 0.15).toFixed(2))))}
                      className="p-2 rounded-lg bg-[#161D27] hover:bg-[#1A2332] text-slate-300 border border-[#2A3647] cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Fit, Fill & Rotate Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleFit}
                    className="py-2 px-2 rounded-xl bg-[#161D27] hover:bg-[#1A2332] text-xs font-semibold text-slate-200 border border-[#2A3647] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title="Fit entire image within circle"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Fit</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFill}
                    className="py-2 px-2 rounded-xl bg-[#161D27] hover:bg-[#1A2332] text-xs font-semibold text-slate-200 border border-[#2A3647] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title="Fill circle frame"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="py-2 px-2 rounded-xl bg-[#161D27] hover:bg-[#1A2332] text-xs font-semibold text-cyan-300 border border-[#2A3647] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>90°</span>
                  </button>
                </div>

                {/* Reset helper */}
                <button
                  type="button"
                  onClick={handleFit}
                  className="w-full py-1.5 text-center text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Alignment
                </button>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-between pt-3.5 border-t border-[#2A3647]">
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply &amp; Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
