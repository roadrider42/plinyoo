// src/hooks/hook.useInvites.ts
// Zweck: Stellt einen React Query Hook zur Verfügung, um Einladungen zu erstellen.
// HINWEIS: Diese Datei wurde im Rahmen eines Refactorings erstellt, um die UI-Logik zu kapseln.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFollowerInvite } from '@/svc/svc.invites';
import type { CreateInviteInput } from '@/domain/dom.invites.zod';

/**
 * React Query Mutation Hook zum Erstellen einer neuen Follower-Einladung.
 * Kapselt den Aufruf des `createFollowerInvite` Service und die anschließende
 * Invalidierung des Caches, um die Follower-Liste zu aktualisieren.
 * @returns - Ein `useMutation` Objekt für die Verwendung in UI-Komponenten.
 */
export const useCreateFollowerInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Die Funktion, die bei der Mutation ausgeführt wird.
    mutationFn: (variables: { request: CreateInviteInput; inviterId: string }) =>
      createFollowerInvite(variables.request, variables.inviterId),
    
    // Wird nach einer erfolgreichen Mutation ausgeführt.
    onSuccess: (_, variables) => {
      // Invalidiert die Abfragen, die mit der Follower-Liste zusammenhängen,
      // um ein Neuladen der Daten auszulösen.
      queryClient.invalidateQueries({
        queryKey: ['followers', variables.request.restaurant_id],
      });
    },
  });
};
