import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, MessageCircle, CheckCircle2 } from 'lucide-react';
import type { Screen, SocialPost, SocialUser, SocialComment } from '../../../shared/data/mockData';
import { socialPosts, socialUsers, chatContacts } from '../../../shared/data/mockData';
import { FeedTab } from '../components/FeedTab';
import { DiscoverTab } from '../components/DiscoverTab';
import { MessagesTab } from '../components/MessagesTab';
import { CommentSheet } from '../components/CommentSheet';
import { ShareSheet } from '../components/ShareSheet';
import { UserProfileSheet } from '../components/UserProfileSheet';
import { PaymentSheet } from '../components/PaymentSheet';

interface SocialScreenProps {
  navigate: (s: Screen) => void;
}

interface SentPayment {
  contactId: string;
  amount: string;
  asset: string;
  time: string;
}

export function SocialScreen({ navigate }: SocialScreenProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'messages'>('feed');
  const [posts, setPosts] = useState<SocialPost[]>(socialPosts);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(['p2']));
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [allComments, setAllComments] = useState<Record<string, SocialComment[]>>({});

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentPost, setCommentPost] = useState<SocialPost | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePost, setSharePost] = useState<SocialPost | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<SocialUser | null>(null);

  const [showPayment, setShowPayment] = useState(false);
  const [paymentContact, setPaymentContact] = useState<typeof chatContacts[0] | null>(null);
  const [sentPayments, setSentPayments] = useState<SentPayment[]>([]);
  const [toast, setToast] = useState('');

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2800); };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const openComments = (postId: string) => {
    const post = posts.find(p => p.id === postId) ?? null;
    setCommentPost(post);
    setCommentOpen(true);
  };

  const addComment = (text: string) => {
    if (!commentPost) return;
    const newComment: SocialComment = {
      id: 'c-' + Date.now(),
      postId: commentPost.id,
      user: { name: 'You', username: 'you', initials: 'U', color: 'var(--foreground)' },
      text,
      time: 'now',
      likes: 0,
      liked: false,
    };
    setAllComments(prev => ({
      ...prev,
      [commentPost.id]: [...(prev[commentPost.id] ?? commentPost.commentList), newComment],
    }));
    setCommentCounts(prev => ({ ...prev, [commentPost.id]: (prev[commentPost.id] ?? commentPost.comments) + 1 }));
  };

  const likeComment = (commentId: string) => {
    if (!commentPost) return;
    setAllComments(prev => {
      const list = prev[commentPost.id] ?? commentPost.commentList;
      return {
        ...prev,
        [commentPost.id]: list.map(c =>
          c.id === commentId
            ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
            : c
        ),
      };
    });
  };

  const openShare = (postId: string) => {
    const post = posts.find(p => p.id === postId) ?? null;
    setSharePost(post);
    setShareOpen(true);
  };

  const openUserProfile = (user: SocialUser) => {
    setProfileUser(user);
    setProfileOpen(true);
  };

  const toggleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
        showToast('Unfollowed');
      } else {
        next.add(userId);
        showToast('Following');
      }
      return next;
    });
  };

  const isFollowing = (userId: string) => followedUsers.has(userId);

  const openPayment = (contact: typeof chatContacts[0]) => {
    setPaymentContact(contact);
    setShowPayment(true);
  };

  const sendPayment = (amount: string, assetSymbol: string) => {
    if (!paymentContact) return;
    setSentPayments(prev => [
      ...prev,
      {
        contactId: paymentContact.id,
        amount,
        asset: assetSymbol,
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    showToast(`Sent ${amount} ${assetSymbol} to ${paymentContact.name}`);
    setShowPayment(false);
  };

  const handlers = {
    onLike: toggleLike,
    onComment: openComments,
    onShare: openShare,
    onUserProfile: openUserProfile,
    onFollow: toggleFollow,
    isFollowing,
  };

  const currentComments = commentPost
    ? allComments[commentPost.id] ?? commentPost.commentList
    : [];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center justify-between px-5 mb-4">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Community</h2>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('notifications')}
            className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card"
            style={{ border: '1px solid var(--border)' }}
          >
            <Bell size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('chat')}
            className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card"
            style={{ border: '1px solid var(--border)' }}
          >
            <MessageCircle size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="flex gap-1 p-1 rounded-[14px] glass-card" style={{ border: '1px solid var(--border)' }}>
          {(['feed', 'discover', 'messages'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-[10px] capitalize"
              style={{
                background: activeTab === tab ? 'var(--card)' : 'transparent',
                color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'feed' && (
        <FeedTab
          posts={posts}
          handlers={handlers}
          likedPosts={likedPosts}
          commentCounts={commentCounts}
          onStoryClick={() => {}}
        />
      )}

      {activeTab === 'discover' && (
        <DiscoverTab
          users={socialUsers}
          onFollow={toggleFollow}
          isFollowing={isFollowing}
          onUserProfile={openUserProfile}
        />
      )}

      {activeTab === 'messages' && (
        <MessagesTab
          navigate={navigate}
          onOpenPayment={openPayment}
          onOpenProfile={(contact) => {
            const su = socialUsers.find(u => u.username === contact.username) ?? socialUsers[0];
            openUserProfile(su);
          }}
          sentPayments={sentPayments}
        />
      )}

      <div style={{ height: 100 }} />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="absolute bottom-24 left-1/2 z-[60] px-4 py-3 rounded-[14px] flex items-center gap-2"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <CheckCircle2 size={16} style={{ color: 'var(--positive)' }} />
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CommentSheet
        open={commentOpen}
        post={commentPost}
        comments={currentComments}
        onClose={() => setCommentOpen(false)}
        onAddComment={addComment}
        onLikeComment={likeComment}
      />

      <ShareSheet
        open={shareOpen}
        post={sharePost}
        onClose={() => setShareOpen(false)}
        onToast={showToast}
      />

      <UserProfileSheet
        open={profileOpen}
        user={profileUser}
        posts={posts}
        onClose={() => setProfileOpen(false)}
        isFollowing={profileUser ? isFollowing(profileUser.id) : false}
        onFollow={() => profileUser && toggleFollow(profileUser.id)}
        onLike={toggleLike}
        onComment={openComments}
        onShare={openShare}
        onUserProfile={openUserProfile}
      />

      <PaymentSheet
        open={showPayment}
        contact={paymentContact}
        onClose={() => setShowPayment(false)}
        onSend={sendPayment}
      />
    </div>
  );
}
