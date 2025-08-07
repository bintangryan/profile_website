document.addEventListener('DOMContentLoaded', function() {
    // --- Variabel Global ---
    const allNavLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
    let portfolioData = {};
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
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const body = document.body;
    const contactForm = document.getElementById('contactForm');
    const allAnimatedElements = document.querySelectorAll('.animate-on-scroll');
    const techIconsGrid = document.querySelector('.tech-icons-grid');

    // --- LOGIKA NAVIGASI FINAL ---

    function applyActiveClass() {
        const currentPath = window.location.pathname;

        // Logika untuk Halaman Portfolio
        if (currentPath.includes('portfolio.html')) {
            allNavLinks.forEach(link => {
                // Di halaman ini, link portofolio adalah href="#portfolio".
                const isPortfolioLink = link.getAttribute('href') === '#portfolio';
                link.classList.toggle('active', isPortfolioLink);
            });
            return; // Selesai, jangan jalankan kode di bawah
        }
        
        // Logika untuk Halaman Index (default)
        const sections = document.querySelectorAll('main section[id]');
        if (sections.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                let activeSectionFound = false;
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionId = `#${entry.target.id}`;
                        allNavLinks.forEach(link => {
                            // Mencocokkan link yang href-nya mengandung id section
                             if (link.getAttribute('href').endsWith(sectionId)) {
                                link.classList.add('active');
                                activeSectionFound = true;
                            } else {
                                link.classList.remove('active');
                            }
                        });
                    }
                });
                // Fallback jika tidak ada section yang aktif (misal di paling bawah)
                 if (!activeSectionFound) {
                    allNavLinks.forEach(l => l.classList.remove('active'));
                 }
            }, {
                rootMargin: '-40% 0px -60% 0px'
            });
            sections.forEach(section => observer.observe(section));
        }
    }

    // Panggil fungsi saat halaman dimuat
    applyActiveClass();

    // Event listener untuk klik navigasi (MEMPERBAIKI NAVIGASI)
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const linkUrl = new URL(link.href);
            const currentUrl = new URL(window.location.href);

            // Jika mengklik tautan di halaman yang sama (untuk smooth scroll)
            if (linkUrl.pathname === currentUrl.pathname && linkUrl.hash) {
                e.preventDefault(); // Hentikan aksi default
                const targetSection = document.querySelector(linkUrl.hash);
                if (targetSection) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    window.scrollTo({
                        top: targetSection.offsetTop - navbarHeight,
                        behavior: 'smooth'
                    });
                }
            }
            // Jika mengklik tautan ke halaman lain (misalnya dari portfolio ke index#home),
            // JANGAN panggil e.preventDefault(). Biarkan browser berpindah halaman.
        });
    });


    // --- SISA KODE ANDA (TIDAK PERLU DIUBAH) ---

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

    if (mobileMenuButton && mobileNavLinks) {
        mobileMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            mobileNavLinks.classList.toggle('active');
            this.classList.toggle('open');
        });
    }

    const animationObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target === techIconsGrid) {
                    const techIcons = techIconsGrid.querySelectorAll('.tech-icon-item');
                    techIcons.forEach((icon, index) => {
                        setTimeout(() => {
                            icon.classList.add('in-view');
                        }, 120 * index);
                    });
                    observerInstance.unobserve(techIconsGrid);
                } else {
                    entry.target.classList.add('is-visible');
                }
            }
        });
    }, {
        threshold: 0.2
    });

    if (allAnimatedElements.length > 0) {
        allAnimatedElements.forEach(element => {
            if (!element.classList.contains('tech-icon-item')) {
                animationObserver.observe(element);
            }
        });
    }
    if (techIconsGrid) {
        animationObserver.observe(techIconsGrid);
    }
    
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
                            item.style.display = 'flex';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                    portfolioItemsContainer.classList.remove('refreshing');
                }, 400);
            });
        });
    }

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

    if (darkModeToggle && darkModeIcon) {
        function setTheme(isDark) {
            if (isDark) {
                body.classList.add('dark-mode');
                darkModeToggle.classList.add('active');
                darkModeIcon.src = 'assets/images/mode/darkk.png';
                darkModeIcon.alt = 'Dark Mode Icon';
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark-mode');
                darkModeToggle.classList.remove('active');
                darkModeIcon.src = 'assets/images/mode/light.png';
                darkModeIcon.alt = 'Light Mode Icon';
                localStorage.setItem('theme', 'light');
            }
        }
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));
        darkModeToggle.addEventListener('click', () => setTheme(!body.classList.contains('dark-mode')));
    }

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