import { getCurrentUser, getToken } from './auth.js';

// State
let posts = [];

// DOM Elements
let postsContainer, allPostsTab, myPostsTab, createPostModal, postForm;

export async function initPosts() {
  postsContainer = document.getElementById('posts-container');
  allPostsTab = document.getElementById('all-posts-tab');
  myPostsTab = document.getElementById('my-posts-tab');
  createPostModal = document.getElementById('create-post-modal');
  postForm = document.getElementById('post-form');

  await fetchPosts();

  // Tab switching
  function setActiveTab(tab) {
    allPostsTab.classList.remove('active');
    myPostsTab.classList.remove('active');
    tab.classList.add('active');
  }

  if (allPostsTab && myPostsTab) {
    allPostsTab.addEventListener('click', () => {
      setActiveTab(allPostsTab);
      renderPosts();
    });

    myPostsTab.addEventListener('click', () => {
      setActiveTab(myPostsTab);
      const currentUser = getCurrentUser();
      if (currentUser?.id) {
        renderPosts(currentUser.id);
      } else {
        alert('You must be logged in to view your posts.');
      }
    });
  }

  // Default view
  setActiveTab(allPostsTab);
  renderPosts();

  // Event listeners
  if (postForm) {
    postForm.addEventListener('submit', handlePostSubmit);
  }

  // Cancel button
  document.getElementById('cancel-post-btn')?.addEventListener('click', () => {
    postForm.reset();
    createPostModal.classList.add('hidden');
  });

  // Like and comment event delegation
  postsContainer.addEventListener('click', async (e) => {
    // Like button click
    if (e.target.closest('.like-btn')) {
      const likeBtn = e.target.closest('.like-btn');
      const postId = likeBtn.dataset.postId;
      await handleLikePost(postId);
    }

    // Comment toggle button click
    if (e.target.closest('.comment-toggle-btn')) {
      const postId = e.target.closest('.comment-toggle-btn').dataset.postId;
      const commentsSection = document.querySelector(`.post-card[data-post-id="${postId}"] .comments-section`);
      commentsSection.classList.toggle('hidden');
    }
  });

  // Comment form submission
  postsContainer.addEventListener('submit', async (e) => {
    if (e.target.closest('.add-comment-form')) {
      e.preventDefault();
      const form = e.target.closest('.add-comment-form');
      const postId = form.dataset.postId;
      const commentInput = form.querySelector('.comment-input');
      await handleAddComment(postId, commentInput.value);
      commentInput.value = '';
    }
  });
}

async function fetchPosts() {
  try {
    const res = await fetch('http://localhost:8006/api/posts');
    if (!res.ok) throw new Error('Failed to fetch posts');
    const data = await res.json();
    posts = data.map(post => ({
      ...post,
      id: post._id,
      likes: post.likes || [],
      comments: post.comments || [],
      author: post.author || 'Unknown',
      authorId: post.authorId || null,
      authorAvatar: post.authorAvatar || null,
    }));
  } catch (err) {
    console.error('Fetch posts failed:', err);
  }
}

async function handlePostSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  const fileInput = document.getElementById('post-image');
  const currentUser = getCurrentUser();

  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);

  if (fileInput.files[0]) {
    formData.append('file', fileInput.files[0]);
  }

  const isEdit = postForm.dataset.mode === 'edit';
  const postId = postForm.dataset.postId;

  try {
    const url = isEdit
      ? `http://localhost:8006/api/posts/${postId}`
      : 'http://localhost:8006/api/posts/create';

    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: formData
    });

    if (!res.ok) throw new Error(`${isEdit ? 'Update' : 'Post'} failed`);

    const postData = await res.json();
    postData.id = postData._id;
    postData.likes = postData.likes || [];
    postData.comments = postData.comments || [];

    if (isEdit) {
      // Replace updated post in array
      const index = posts.findIndex(p => p.id === postId);
      if (index !== -1) posts[index] = postData;
    } else {
      posts.unshift(postData);
    }

    renderPosts(myPostsTab.classList.contains('active') ? currentUser.id : null);
    postForm.reset();
    createPostModal.classList.add('hidden');
    postForm.removeAttribute('data-mode');
    postForm.removeAttribute('data-post-id');
  } catch (err) {
    console.error(`${isEdit ? 'Update' : 'Post'} failed:`, err);
    alert(`${isEdit ? 'Update' : 'Post'} failed. Try again.`);
  }
}

export function renderPosts(filterByAuthorId = null) {
  const currentUser = getCurrentUser();
  const postsToRender = filterByAuthorId
    ? posts.filter(post => post.authorId === currentUser?.id)
    : posts;

  postsContainer.innerHTML = postsToRender.length === 0
    ? '<p class="text-gray-500 col-span-3 text-center py-8">No posts found.</p>'
    : postsToRender.map(post => createPostElement(post)).join('');

  // Reattach edit/delete event listeners
  document.querySelectorAll('.edit-post-btn').forEach(btn => {
    btn.addEventListener('click', () => handleEditPost(btn.dataset.id));
  });

  document.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeletePost(btn.dataset.id));
  });
}

