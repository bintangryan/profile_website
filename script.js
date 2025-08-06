document.addEventListener('DOMContentLoaded', function() {
    // --- Global Variables & Element Selections ---
    let portfolioData = {}; // Global variable to store portfolio data.
    const portfolioItemsContainer = document.getElementById('portfolio-items-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('portfolio-modal');
    const closeButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalTechLogos = document.getElementById('modal-tech-logos');
    const modalTechTags = document.getElementById('modal-tech-tags');
    const modalLinks = document.querySelector('.modal-links');
    const modalImage = document.getElementById('modal-image');
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileNavLinks = document.querySelector('.mobile-nav-links');
    const navLinks = document.querySelectorAll('.navbar a');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const body = document.body;
    const contactForm = document.getElementById('contactForm');
    const allAnimatedElements = document.querySelectorAll('.animate-on-scroll');
    const techIconsGrid = document.querySelector('.tech-icons-grid'); // Tambahkan selector untuk grid ikon

    // --- Data Fetching ---
    async function fetchPortfolioData() {
        if (!portfolioItemsContainer) return;
        try {
            const response = await fetch('portfolio-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            portfolioData = await response.json();
            initializePortfolio();
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
            portfolioItemsContainer.innerHTML = '<p class="error-message">Gagal memuat portofolio. Silakan coba lagi nanti.</p>';
        }
    }

    // --- Portfolio Initialization ---
    function initializePortfolio() {
        if (!portfolioItemsContainer) return;
        portfolioItemsContainer.innerHTML = '';
        for (const itemId in portfolioData) {
            const item = portfolioData[itemId];
            const div = document.createElement('div');
            div.classList.add('portfolio-item');
            if (item.filterCategories && Array.isArray(item.filterCategories)) {
                div.setAttribute('data-category', item.filterCategories.join(' '));
            } else {
                div.setAttribute('data-category', 'all');
            }
            const img = document.createElement('img');
            img.src = item.coverImage;
            img.alt = item.title;
            img.setAttribute('loading', 'lazy');
            div.appendChild(img);
            const itemInfoDiv = document.createElement('div');
            itemInfoDiv.classList.add('item-info');
            const h3 = document.createElement('h3');
            h3.textContent = item.title;
            itemInfoDiv.appendChild(h3);
            const p = document.createElement('p');
            if (Array.isArray(item.description)) {
                p.textContent = item.description[0] + (item.description.length > 1 ? '...' : '');
            } else {
                const shortDescription = item.description.substring(0, 100);
                p.textContent = shortDescription + (item.description.length > 100 ? '...' : '');
            }
            p.classList.add('short-desc');
            itemInfoDiv.appendChild(p);
            const tagsDiv = document.createElement('div');
            tagsDiv.classList.add('tags');
            item.techSkills.slice(0, 3).forEach(tag => {
                const span = document.createElement('span');
                span.textContent = tag;
                tagsDiv.appendChild(span);
            });
            itemInfoDiv.appendChild(tagsDiv);
            const detailButton = document.createElement('button');
            detailButton.classList.add('btn', 'btn-detail');
            detailButton.textContent = 'More Detail';
            detailButton.setAttribute('data-item-id', itemId);
            itemInfoDiv.appendChild(detailButton);
            div.appendChild(itemInfoDiv);
            portfolioItemsContainer.appendChild(div);
        }
        attachDetailButtonListeners();
    }
    
    fetchPortfolioData();

    // === Mobile Menu Toggler ===
    if (mobileMenuButton && mobileNavLinks) {
        mobileMenuButton.addEventListener('click', function() {
            mobileNavLinks.classList.toggle('active');
            this.classList.toggle('open');
        });
    }

    function resetAllAnimations() {
        allAnimatedElements.forEach(element => {
            element.classList.remove('is-visible');
        });
    }

    // === Navigation Link Handling ===
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            if (mobileNavLinks && mobileNavLinks.classList.contains('active')) {
                mobileNavLinks.classList.remove('active');
                if (mobileMenuButton) mobileMenuButton.classList.remove('open');
            }
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                event.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    resetAllAnimations();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // --- Scroll Animation (IntersectionObserver) ---
// --- Scroll Animation (IntersectionObserver) ---
    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Logika baru yang lebih kreatif untuk Tech Stack
                if (entry.target === techIconsGrid) {
                    const techIcons = techIconsGrid.querySelectorAll('.tech-icon-item');
                    techIcons.forEach((icon, index) => {
                        setTimeout(() => {
                            // Menambahkan kelas 'in-view' untuk memicu animasi dari CSS
                            icon.classList.add('in-view');
                        }, 120 * index); // Penundaan 120ms untuk setiap ikon
                    });
                    // Hentikan pengamatan setelah animasi berjalan sekali
                    observerInstance.unobserve(techIconsGrid);
                } else {
                    // Jalankan animasi umum untuk elemen lainnya
                    entry.target.classList.add('is-visible');
                }
            }
        });
    }, {
        threshold: 0.2 // Pemicu saat 20% elemen terlihat
    });

    // Observe semua elemen animasi umum
    if (allAnimatedElements.length > 0) {
        allAnimatedElements.forEach(element => {
            // Pastikan kita tidak meng-observe ikon secara individual lagi
            // karena kita meng-observe container-nya (techIconsGrid)
            if (!element.classList.contains('tech-icon-item')) {
                observer.observe(element);
            }
        });
    }
    // Observe grid ikon secara khusus
    if (techIconsGrid) {
        observer.observe(techIconsGrid);
    }

    // === Portfolio Filtering ===
    if (filterButtons.length > 0 && portfolioItemsContainer) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                const portfolioItems = portfolioItemsContainer.querySelectorAll('.portfolio-item');
                portfolioItemsContainer.classList.add('refreshing');
                setTimeout(() => {
                    portfolioItems.forEach(item => {
                        const itemCategories = item.dataset.category.split(' ');
                        if (filter === 'all' || itemCategories.includes(filter)) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                    portfolioItemsContainer.classList.remove('refreshing');
                }, 400);
            });
        });
    }

    // === Pop-up/Modal Functionality ===
    function attachDetailButtonListeners() {
        const detailButtons = document.querySelectorAll('.btn-detail');
        detailButtons.forEach(button => {
            button.addEventListener('click', handleDetailButtonClick);
        });
    }

    function handleDetailButtonClick() {
        const itemId = this.dataset.itemId;
        const item = portfolioData[itemId];
        if (item && modal) {
            modalImage.src = item.previewImage || '';
            modalImage.style.display = item.previewImage ? 'block' : 'none';
            modalTitle.textContent = item.title;
            modalDesc.innerHTML = '';
            if (Array.isArray(item.description)) {
                const ul = document.createElement('ul');
                ul.style.listStyle = 'disc';
                ul.style.paddingLeft = '20px';
                item.description.forEach(point => {
                    const li = document.createElement('li');
                    li.textContent = point;
                    ul.appendChild(li);
                });
                modalDesc.appendChild(ul);
            } else {
                modalDesc.innerHTML = item.description.replace(/\n/g, '<br>');
            }
            modalTechLogos.innerHTML = '';
            if (item.techTools && item.techTools.length > 0) {
                item.techTools.forEach(tool => {
                    const div = document.createElement('div');
                    div.classList.add('tech-logo-item');
                    if (tool.icon.startsWith('fab ') || tool.icon.startsWith('fas ')) {
                        const i = document.createElement('i');
                        i.className = tool.icon;
                        div.appendChild(i);
                    } else {
                        const img = document.createElement('img');
                        img.src = tool.icon;
                        img.alt = tool.name + " Logo";
                        div.appendChild(img);
                    }
                    const span = document.createElement('span');
                    span.textContent = tool.name;
                    div.appendChild(span);
                    modalTechLogos.appendChild(div);
                });
            } else {
                modalTechLogos.innerHTML = '<p class="no-data">Tidak ada logo tools spesifik.</p>';
            }
            modalTechTags.innerHTML = '';
            modalTechTags.classList.remove('tags');
            if (item.techSkills && item.techSkills.length > 0) {
                modalTechTags.classList.add('tags');
                item.techSkills.forEach(skill => {
                    const span = document.createElement('span');
                    span.textContent = skill;
                    modalTechTags.appendChild(span);
                });
            } else {
                 modalTechTags.innerHTML = '<p class="no-data">Tidak ada skill yang tercantum.</p>';
            }
            modalLinks.innerHTML = '';
            if (item.links && item.links.length > 0) {
                item.links.forEach(link => {
                    const a = document.createElement('a');
                    a.href = link.url;
                    a.target = "_blank";
                    a.textContent = link.text + ' →';
                    modalLinks.appendChild(a);
                });
            } else {
                modalLinks.innerHTML = '<p class="no-data">Tidak ada link terkait untuk proyek ini.</p>';
            }
            modal.classList.add('show');
        }
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => modal.classList.remove('show'));
    }
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });

    // === Dark Mode Toggle Logic ===
    if (darkModeToggle && darkModeIcon) {
        function setTheme(isDark) {
            if (isDark) {
                body.classList.add('dark-mode');
                darkModeIcon.src = 'assets/images/mode/darkk.png';
                darkModeIcon.alt = 'Dark Mode Icon';
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark-mode');
                darkModeIcon.src = 'assets/images/mode/light.png';
                darkModeIcon.alt = 'Light Mode Icon';
                localStorage.setItem('theme', 'light');
            }
        }
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
             setTheme(true);
        } else {
             setTheme(false);
        }
        darkModeToggle.addEventListener('click', () => setTheme(!body.classList.contains('dark-mode')));
    }

    // === Form Shake Animation ===
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const nameInput = contactForm.querySelector('input[type="text"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const messageTextarea = contactForm.querySelector('textarea');
            if (!nameInput.value || !emailInput.value || !messageTextarea.value) {
                contactForm.classList.add('shake');
                contactForm.addEventListener('animationend', () => {
                    contactForm.classList.remove('shake');
                }, { once: true });
                alert('Mohon lengkapi semua kolom formulir!');
            } else {
                alert('Fitur pengiriman pesan belum tersedia. Terima kasih telah mencoba!');
                contactForm.reset();
            }
        });
    }
});