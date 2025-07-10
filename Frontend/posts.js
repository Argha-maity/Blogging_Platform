import { getCurrentUser } from './auth.js';

// State
let posts = [
    {
        id: '1',
        title: 'Getting Started with MERN Stack',
        content: 'A comprehensive guide to setting up your first MERN stack application...',
        author: 'John Doe',
        date: 'May 15, 2023',
        authorId: 'user1'
    },
    {
        id: '2',
        title: 'React Hooks Explained',
        content: 'Understanding useState, useEffect, and custom hooks in React functional components...',
        author: 'Jane Smith',
        date: 'June 2, 2023',
        authorId: 'user2'
    }
];

// DOM Elements
let postsContainer, allPostsTab, myPostsTab, createPostModal, postForm;

export function initPosts() {
    postsContainer = document.getElementById('posts-container');
    allPostsTab = document.getElementById('all-posts-tab');
    myPostsTab = document.getElementById('my-posts-tab');
    createPostModal = document.getElementById('create-post-modal');
    postForm = document.getElementById('post-form');

    if (allPostsTab && myPostsTab) {
        allPostsTab.addEventListener('click', () => renderPosts());
        myPostsTab.addEventListener('click', () => renderPosts(getCurrentUser()?.id));
    }

    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }
}

function handlePostSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    // In a real app, this would include file upload handling
    const newPost = {
        id: 'post' + Math.floor(Math.random() * 1000000),
        title,
        content,
        author: currentUser.name,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        authorId: currentUser.id
    };

    posts.unshift(newPost);
    renderPosts(myPostsTab.classList.contains('active-tab') ? currentUser.id : null);

    // Reset form and close modal
    postForm.reset();
    createPostModal.classList.add('hidden');
}

// Render posts
export function renderPosts(filterByAuthorId = null) {
    let postsToRender = filterByAuthorId
        ? posts.filter(post => post.authorId === filterByAuthorId)
        : posts;

    postsContainer.innerHTML = postsToRender.length === 0
        ? '<p class="text-gray-500 col-span-3 text-center py-8">No posts found.</p>'
        : postsToRender.map(post => createPostElement(post)).join('');

    // Add event listeners to action buttons
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

    // Fill the form with post data
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;

    // Show the modal
    createPostModal.classList.remove('hidden');

    // Change form to edit mode
    postForm.dataset.mode = 'edit';
    postForm.dataset.postId = postId;
}

function handleDeletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(post => post.id !== postId);
        renderPosts(myPostsTab.classList.contains('active-tab') ? currentUser.id : null);
    }
}