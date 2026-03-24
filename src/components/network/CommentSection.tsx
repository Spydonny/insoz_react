import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getComments, addComment, deleteComment, Comment } from "@/lib/socialApi";
import { useAuth } from "@/hooks/useAuth";

interface CommentSectionProps {
  postId: string;
  onCountChange?: (count: number) => void;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} д назад`;
}

export function CommentSection({ postId, onCountChange }: CommentSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getComments(postId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const comment = await addComment(postId, text.trim());
      const updated = [...comments, comment];
      setComments(updated);
      onCountChange?.(updated.length);
      setText("");
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(postId, commentId);
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      onCountChange?.(updated.length);
    } catch {}
  };

  return (
    <div className="mt-3 border-t border-yellow-100 pt-3">
      {loading ? (
        <p className="text-xs text-gray-400">
          {t("network.loading_comments", "Загрузка...")}
        </p>
      ) : (
        <div className="space-y-2 mb-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-yellow-200 flex items-center justify-center text-xs font-bold text-yellow-800 shrink-0">
                {c.author_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 bg-yellow-50 rounded-xl px-3 py-2 text-sm">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-800 text-xs">
                    {c.author_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                    {user && c.author_id === user._id && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("network.comment_placeholder", "Написать комментарий...")}
          className="flex-1 rounded-xl border border-yellow-400 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-xl text-sm transition-colors"
        >
          {t("network.send", "Отправить")}
        </button>
      </form>
    </div>
  );
}
