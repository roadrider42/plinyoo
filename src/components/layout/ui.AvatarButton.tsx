// src/components/layout/ui.AvatarButton.tsx
// Zweck: Avatar-Button mit Profil-Modal-Integration
// Verantwortlichkeiten: Avatar anzeigen, Profil-Modal öffnen
// Anti-Beispiele: Keine Geschäftslogik, keine direkten API-Aufrufe

import React, { useState } from 'react';
import { useAuth } from '@/hooks/hook.useAuth';
import { useProfile } from '../../hooks/hook.useProfile';
import { ProfileSettingsModal } from '../ui.ProfileSettingsModal';
import { ProfileTabType } from '../../types/dom.profile.types';
import '../../styles/avatar-button.css';

/**
 * Avatar-Button mit Profil-Modal-Integration
 * 
 * @example
 * ```tsx
 * <AvatarButton />
 * ```
 */
export function AvatarButton(): React.ReactElement {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Avatar-Button-Klick öffnet direkt das Profil-Modal
  const handleAvatarClick = () => {
    setIsProfileMenuOpen(true);
  };

  return (
    <>
      <button
        className="avatar-button"
        onClick={handleAvatarClick}
        aria-label="Profil-Menü öffnen"
        data-testid="avatar-button"
      >
        <div className="avatar-image">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name || 'Profilbild'} />
          ) : (
            <div className="avatar-placeholder">
              {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      </button>

      {/* Profil-Modal */}
      <ProfileSettingsModal
        isOpen={isProfileMenuOpen}  
        onClose={() => setIsProfileMenuOpen(false)}
        initialTab={ProfileTabType.PROFILE}
      />
    </>
  );
}
