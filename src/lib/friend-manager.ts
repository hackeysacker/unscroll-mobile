/**
 * Friend Management System
 * Handles friend requests, connections, and social interactions
 */

import { supabase } from './supabase';

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  displayName: string;
  avatar?: string;
  level: number;
  streak: number;
  totalXp: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

/**
 * Send friend request
 */
export async function sendFriendRequest(
  fromUserId: string,
  toUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if request already exists
    const { data: existing, error: checkError } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      return { success: false, error: 'Friend request already exists' };
    }

    // Create friend request
    const { error } = await supabase.from('friends').insert({
      user_id: fromUserId,
      friend_id: toUserId,
      status: 'pending',
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(
  userId: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('friend_id', userId); // Only the recipient can accept

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(
  userId: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete the request
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId)
      .eq('friend_id', userId); // Only the recipient can reject

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting friend request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove friend
 */
export async function removeFriend(
  userId: string,
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`); // Either party can remove

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error removing friend:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get friends list
 */
export async function getFriends(userId: string): Promise<Friend[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_friends', {
      p_user_id: userId,
    });

    if (error) throw error;

    return (data || []).map((friend: any) => ({
      id: friend.friendship_id,
      userId: friend.user_id,
      friendId: friend.friend_id,
      displayName: friend.display_name || friend.email?.split('@')[0] || 'Friend',
      avatar: friend.avatar_emoji,
      level: friend.level || 1,
      streak: friend.streak || 0,
      totalXp: friend.total_xp || 0,
      status: friend.status,
      createdAt: new Date(friend.created_at),
      updatedAt: new Date(friend.updated_at),
    }));
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
}

/**
 * Get pending friend requests (received)
 */
export async function getPendingRequests(userId: string): Promise<FriendRequest[]> {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        sender:user_id (
          email,
          display_name,
          avatar_emoji
        )
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    return (data || []).map((req: any) => ({
      id: req.id,
      fromUserId: req.user_id,
      toUserId: req.friend_id,
      fromUserName: req.sender?.display_name || req.sender?.email?.split('@')[0] || 'Someone',
      fromUserAvatar: req.sender?.avatar_emoji,
      status: req.status,
      createdAt: new Date(req.created_at),
    }));
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
}

/**
 * Get sent friend requests
 */
export async function getSentRequests(userId: string): Promise<FriendRequest[]> {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        recipient:friend_id (
          email,
          display_name,
          avatar_emoji
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    return (data || []).map((req: any) => ({
      id: req.id,
      fromUserId: req.user_id,
      toUserId: req.friend_id,
      fromUserName: req.recipient?.display_name || req.recipient?.email?.split('@')[0] || 'Someone',
      fromUserAvatar: req.recipient?.avatar_emoji,
      status: req.status,
      createdAt: new Date(req.created_at),
    }));
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    return [];
  }
}

/**
 * Search for users by email or display name
 */
export async function searchUsers(
  query: string,
  currentUserId: string,
  limit: number = 20
): Promise<{
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  level: number;
  streak: number;
}[]> {
  try {
    const { data, error } = await supabase.rpc('search_users', {
      p_query: query,
      p_current_user_id: currentUserId,
      p_limit: limit,
    });

    if (error) throw error;

    return (data || []).map((user: any) => ({
      id: user.user_id,
      displayName: user.display_name || user.email?.split('@')[0] || 'User',
      email: user.email,
      avatar: user.avatar_emoji,
      level: user.level || 1,
      streak: user.streak || 0,
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

/**
 * Block user
 */
export async function blockUser(
  userId: string,
  blockUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update or create friendship with blocked status
    const { error } = await supabase.from('friends').upsert({
      user_id: userId,
      friend_id: blockUserId,
      status: 'blocked',
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error blocking user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Unblock user
 */
export async function unblockUser(
  userId: string,
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId)
      .eq('user_id', userId)
      .eq('status', 'blocked');

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error unblocking user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get friend count
 */
export async function getFriendCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('friends')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error getting friend count:', error);
    return 0;
  }
}
