import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
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
  Lock,
  Sparkles
} from 'lucide-react';
import { IntegrationDetailModal, IntegrationType } from '../integrations/IntegrationDetailModal';
import {
  GoogleSheetsCard,
  GoogleDriveCard,
  ResendEmailCard,
  SlackAlertsCard,
  ZapierCard,
  WebhookCard
} from '../cards/IntegrationVisualCards';

const PRESET_AVATARS = [
  { id: 'av-1', name: 'Alex', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-2', name: 'Elena', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-3', name: 'David', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-4', name: 'Sarah', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-5', name: 'Marcus', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
  { id: 'av-6', name: 'Aaliyah', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80' },
];

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    workspace,
    forms,
    updateUserProfile,
    updateWorkspaceName,
    showToast,
    setActiveView,
    activeView
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Settings Tab state (profile or integrations)
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations'>(
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

  // Profile Edit fields
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0].url);
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

  // Cropper Modal State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string>('');
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
    if (currentUser.avatar) {
      setEditAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  // Sync workspace state
  useEffect(() => {
    setEditWorkspaceName(workspace.name);
  }, [workspace.name]);

  // Handle local PFP Image File Upload -> Opens Interactive Cropper Modal
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
        setCropSrc(reader.result);
        setZoom(1.0);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOpenCropperForCurrent = () => {
    if (!editAvatar) return;
    setCropSrc(editAvatar);
    setZoom(1.0);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setIsCropperOpen(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const minDimension = Math.min(img.width, img.height);
      const baseScale = size / minDimension;
      const finalScale = baseScale * zoom;

      ctx.scale(finalScale, finalScale);

      const drawX = -img.width / 2 + offset.x / finalScale;
      const drawY = -img.height / 2 + offset.y / finalScale;

      ctx.drawImage(img, drawX, drawY);
      ctx.restore();

      const croppedDataUrl = canvas.toDataURL('image/png');
      setEditAvatar(croppedDataUrl);
      setIsCropperOpen(false);

      showToast('Profile Picture Cropped ✂️', 'Click "Save Changes" to apply.', 'info');
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
            Manage single-owner identity, active workspace, and system integrations.
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2A3647]/70 pb-3">
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
                  <div className="relative shrink-0">
                    <img
                      src={currentUser.avatar || PRESET_AVATARS[0].url}
                      alt={currentUser.name}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#2A3647]"
                    />
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

                <button
                  type="button"
                  onClick={() => {
                    setEditName(currentUser.name);
                    setEditEmail(currentUser.email);
                    setEditAvatar(currentUser.avatar || PRESET_AVATARS[0].url);
                    setIsEditProfileOpen(true);
                  }}
                  className="self-start sm:self-center px-4 py-2 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] hover:border-[#38BDF8]/60 text-slate-200 hover:text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Edit Profile</span>
                </button>
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
      </div>

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
              <div className="space-y-3 p-3.5 rounded-xl bg-[#161D27] border border-[#2A3647]/60">
                <label className="block text-xs font-semibold text-slate-300">
                  Profile Picture
                </label>

                <div className="flex items-center gap-4">
                  <img
                    src={editAvatar}
                    alt={editName}
                    className="w-14 h-14 rounded-xl object-cover border border-[#2A3647]"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Upload</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenCropperForCurrent}
                      className="px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Crop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-3 py-1.5 rounded-lg bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{showUrlInput ? 'Hide URL' : 'URL Link'}</span>
                    </button>
                  </div>
                </div>

                {showUrlInput && (
                  <div className="pt-1">
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full bg-[#121820] border border-[#2A3647] px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                )}

                {/* Preset Avatars */}
                <div className="pt-1 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block">Preset Avatars:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.url)}
                        className={`p-0.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                          editAvatar === av.url
                            ? 'border-[#38BDF8] ring-1 ring-[#38BDF8]/40'
                            : 'border-[#2A3647] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={av.url} alt={av.name} className="w-7 h-7 rounded-md object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
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
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold font-heading text-white">Change Admin Password</h3>
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
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  {passwordError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#161D27] border border-[#2A3647] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">New Password</label>
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
                <label className="block text-xs font-semibold text-slate-300">Confirm New Password</label>
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

      {/* INTERACTIVE AVATAR CROPPER MODAL */}
      {isCropperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#121820] border border-[#2A3647] rounded-2xl p-6 space-y-6 relative shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-[#2A3647] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/40">
                  <Crop className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-white">Resize &amp; Crop Profile Photo</h3>
                  <p className="text-[11px] text-slate-400">Drag to reposition, zoom in/out, or rotate avatar.</p>
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

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-72 h-72 rounded-2xl bg-black/50 border border-[#2A3647] overflow-hidden select-none flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner">
                <div className="absolute inset-0 z-20 pointer-events-none border-[36px] border-black/70 rounded-3xl flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-cyan-400/80" />
                </div>

                <div className="absolute top-2 left-2 z-30 px-2 py-1 rounded bg-black/60 text-[10px] font-mono text-cyan-300 flex items-center gap-1 border border-[#2A3647]">
                  <Move className="w-3 h-3" /> Drag to pan
                </div>

                <div
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img
                    src={cropSrc}
                    alt="Crop workspace"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                    draggable={false}
                  />
                </div>
              </div>

              <div className="space-y-4 w-full flex-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Zoom</span>
                    <span className="font-mono text-cyan-400">{Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                      className="p-2 rounded-lg bg-[#161D27] hover:bg-[#1A2332] text-slate-300 border border-[#2A3647] cursor-pointer"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                      className="p-2 rounded-lg bg-[#161D27] hover:bg-[#1A2332] text-slate-300 border border-[#2A3647] cursor-pointer"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Rotation</span>
                    <span className="font-mono text-cyan-400">{rotation}°</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="w-full py-2 rounded-xl bg-[#161D27] hover:bg-[#1A2332] text-xs font-semibold text-cyan-300 border border-[#2A3647] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2A3647]">
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
                <Check className="w-4 h-4" /> Apply &amp; Use Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
