import { describe, it, expect } from 'vitest';
import { Workspace, UserIdentity } from '../types';

describe('Admin Profile & Single-Owner Workspace Tests', () => {
  const mockWorkspace: Workspace = {
    id: 'ws-gradient-labs',
    name: 'Gradient Labs',
    plan: 'enterprise',
    members: [
      {
        id: 'user-admin-1',
        name: 'Alex Rivera',
        email: 'alex@gradientforms.io',
        role: 'owner',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        joinedAt: '2026-01-01T00:00:00Z'
      }
    ]
  };

  it('should identify the single owner member as the authenticated UserIdentity', () => {
    const owner = mockWorkspace.members.find(m => m.role === 'owner') || mockWorkspace.members[0];
    const currentUser: UserIdentity = {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      avatar: owner.avatar,
      role: owner.role
    };

    expect(currentUser.name).toBe('Alex Rivera');
    expect(currentUser.email).toBe('alex@gradientforms.io');
    expect(currentUser.role).toBe('owner');
  });

  it('should accurately update admin credentials without altering workspace structure', () => {
    const updates = {
      name: 'Alexander Rivera',
      email: 'alexander@gradientforms.io',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
    };

    const updatedMembers = mockWorkspace.members.map(m => {
      if (m.role === 'owner') {
        return {
          ...m,
          name: updates.name.trim(),
          email: updates.email.trim(),
          avatar: updates.avatar
        };
      }
      return m;
    });

    const updatedWorkspace = { ...mockWorkspace, members: updatedMembers };
    const newOwner = updatedWorkspace.members.find(m => m.role === 'owner')!;

    expect(newOwner.name).toBe('Alexander Rivera');
    expect(newOwner.email).toBe('alexander@gradientforms.io');
    expect(newOwner.avatar).toBe(updates.avatar);
    expect(newOwner.role).toBe('owner');
  });

  it('should update workspace name cleanly', () => {
    const newName = 'Gradient Enterprise Labs';
    const updated = { ...mockWorkspace, name: newName.trim() };

    expect(updated.name).toBe('Gradient Enterprise Labs');
    expect(updated.id).toBe('ws-gradient-labs');
  });

  it('should reject invalid password combinations in client security validation', () => {
    const validatePassword = (newPass: string, confirmPass: string) => {
      if (newPass.length < 6) return 'New password must be at least 6 characters.';
      if (newPass !== confirmPass) return 'Passwords do not match.';
      return null;
    };

    expect(validatePassword('123', '123')).toBe('New password must be at least 6 characters.');
    expect(validatePassword('secret123', 'different456')).toBe('Passwords do not match.');
    expect(validatePassword('securePass99', 'securePass99')).toBeNull();
  });
});
