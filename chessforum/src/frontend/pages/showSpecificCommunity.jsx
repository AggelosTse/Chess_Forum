import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { PostsDisplay } from "../components/postsDisplay.jsx";

export function ShowCommunity() {
  const [postsList, setPostsList] = useState([]);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const navig = useNavigate();

  const location = useLocation();
  const community_id = location.state?.community_id;

  const limit = 10;

  async function fetchPosts(pageNum) {
    try {

      if (fetchingRef.current || !hasMoreRef.current) return;

      fetchingRef.current = true;
      setLoading(true);

      const response = await fetch(
        `http://localhost:8001/getSpecificCommunityPosts?community_id=${community_id}&page=${pageNum}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        if (data.length === 0) {
          hasMoreRef.current = false;
          setHasMore(false);
          return;
        }
        else {
          setPostsList((prevPosts) => {
            //filter out posts that are already present in prevPosts
            const existingIds = new Set(prevPosts.map((p) => p.id || p.post_id));
            const newPosts = data.filter((p) => !existingIds.has(p.id || p.post_id));

            return [...prevPosts, ...newPosts];
          });
        }
      }
    } catch (error) {

    } finally {
      setLoading(false);
      if (hasMoreRef.current) {
        fetchingRef.current = false;
      }
    }

  }
  useEffect(() => {
    if (hasMoreRef.current) {
      fetchPosts(page);

    }
  }, [page, community_id]);

  useEffect(() => {
    function handleScroll() {
      // Hard exit if already fetching or if out of posts
      if (fetchingRef.current || !hasMoreRef.current) return;

      const windowHeight = window.innerHeight;
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;

      // Trigger 150px before reaching absolute bottom
      if (windowHeight + scrollTop >= scrollHeight - 150) {
        setPage((prev) => prev + 1);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <button
        onClick={() =>
          navig("/createPost", {
            state: {
              specificCommunity: true,
              community_id: community_id,
            },
          })
        }
      >
        create post
      </button>
      <PostsDisplay postsList={postsList} setPostsList={setPostsList} specificCommunity={true} />

      <div style={{ minHeight: "60px", textAlign: "center", padding: "10px" }}>
        {loading && <p>Loading...</p>}
        {!hasMore && <p>No more Posts Exist</p>}
      </div>
    </div>
  );
}
