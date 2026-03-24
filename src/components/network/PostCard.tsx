import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { likePost, deletePost, Post } from "@/lib/socialApi";
import { useAuth } from "@/hooks/useAuth";
import { CommentSection } from "./CommentSection";
import { FiHeart, FiMessageCircle } from "react-icons/fi";

interface PostCardProps {
  post: Post;
  onDeleted?: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} д назад`;
}

export function PostCard({ post, onDeleted }: PostCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const isLiked = user ? currentPost.likes.includes(user.uuid) : false;
  const isOwner = user?.uuid === currentPost.author_id;

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      const updated = await likePost(currentPost.id);
      setCurrentPost(updated);
    } catch {
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("network.confirm_delete", "Удалить пост?"))) return;
    try {
      await deletePost(currentPost.id);
      onDeleted?.(currentPost.id);
    } catch {}
  };

  return (
    <div className="bg-white border border-yellow-100 rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <button
          onClick={() => navigate(`/network/profile/${currentPost.author_id}`)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-yellow-200 flex items-center justify-center text-sm font-bold text-yellow-800">
            {currentPost.author_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-800">
              {currentPost.author_name}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(currentPost.created_at)}</p>
          </div>
        </button>

        {isOwner && (
          <button
            onClick={handleDelete}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            {t("network.delete", "Удалить")}
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-3">
        {currentPost.content}
      </p>

      {currentPost.image_url && (
        <img
          src={currentPost.image_url}
          alt="post"
          className="w-full rounded-xl mb-3 max-h-64 object-cover"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={handleLike}
          disabled={liking || !user}
          className={`flex items-center gap-1 transition-colors ${
            isLiked
              ? "text-yellow-500 font-semibold"
              : "text-gray-400 hover:text-yellow-500"
          }`}
        >
          <FiHeart className={isLiked ? "fill-yellow-500 text-yellow-500" : ""} />
          <span>{currentPost.likes_count}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1 text-gray-400 hover:text-yellow-500 transition-colors"
        >
          <FiMessageCircle />
          <span>{currentPost.comments_count}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          postId={currentPost.id}
          onCountChange={(count) =>
            setCurrentPost((p) => ({ ...p, comments_count: count }))
          }
        />
      )}
    </div>
  );
}
