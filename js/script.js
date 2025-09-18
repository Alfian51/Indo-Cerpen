document.addEventListener('DOMContentLoaded', () => {
    const writeForm = document.getElementById('writeForm');
    const cerpenList = document.getElementById('cerpenList');
    const latestStoriesList = document.getElementById('latest-stories-list');
    const storyFullContent = document.getElementById('story-full-content');

    // --- Logic for Write Page ---
    if (writeForm) {
        const cerpenTitle = document.getElementById('cerpenTitle');
        const cerpenContent = document.getElementById('cerpenContent');
        const wordCountEl = document.getElementById('word-count');
        const saveStatusEl = document.getElementById('save-status');
        let saveTimeout;

        // 1. Word Count Function
        function updateWordCount() {
            const content = cerpenContent.value;
            const characterCount = content.length;
            const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
            wordCountEl.textContent = `${wordCount} Kata, ${characterCount} Karakter`;
        }

        // 2. Autosave Function
        function saveDraft() {
            const draft = {
                title: cerpenTitle.value,
                content: cerpenContent.value,
            };
            localStorage.setItem('cerpenDraft', JSON.stringify(draft));
            saveStatusEl.textContent = `Tersimpan otomatis pada ${new Date().toLocaleTimeString()}`;
        }

        // 3. Load Draft Function
        function loadDraft() {
            const draft = JSON.parse(localStorage.getItem('cerpenDraft'));
            if (draft) {
                cerpenTitle.value = draft.title;
                cerpenContent.value = draft.content;
                updateWordCount(); // Update count after loading draft
                saveStatusEl.textContent = 'Draf sebelumnya berhasil dimuat.';
            }
        }

        // Attach event listeners
        cerpenContent.addEventListener('input', () => {
            updateWordCount();
            // Debounce save function
            clearTimeout(saveTimeout);
            saveStatusEl.textContent = 'Mengetik...';
            saveTimeout = setTimeout(saveDraft, 2000); // Save 2 seconds after user stops typing
        });
        cerpenTitle.addEventListener('input', () => {
             // Debounce save function
            clearTimeout(saveTimeout);
            saveStatusEl.textContent = 'Mengetik...';
            saveTimeout = setTimeout(saveDraft, 2000);
        });


        // Handle form submission
        writeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = cerpenTitle.value;
            const content = cerpenContent.value;

            const category = document.querySelector('input[name="category"]:checked');

            if (!title || !content || !category) {
                alert('Judul, isi cerpen, dan kategori tidak boleh kosong!');
                return;
            }

            const newStory = {
                id: Date.now(),
                title: title,
                content: content,
                category: category.value,
                comments: []
            };
            const stories = JSON.parse(localStorage.getItem('cerpenCollection')) || [];
            stories.push(newStory);
            localStorage.setItem('cerpenCollection', JSON.stringify(stories));

            // Clear the draft after successful submission
            localStorage.removeItem('cerpenDraft');
            
            alert('Cerpen berhasil dipublikasikan!');
            window.location.href = 'browse.html';
        });

        // Initial load
        loadDraft();
    }

    // --- Logic for Browse Page ---
    if (cerpenList) {
        const stories = JSON.parse(localStorage.getItem('cerpenCollection')) || [];
        const filterButtonsContainer = document.getElementById('category-filters');

        // Function to display stories on the page
        const displayStories = (filteredStories) => {
            cerpenList.innerHTML = '';
            if (filteredStories.length === 0) {
                cerpenList.innerHTML = '<p class="col-12">Tidak ada cerpen dalam kategori ini.</p>';
            } else {
                filteredStories.reverse().forEach(story => {
                    const storyCard = `
                        <div class="col-md-6 col-lg-4 mb-4 story-card-item" data-category="${story.category}">
                            <div class="card story-card-v2 h-100">
                                <div class="card-img-placeholder"></div>
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">${story.title}</h5>
                                    <p class="card-text flex-grow-1">${story.content.substring(0, 150)}...</p>
                                    <p class="card-text"><small class="text-muted">Kategori: ${story.category}</small></p>
                                    <div class="mt-auto">
                                        <a href="story.html?id=${story.id}" class="btn btn-secondary btn-sm">Baca</a>
                                        <button class="btn btn-danger btn-sm delete-btn" data-story-id="${story.id}">Hapus</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    cerpenList.innerHTML += storyCard;
                });
            }
        };

        // Function to handle filtering and update active button
        const filterAndDisplay = (category) => {
            const allStories = JSON.parse(localStorage.getItem('cerpenCollection')) || [];
            let storiesToShow = [];

            if (category === 'all') {
                storiesToShow = allStories;
            } else {
                storiesToShow = allStories.filter(story => story.category === category);
            }
            displayStories(storiesToShow);

            // Update active state for filter buttons
            const buttons = filterButtonsContainer.querySelectorAll('.filter-btn');
            buttons.forEach(button => {
                if (button.getAttribute('data-category') === category) {
                    button.classList.add('btn-primary');
                    button.classList.remove('btn-outline-primary');
                } else {
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-outline-primary');
                }
            });
        };

        // Add event listeners to filter buttons
        filterButtonsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const category = e.target.getAttribute('data-category');
                filterAndDisplay(category);
            }
        });

        // Initial load: Check for URL parameter and display stories
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');

        if (categoryFromUrl) {
            filterAndDisplay(categoryFromUrl);
        } else {
            filterAndDisplay('all'); // Default to show all
        }
    }

    // --- Logic for Home Page ---
    if (latestStoriesList) {
        const stories = JSON.parse(localStorage.getItem('cerpenCollection')) || [];
        if (stories.length === 0) {
            latestStoriesList.innerHTML = '<p class="col-12">Belum ada cerpen yang ditulis. <a href="write.html">Mulai menulis sekarang!</a></p>';
        } else {
            latestStoriesList.innerHTML = '';
            const latestThree = stories.reverse().slice(0, 3);
            latestThree.forEach(story => {
                const storyCard = `
                    <div class="col-md-4 mb-4">
                        <div class="card story-card-v2 h-100">
                            <div class="card-img-placeholder"></div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${story.title}</h5>
                                <p class="card-text flex-grow-1">${story.content.substring(0, 100)}...</p>
                                <p class="card-text"><small class="text-muted">Kategori: ${story.category}</small></p>
                                <div class="mt-auto">
                                    <a href="story.html?id=${story.id}" class="btn btn-secondary btn-sm">Baca</a>
                                    <button class="btn btn-danger btn-sm delete-btn" data-story-id="${story.id}">Hapus</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                latestStoriesList.innerHTML += storyCard;
            });
        }
    }

    // --- DELEGATED EVENT LISTENER FOR DELETE ---
    function handleDelete(event) {
        if (event.target.classList.contains('delete-btn')) {
            const storyId = parseInt(event.target.getAttribute('data-story-id'));
            
            if (confirm('Apakah Anda yakin ingin menghapus cerpen ini? Aksi ini tidak dapat dibatalkan.')) {
                let stories = JSON.parse(localStorage.getItem('cerpenCollection')) || [];
                const updatedStories = stories.filter(story => story.id !== storyId);
                localStorage.setItem('cerpenCollection', JSON.stringify(updatedStories));
                window.location.reload(); // Reload the page to reflect changes
            }
        }
    }

    if(cerpenList) {
        cerpenList.addEventListener('click', handleDelete);
    }
    if(latestStoriesList) {
        latestStoriesList.addEventListener('click', handleDelete);
    }

    // --- Logic for Story Page ---
    if (storyFullContent) {
        const urlParams = new URLSearchParams(window.location.search);
        const storyId = parseInt(urlParams.get('id'));
        let stories = JSON.parse(localStorage.getItem('cerpenCollection')) || [];
        let story = stories.find(s => s.id === storyId);

        const commentsList = document.getElementById('comments-list');
        const commentForm = document.getElementById('comment-form');

        function displayComments() {
            commentsList.innerHTML = '';
            if (story.comments && story.comments.length > 0) {
                story.comments.forEach(comment => {
                    const commentEl = document.createElement('div');
                    commentEl.className = 'card bg-light mb-3';
                    commentEl.innerHTML = `
                        <div class="card-body">
                            <p class="card-text">${comment.text}</p>
                            <p class="card-subtitle text-muted small">Oleh: <strong>${comment.name}</strong> pada ${new Date(comment.date).toLocaleDateString()}</p>
                        </div>
                    `;
                    commentsList.appendChild(commentEl);
                });
            } else {
                commentsList.innerHTML = '<p>Belum ada komentar. Jadilah yang pertama!</p>';
            }
        }

        if (story) {
            document.title = story.title + " - INDOCERPEN";
            const storyHTML = `
                <h1>${story.title}</h1>
                <p class="text-muted">Ditulis pada ${new Date(story.id).toLocaleDateString()} | Kategori: ${story.category}</p>
                <hr>
                <div class="story-body">
                    ${story.content.replace(/\n/g, '<br>')}
                </div>
            `;
            storyFullContent.innerHTML = storyHTML;

            displayComments();

            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const commenterName = document.getElementById('commenter-name').value;
                const commentText = document.getElementById('comment-text').value;

                const newComment = {
                    name: commenterName,
                    text: commentText,
                    date: Date.now()
                };

                const storyIndex = stories.findIndex(s => s.id === storyId);
                if (storyIndex > -1) {
                    if (!stories[storyIndex].comments) {
                        stories[storyIndex].comments = [];
                    }
                    stories[storyIndex].comments.push(newComment);
                    
                    story = stories[storyIndex];
                    localStorage.setItem('cerpenCollection', JSON.stringify(stories));

                    displayComments();
                    commentForm.reset();
                }
            });

        } else {
            storyFullContent.innerHTML = '<h1>Cerpen tidak ditemukan.</h1><p>Cerpen yang Anda cari mungkin telah dihapus atau linknya salah.</p>';
            document.getElementById('comments-section').style.display = 'none';
        }
    }
});
