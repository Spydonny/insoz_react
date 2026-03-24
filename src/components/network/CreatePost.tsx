import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createPost, Post } from "@/lib/socialApi";

interface CreatePostProps {
  onCreated: (post: Post) => void;
}

export function CreatePost({ onCreated }: CreatePostProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const post = await createPost(content.trim());
      onCreated(post);
      setContent("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-yellow-50 border border-yellow-400 rounded-2xl p-4 mb-6"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("network.create_placeholder", "Share updates or progress...")}
        className="w-full resize-none rounded-xl border border-yellow-400 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[80px]"
        maxLength={2000}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400">{content.length}/2000</span>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
        >
          {loading
            ? t("network.publishing", "Publishing...")
            : t("network.publish", "Publish")}
        </button>
      </div>
    </form>
  );
}
