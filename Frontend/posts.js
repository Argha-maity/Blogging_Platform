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
            const currentUser = getCurrentUser(); // ← important!
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
}

async function fetchPosts() {
    try {
        const res = await fetch('http://localhost:8006/api/posts');
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        posts = data.map(post => ({ ...post, id: post._id }));
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
    const currentUser = getCurrentUser(); // <--- ensure we use latest state
    const postsToRender = filterByAuthorId
        ? posts.filter(post => post.authorId === currentUser?.id)
        : posts;

    postsContainer.innerHTML = postsToRender.length === 0
        ? '<p class="text-gray-500 col-span-3 text-center py-8">No posts found.</p>'
        : postsToRender.map(post => createPostElement(post)).join('');

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

function createPostElement(post) {
    let fileBlock = '';

    if (post.fileContent) {
        const lower = post.fileContent.toLowerCase();

        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.gif')) {
            fileBlock = `
        <div class="mt-4">
          <h4 class="font-semibold mb-2">Uploaded Image:</h4>
          <img src="http://localhost:8006${post.fileContent}" alt="Uploaded Image" class="rounded shadow max-w-full" />
        </div>`;
        } else if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.m4v')) {
            fileBlock = `
        <div class="mt-4">
          <h4 class="font-semibold mb-2">Uploaded Video:</h4>
          <video controls class="w-full rounded shadow">
            <source src="http://localhost:8006${post.fileContent}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>`;
        } else if (post.fileContent.startsWith('"') || post.fileContent.includes(',')) {
            fileBlock = `
        <div class="bg-gray-100 mt-4 p-3 rounded">
          <h4 class="font-semibold mb-2">Uploaded File Content:</h4>
          <pre class="overflow-auto text-sm text-gray-800 whitespace-pre-wrap">${post.fileContent}</pre>
        </div>`;
        } else {
            fileBlock = `
        <div class="mt-4 text-sm text-gray-500 italic">
          File uploaded, but preview is not supported.
        </div>`;
        }
    }

    return `
    <div class="post-card bg-white p-4 rounded-lg shadow-md">
      <h2 class="text-xl font-bold">${post.title}</h2>
      <p class="text-gray-700 my-2">${post.content}</p>
      <p class="text-sm text-gray-500">By ${post.author} on ${post.date}</p>
      ${fileBlock}
      <div class="mt-3 flex gap-2">
            ${post.authorId === getCurrentUser()?.id
                ? `
                <button data-id="${post.id}" class="edit-post-btn bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                <button data-id="${post.id}" class="delete-post-btn bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                `
                : ''
            }
        </div>
    </div>`;
}
