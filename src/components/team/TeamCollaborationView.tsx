import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Shield,
  Clock,
  RotateCcw,
  Check,
  Sparkles,
  AlertTriangle,
  Mail,
  Activity,
  ChevronDown,
  Trash2,
  ArrowRightLeft,
  X,
  PlusCircle,
  Lock,
  FileCheck,
  Building2,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { WorkspaceMember, WorkspaceInvite, FormVersion } from '../../types';

export const TeamCollaborationView: React.FC = () => {
  const {
    workspace,
    currentUser,
    invitations,
    activities,
    forms,
    activeFormId,
    activeForm,
    setActiveFormId,
    inviteMember,
    revokeInvite,
    updateMemberRole,
    removeMember,
    transferOwnership,
    createFormVersion,
    restoreFormVersion,
    showToast
  } = useApp();

  // Selected form for version history tab
  const [selectedFormId, setSelectedFormId] = useState<string>(activeFormId || (forms[0]?.id || ''));

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  const [roleChangeMember, setRoleChangeMember] = useState<WorkspaceMember | null>(null);
  const [targetRole, setTargetRole] = useState<'editor' | 'viewer'>('editor');

  const [removalMember, setRemovalMember] = useState<WorkspaceMember | null>(null);
  const [revokeTargetInvite, setRevokeTargetInvite] = useState<WorkspaceInvite | null>(null);

  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);
  const [versionNote, setVersionNote] = useState('');

  const [restoreTargetVersion, setRestoreTargetVersion] = useState<FormVersion | null>(null);

  const currentFormToView = forms.find(f => f.id === selectedFormId) || activeForm || forms[0];
  const otherMembers = workspace.members.filter(m => m.id !== currentUser.id);

  // Invite handler
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsSubmittingInvite(true);
    const success = await inviteMember(inviteEmail, inviteRole, inviteMessage);
    setIsSubmittingInvite(false);
    if (success) {
      setInviteEmail('');
      setInviteMessage('');
      setIsInviteModalOpen(false);
    }
  };

  // Transfer Ownership handler
  const handleConfirmTransfer = async () => {
    if (!transferTargetId) return;
    setIsSubmittingTransfer(true);
    const success = await transferOwnership(transferTargetId);
    setIsSubmittingTransfer(false);
    if (success) {
      setIsTransferModalOpen(false);
      setTransferTargetId('');
    }
  };

  // Role change handler
  const handleConfirmRoleChange = async () => {
    if (!roleChangeMember) return;
    await updateMemberRole(roleChangeMember.id, targetRole);
    setRoleChangeMember(null);
  };

  // Remove member handler
  const handleConfirmRemoval = async () => {
    if (!removalMember) return;
    await removeMember(removalMember.id);
    setRemovalMember(null);
  };

  // Revoke invite handler
  const handleConfirmRevokeInvite = async () => {
    if (!revokeTargetInvite) return;
    await revokeInvite(revokeTargetInvite.id);
    setRevokeTargetInvite(null);
  };

  // Create version handler
  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFormToView) return;
    createFormVersion(currentFormToView.id, versionNote);
    setVersionNote('');
    setIsCreateVersionOpen(false);
  };

  // Restore version handler
  const handleConfirmRestore = () => {
    if (!currentFormToView || !restoreTargetVersion) return;
    restoreFormVersion(currentFormToView.id, restoreTargetVersion.id);
    setRestoreTargetVersion(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-violet-400" />
              <span>{workspace.name}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {workspace.plan} Plan
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">
            Team <span className="gradient-text">Collaboration & Access</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage workspace members, administrative roles, and inspect verified form version snapshots.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow-violet transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Workspace Members & Invitations */}
        <div className="lg:col-span-7 space-y-8">
          {/* Card 1: Workspace Members */}
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">Workspace Members</h3>
                  <span className="text-xs text-slate-400">{workspace.members.length} {workspace.members.length === 1 ? 'member' : 'members'} total</span>
                </div>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-violet-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Invite Member</span>
              </button>
            </div>

            {/* Single Owner Honest Callout */}
            {workspace.members.length === 1 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-cyan-950/20 to-slate-900/40 border border-violet-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Single-Owner Workspace</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Your workspace is currently just you. Invite teammates when you're ready to collaborate on forms, responses, analytics, and workflows.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  Invite Teammate
                </button>
              </div>
            )}

            {/* Members Table */}
            <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20 divide-y divide-white/5">
              {workspace.members.map((member) => {
                const isOwner = member.role === 'owner';
                const isSelf = member.id === currentUser.id;

                return (
                  <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover border border-violet-500/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{member.name}</h4>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      {/* Role & Status */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border tracking-wider ${
                          isOwner
                            ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-glow-violet'
                            : member.role === 'editor'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                        }`}>
                          {member.role}
                        </span>

                        <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active
                        </span>
                      </div>

                      {/* Actions */}
                      {isOwner ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsTransferModalOpen(true)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/30 text-[11px] font-semibold text-slate-300 hover:text-violet-300 transition-all flex items-center gap-1.5"
                            title="Transfer workspace ownership"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-violet-400" />
                            <span>Transfer</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setRoleChangeMember(member);
                              setTargetRole(member.role === 'editor' ? 'viewer' : 'editor');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 transition-colors"
                          >
                            Change Role
                          </button>

                          <button
                            onClick={() => setRemovalMember(member)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                            title="Remove member from workspace"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Pending Invitations */}
          <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">Pending Invitations</h3>
                  <span className="text-xs text-slate-400">Invitations awaiting acceptance</span>
                </div>
              </div>

              {invitations.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {invitations.length} pending
                </span>
              )}
            </div>

            {invitations.length === 0 ? (
              /* Honest Empty Invitations State */
              <div className="p-8 border border-dashed border-white/10 rounded-xl text-center space-y-3 bg-black/10">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-300">No pending invitations</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Invite teammates when you're ready to grant editing or viewing access to Gradient Labs.
                  </p>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite a teammate</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-black/20">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">{inv.email}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Invited by {inv.invitedBy} • {format(new Date(inv.invitedAt), 'MMM dd, HH:mm')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {inv.role}
                      </span>
                      <button
                        onClick={() => setRevokeTargetInvite(inv)}
                        className="text-xs text-red-400 hover:text-red-300 hover:underline font-semibold"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Form Version History & Recent Activity */}
        <div className="lg:col-span-5 space-y-8">
          {/* Card 3: Form Version History */}
          <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">Form Version History</h3>
                  <span className="text-xs text-slate-400">Snapshot revisions & rollbacks</span>
                </div>
              </div>

              <button
                onClick={() => setIsCreateVersionOpen(true)}
                disabled={!currentFormToView}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Save Version</span>
              </button>
            </div>

            {/* Form Selector */}
            {forms.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Select Form:
                </label>
                <select
                  value={selectedFormId}
                  onChange={(e) => {
                    setSelectedFormId(e.target.value);
                    setActiveFormId(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {forms.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.title} ({f.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Versions List or Honest Empty State */}
            {(!currentFormToView || (currentFormToView.versions || []).length === 0) ? (
              <div className="p-8 border border-dashed border-white/10 rounded-xl text-center space-y-3 bg-black/10">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-300">No versions yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Versions will appear here after your form is published or saved as a revision snapshot.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateVersionOpen(true)}
                  disabled={!currentFormToView}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-colors inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create your first version</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {(currentFormToView.versions || []).map((ver) => (
                  <div key={ver.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                        Version #{ver.versionNumber}
                      </span>
                      <button
                        onClick={() => setRestoreTargetVersion(ver)}
                        className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{ver.changesDescription}</p>

                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-white/5">
                      <span>By {ver.authorName}</span>
                      <span>{format(new Date(ver.savedAt), 'MMM dd, yyyy • HH:mm')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Recent Activity */}
          <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white">Recent Activity</h3>
                <span className="text-xs text-slate-400">Workspace audit trail</span>
              </div>
            </div>

            {activities.length === 0 ? (
              /* Honest Empty Activity State */
              <div className="p-8 border border-dashed border-white/10 rounded-xl text-center space-y-3 bg-black/10">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-300">No workspace activity yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Activity will appear here as your team creates, edits, publishes, and collaborates on forms.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 divide-y divide-white/5">
                {activities.map((act) => (
                  <div key={act.id} className="pt-3 first:pt-0 flex items-start gap-3">
                    <img src={act.actorAvatar} alt={act.actorName} className="w-7 h-7 rounded-lg object-cover border border-white/10 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300">
                        <strong className="text-white font-semibold">{act.actorName}</strong> {act.action}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {format(new Date(act.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel border border-violet-500/40 rounded-2xl p-6 space-y-6 relative shadow-glow-violet">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold font-display text-white">Invite Teammate to Workspace</h3>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Workspace Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="editor">Editor — Can build & edit forms, view responses</option>
                  <option value="viewer">Viewer — Read-only response & analytics access</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Optional Note / Message
                </label>
                <textarea
                  rows={2}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Hey, join Gradient Labs to collaborate on our upcoming feedback forms!"
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvite || !inviteEmail.trim()}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-colors disabled:opacity-50"
                >
                  {isSubmittingInvite ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Transfer Ownership Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel border border-violet-500/40 rounded-2xl p-6 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold font-display text-white">Transfer Workspace Ownership</h3>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {otherMembers.length === 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>No Teammates Available</strong>
                    <p className="mt-1 text-slate-300">
                      Ownership can only be transferred to an existing workspace member. Please invite a member first.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsTransferModalOpen(false);
                      setIsInviteModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold"
                  >
                    Invite Member
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    You are transferring ownership of <strong>{workspace.name}</strong>. You will step down as Owner and become an <strong>EDITOR</strong>.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Select New Workspace Owner:
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {otherMembers.map((m) => (
                      <label
                        key={m.id}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          transferTargetId === m.id
                            ? 'bg-violet-500/20 border-violet-500/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="transferMember"
                            value={m.id}
                            checked={transferTargetId === m.id}
                            onChange={() => setTransferTargetId(m.id)}
                            className="accent-violet-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-white">{m.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{m.email}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">{m.role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmTransfer}
                    disabled={isSubmittingTransfer || !transferTargetId}
                    className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-colors disabled:opacity-50"
                  >
                    {isSubmittingTransfer ? 'Transferring...' : 'Confirm Ownership Transfer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Role Change Confirmation Modal */}
      {roleChangeMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel border border-cyan-500/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Change Role for {roleChangeMember.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Change role from <strong className="uppercase text-cyan-400">{roleChangeMember.role}</strong> → <strong className="uppercase text-cyan-400">{targetRole}</strong>?
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400">
              {targetRole === 'viewer' ? (
                <span>⚠️ This will remove form editing and theme customization permissions.</span>
              ) : (
                <span>✨ This will grant full form editing, question management, and theme creation permissions.</span>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRoleChangeMember(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
              >
                Confirm Role Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Remove Member Confirmation Modal */}
      {removalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel border border-red-500/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Remove {removalMember.name}?</h3>
            <p className="text-xs text-slate-300">
              They will immediately lose access to the <strong>{workspace.name}</strong> workspace and its forms.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRemovalMember(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemoval}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Revoke Invite Modal */}
      {revokeTargetInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel border border-red-500/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Revoke Invitation?</h3>
            <p className="text-xs text-slate-300">
              Cancel invitation sent to <strong className="font-mono text-white">{revokeTargetInvite.email}</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRevokeTargetInvite(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevokeInvite}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Revoke Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Create Version Snapshot Modal */}
      {isCreateVersionOpen && currentFormToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel border border-cyan-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Create Version Snapshot</h3>
              <button onClick={() => setIsCreateVersionOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Save a revision snapshot for <strong>"{currentFormToView.title}"</strong>.
            </p>

            <form onSubmit={handleCreateVersion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Change Notes / Revision Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                  placeholder="e.g. Added CS304 lab evaluation questions and updated quiz scoring rules."
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateVersionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!versionNote.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Save Version Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Restore Version Modal */}
      {restoreTargetVersion && currentFormToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel border border-cyan-500/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Restore Version #{restoreTargetVersion.versionNumber}?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Restoring Version #{restoreTargetVersion.versionNumber} will revert <strong>"{currentFormToView.title}"</strong> to this saved snapshot.
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 font-mono">
              Note: {restoreTargetVersion.changesDescription}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRestoreTargetVersion(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