function handleEditPost(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  document.getElementById('post-title').value = post.title;
  document.getElementById('post-content').value = post.content;
  document.getElementById('post-image').value = ''; // Clear file input

  postForm.dataset.mode = 'edit';
  postForm.dataset.postId = postId;
  createPostModal.classList.remove('hidden');
}

async function handleDeletePost(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post || post.authorId !== getCurrentUser()?.id) {
    alert("You can only delete your own posts.");
    return;
  }

  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    const res = await fetch(`http://localhost:8006/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (!res.ok) throw new Error("Delete failed");

    posts = posts.filter(p => p.id !== postId);
    renderPosts(myPostsTab.classList.contains('active') ? getCurrentUser().id : null);
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete post.");
  }
}

async function handleLikePost(postId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please login to like posts');
    return;
  }

  try {
    const res = await fetch(`http://localhost:8006/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!res.ok) throw new Error('Like failed');

    const updatedPost = await res.json();
    updatedPost.id = updatedPost._id;
    updatedPost.likes = updatedPost.likes || [];
    updatedPost.comments = updatedPost.comments || [];

    // Update the post in our local state
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = updatedPost;
    }

    // Re-render just this post for better performance
    const postElement = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (postElement) {
      postElement.outerHTML = createPostElement(updatedPost);
    }
  } catch (err) {
    console.error('Like error:', err);
    alert('Failed to like post');
  }
}

async function handleAddComment(postId, text) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please login to comment');
    return;
  }

  if (!text.trim()) {
    alert('Comment cannot be empty');
    return;
  }

  try {
    const res = await fetch(`http://localhost:8006/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        text,
        userName: currentUser.name,
        //userAvatar: currentUser.avatar
      })
    });

    if (!res.ok) throw new Error('Comment failed');

    const updatedPost = await res.json();
    updatedPost.id = updatedPost._id;
    updatedPost.likes = updatedPost.likes || [];
    updatedPost.comments = updatedPost.comments || [];

    // Update the post in our local state
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = updatedPost;
    }

    // Re-render just this post
    const postElement = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (postElement) {
      postElement.outerHTML = createPostElement(updatedPost);
      // Keep comments section open after adding new comment
      const commentsSection = document.querySelector(`.post-card[data-post-id="${postId}"] .comments-section`);
      if (commentsSection) {
        commentsSection.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error('Comment error:', err);
    alert('Failed to add comment');
  }
}

function createPostElement(post) {
  let fileBlock = '';

  if (post.fileContent) {
    const lower = post.fileContent.toLowerCase();

    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.gif')) {
      fileBlock = `
                <div class="media-container mt-4">
                    <img src="http://localhost:8006${post.fileContent}" alt="Post image" class="rounded-lg shadow" />
                </div>`;
    } else if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.m4v')) {
      fileBlock = `
                <div class="media-container mt-4">
                    <video controls class="w-full rounded-lg shadow">
                        <source src="http://localhost:8006${post.fileContent}" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>`;
    } else {
      fileBlock = `
                <div class="mt-4 text-sm text-gray-500 italic">
                    File attached: ${post.fileContent.split('/').pop()}
                </div>`;
    }
  }

  const isLiked = post.likes?.includes(getCurrentUser()?.id);
  const likeIconClass = isLiked ? 'fas text-red-500' : 'far';
  const likeAnimationClass = isLiked ? 'heart-beat' : '';

  return `
    <div class="post-card" data-post-id="${post.id}">
        <div class="post-header">
            <h3 class="post-title">${post.title}</h3>
            <span class="author-name">By ${post.author}</span>
        </div>
        
        <div class="post-content">
            <p>${post.content}</p>
            ${fileBlock}
        </div>
        
        <div class="post-footer">
            <div class="post-actions">
                <button class="like-btn" data-post-id="${post.id}">
                    <i class="${likeIconClass} fa-heart ${likeAnimationClass}"></i>
                    <span class="like-count">${post.likes?.length || 0}</span>
                </button>
                <button class="comment-toggle-btn" data-post-id="${post.id}">
                    <i class="far fa-comment"></i>
                    <span class="comment-count">${post.comments?.length || 0}</span>
                </button>
                ${post.authorId === getCurrentUser()?.id ? `
                    <button data-id="${post.id}" class="edit-post-btn">
                        <i class="far fa-edit"></i> Edit
                    </button>
                    <button data-id="${post.id}" class="delete-post-btn">
                        <i class="far fa-trash-alt"></i> Delete
                    </button>
                ` : ''}
            </div>
            
            <div class="post-stats">
                <span class="post-date">Posted on ${new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        
        <div class="comments-section hidden">
            <div class="comments-list">
                ${post.comments?.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            <span class="commenter-name">${comment.userName}</span>
                            <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <div class="comment-content">
                            <p>${comment.text}</p>
                        </div>
                    </div>
                `).join('') || ''}
            </div>
            
            <form class="add-comment-form" data-post-id="${post.id}">
                <div class="form-group">
                    <textarea class="comment-input" placeholder="Write a comment..." rows="2" required></textarea>
                </div>
                <button type="submit" class="btn primary small">Post Comment</button>
            </form>
        </div>
    </div>`;
}