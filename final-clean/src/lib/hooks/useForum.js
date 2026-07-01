'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export function useForum() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/forum/posts');
      setPosts(response.data || response.posts || []);
    } catch (err) {
      setError(err.message || 'Failed to load forum posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshPosts(); }, [refreshPosts]);

  const createPost = useCallback(async (question, career, taggedMentor) => {
    const response = await apiClient.post('/forum/posts', { question, career, tagged_mentor: taggedMentor || undefined });
    if (response.data) setPosts(prev => [response.data, ...prev]);
  }, []);

  const addReply = useCallback(async (postId, text) => {
    const response = await apiClient.post(`/forum/posts/${postId}/replies`, { text });
    if (response.data) {
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, replies: [...(post.replies || []), response.data] }
          : post
      ));
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { posts, isLoading, error, createPost, addReply, refreshPosts, clearError };
}
