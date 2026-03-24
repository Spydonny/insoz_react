import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { PostCard } from "@/components/network/PostCard";
import { getPosts, Post } from "@/lib/socialApi";

export default function Network() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const LIMIT = 20;

  const fetchPosts = useCallback(
    async (reset = false) => {
      setLoading(true);
      setError(null);
      try {
        const currentSkip = reset ? 0 : skip;
        const data = await getPosts(currentSkip, LIMIT);
        if (reset) {
          setPosts(data);
          setSkip(data.length);
        } else {
          setPosts((prev) => [...prev, ...data]);
          setSkip((s) => s + data.length);
        }
        setHasMore(data.length === LIMIT);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [skip]
  );

  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleted = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <p className="text-sm text-gray-400 mb-5">
        {t("network.subtitle", "Делитесь результатами и вдохновляйте других")}
      </p>
      {error && (
        <div className="text-red-500 text-sm text-center py-4">{error}</div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p>{t("network.empty", "Пока нет публикаций. Будьте первым!")}</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDeleted={handleDeleted} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && hasMore && posts.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchPosts(false)}
            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium underline"
          >
            {t("network.load_more", "Загрузить ещё")}
          </button>
        </div>
      )}
    </div>
  );
}
