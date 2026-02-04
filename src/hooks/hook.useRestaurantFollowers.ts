// src/hooks/hook.useRestaurantFollowers.ts
// Provides React Query hooks for managing restaurant followers.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRestaurantFollowers,
  removeRestaurantFollower,
  revokeFollowerInvite,
  resendFollowerInvite,
} from '@/svc/svc.followers';
import { createFollowerInvite } from '@/svc/svc.invites';
import type { CreateInviteInput } from '@/domain/dom.invites.zod';

// Query Keys for follower data
export const followerQueryKeys = {
  all: ['followers'] as const,
  lists: () => [...followerQueryKeys.all, 'list'] as const,
  list: (restaurantId: string) => [...followerQueryKeys.lists(), restaurantId] as const,
};

// Hook to fetch restaurant followers
export const useRestaurantFollowers = (
  params: { restaurant_id: string; limit: number; offset: number },
  requesterId: string
) => {
  return useQuery({
    queryKey: followerQueryKeys.list(params.restaurant_id),
    queryFn: () => getRestaurantFollowers(params, requesterId),
    enabled: !!params.restaurant_id && !!requesterId,
  });
};

// Hook to create a new follower invite
export const useCreateFollowerInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { request: CreateInviteInput; inviterId: string }) =>
      createFollowerInvite(variables.request, variables.inviterId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: followerQueryKeys.list(variables.request.restaurant_id),
      });
    },
  });
};

// Hook to remove a restaurant follower
export const useRemoveRestaurantFollower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { inviteId: string; requesterId: string; restaurantId: string }) =>
      removeRestaurantFollower(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: followerQueryKeys.list(variables.restaurantId),
      });
    },
  });
};

// Hook to revoke a follower invite
export const useRevokeFollowerInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { inviteId: string; requesterId: string; restaurantId: string }) =>
      revokeFollowerInvite(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: followerQueryKeys.list(variables.restaurantId),
      });
    },
  });
};

// Hook to resend a follower invite
export const useResendFollowerInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { inviteId: string; requesterId: string; restaurantId: string }) =>
      resendFollowerInvite(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: followerQueryKeys.list(variables.restaurantId),
      });
    },
  });
};
