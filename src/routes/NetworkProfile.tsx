import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreatePost } from "@/components/network/CreatePost";
import { PostCard } from "@/components/network/PostCard";
import { getUserProfile, getUserProfilePosts, UserProfile, Post } from "@/lib/socialApi";
import { useAuth } from "@/hooks/useAuth";

export default function NetworkProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOwnProfile = Boolean(user && id && user.uuid === id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([getUserProfile(id), getUserProfilePosts(id)])
      .then(([prof, userPosts]) => {
        setProfile(prof);
        setPosts(userPosts);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setProfile((prev) =>
      prev ? { ...prev, posts_count: prev.posts_count + 1 } : prev
    );
  };

  const handleDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setProfile((prev) =>
      prev ? { ...prev, posts_count: Math.max(0, prev.posts_count - 1) } : prev
    );
  };

  return (
    <div>
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-8">{error}</div>
      )}

      {profile && !loading && (
        <>
          {/* Profile card */}
          <div className="flex items-center gap-4 bg-yellow-50 rounded-2xl p-5 mb-6 border border-yellow-100">
            <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center text-2xl font-bold text-yellow-800 shrink-0">
              {profile.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{profile.full_name}</h2>
              <p className="text-sm text-gray-500">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
              )}
              <p className="text-xs text-yellow-600 mt-1 font-medium">
                {profile.posts_count} {t("network.posts_count", "posts")}
              </p>
            </div>
          </div>

          {/* Posts */}
          <h3 className="text-base font-semibold text-gray-600 mb-4">
            {t("network.user_posts", "Posts")}
          </h3>

          {isOwnProfile && <CreatePost onCreated={handleCreated} />}

          {posts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>{t("network.no_posts", "No posts yet")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onDeleted={handleDeleted} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
