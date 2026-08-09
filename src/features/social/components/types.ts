import type { SocialPost, SocialUser, SocialComment, Screen } from '../../../shared/data/mockData';

export interface SocialHandlers {
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onUserProfile: (user: SocialUser) => void;
  onFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
}

export interface PostCardProps {
  post: SocialPost;
  index: number;
  handlers: SocialHandlers;
  liked: boolean;
  likeCount: number;
  commentCount: number;
}

export interface CommentSheetProps {
  open: boolean;
  post: SocialPost | null;
  comments: SocialComment[];
  onClose: () => void;
  onAddComment: (text: string) => void;
  onLikeComment: (commentId: string) => void;
}

export interface ShareSheetProps {
  open: boolean;
  post: SocialPost | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export interface UserProfileSheetProps {
  open: boolean;
  user: SocialUser | null;
  posts: SocialPost[];
  onClose: () => void;
  isFollowing: boolean;
  onFollow: () => void;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onUserProfile: (user: SocialUser) => void;
}

export interface StoriesProps {
  onStoryClick: (index: number) => void;
}

export interface TrendingTagsProps {
  tags: string[];
  onTagClick: (tag: string) => void;
}

export interface FeedTabProps {
  posts: SocialPost[];
  handlers: SocialHandlers;
  likedPosts: Set<string>;
  commentCounts: Record<string, number>;
  onStoryClick: (index: number) => void;
}

export interface DiscoverTabProps {
  users: SocialUser[];
  onFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  onUserProfile: (user: SocialUser) => void;
}

export interface MessagesTabProps {
  navigate: (s: Screen) => void;
  onOpenPayment: (contact: typeof import('../../../shared/data/mockData').chatContacts[number]) => void;
  onOpenProfile: (contact: typeof import('../../../shared/data/mockData').chatContacts[number]) => void;
  sentPayments: { contactId: string; amount: string; asset: string; time: string }[];
}

export interface PaymentSheetProps {
  open: boolean;
  contact: typeof import('../../../shared/data/mockData').chatContacts[number] | null;
  onClose: () => void;
  onSend: (amount: string, assetSymbol: string) => void;
}

export { type SocialPost, type SocialUser, type SocialComment };
