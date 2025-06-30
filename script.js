document.addEventListener('DOMContentLoaded', function() {
    // --- Data Portofolio (Sekarang akan diambil dari portfolio-data.json) ---
    let portfolioData = {}; // Deklarasi variabel global untuk menyimpan data portofolio

    // Fungsi untuk mengambil data portofolio dari JSON
    async function fetchPortfolioData() {
        try {
            const response = await fetch('portfolio-data.json'); // Mengambil berkas JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            portfolioData = await response.json(); // Mengurai respons JSON
            initializePortfolio(); // Panggil fungsi inisialisasi setelah data dimuat
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
            // Fallback atau tampilkan pesan error ke pengguna
        }
    }

    // --- Inisialisasi Portofolio (dipanggil setelah data dimuat) ---
    function initializePortfolio() {
        const portfolioItemsContainer = document.getElementById('portfolio-items-container');
        if (!portfolioItemsContainer) return; // Pastikan elemen ada

        portfolioItemsContainer.innerHTML = ''; // Kosongkan kontainer sebelum mengisi

        // Loop melalui data portofolio dan buat elemen HTML
        for (const itemId in portfolioData) {
            const item = portfolioData[itemId];
            const div = document.createElement('div');
            div.classList.add('portfolio-item', 'animate-on-scroll');

            // Logika pengkategorian: menggunakan filterCategories (array) dari JSON
            if (item.filterCategories && Array.isArray(item.filterCategories)) {
                // Gabungkan kategori dengan spasi untuk atribut data-category
                div.setAttribute('data-category', item.filterCategories.join(' '));
            } else {
                // Fallback jika filterCategories tidak didefinisikan atau bukan array
                div.setAttribute('data-category', 'all');
            }

            // Konten gambar cover (menggunakan item.coverImage yang baru)
            const img = document.createElement('img');
            img.src = item.coverImage;
            img.alt = item.title;
            img.setAttribute('loading', 'lazy'); // Menambahkan lazy loading
            div.appendChild(img);

            // Info item
            const itemInfoDiv = document.createElement('div');
            itemInfoDiv.classList.add('item-info');

            const h3 = document.createElement('h3');
            h3.textContent = item.title;
            itemInfoDiv.appendChild(h3);

            const p = document.createElement('p');
            // Menangani deskripsi yang bisa berupa string atau array
            if (Array.isArray(item.description)) {
                // Display only the first line of the description for the short description
                p.textContent = item.description[0] + (item.description.length > 1 ? '...' : '');
            } else {
                // For string descriptions, take the first 100 characters and add '...' if longer
                const shortDescription = item.description.substring(0, 100);
                p.textContent = shortDescription + (item.description.length > 100 ? '...' : '');
            }
            p.classList.add('short-desc');
            itemInfoDiv.appendChild(p);

            const tagsDiv = document.createElement('div');
            tagsDiv.classList.add('tags'); // Ensure 'tags' class is added here for the portfolio card
            // Tampilkan hanya 3 skill pertama di kartu portofolio
            item.techSkills.slice(0, 3).forEach(tag => { // Menggunakan slice(0, 3)
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

        // Re-attach event listeners for new detail buttons
        attachDetailButtonListeners();

        // Re-observe new portfolio items for scroll animation
        observer.disconnect(); // Hapus observer lama
        document.querySelectorAll('.animate-on-scroll').forEach(element => observer.observe(element)); // Tambahkan observer ke semua elemen yang dianimasikan, termasuk item portofolio baru
    }

    // Panggil fungsi pengambilan data saat DOMContentLoaded
    fetchPortfolioData(); // Panggil fungsi untuk mengambil data saat DOM dimuat

    // === Mobile Menu Toggler ===
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileNavLinks = document.querySelector('.mobile-nav-links');
    const navLinks = document.querySelectorAll('.navbar a');

    mobileMenuButton.addEventListener('click', function() {
        mobileNavLinks.classList.toggle('active');
        this.classList.toggle('open');
    });

    // --- Fungsi untuk mereset animasi saat navigasi ---
    function resetAllAnimations() {
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            element.classList.remove('is-visible');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Tutup menu mobile jika terbuka
            if (mobileNavLinks.classList.contains('active')) {
                mobileNavLinks.classList.remove('active');
                mobileMenuButton.classList.remove('open');
            }

            // Dapatkan target ID dari href
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                // Hindari perilaku default agar kita bisa mengontrol scroll
                event.preventDefault();

                // Reset semua animasi sebelum scroll
                resetAllAnimations();

                // Lakukan scroll ke bagian yang dituju
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });

                // Set timeout kecil untuk memberi waktu browser untuk scroll dan IntersectionObserver bereaksi
                setTimeout(() => {
                    // Cek elemen yang sudah ada di viewport dan picu ulang animasinya
                    document.querySelectorAll('.animate-on-scroll').forEach(element => {
                        const rect = element.getBoundingClientRect();
                        const viewportHeight = (window.innerHeight || document.documentElement.clientHeight);
                        if (rect.top <= viewportHeight * 0.8 && rect.bottom >= viewportHeight * 0.2) {
                            element.classList.add('is-visible');
                        }
                    });
                }, 100);
            }
        });
    });

    // --- Animasi Muncul Saat Scroll (Diperbarui) ---
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // Optional: remove is-visible when out of view if you want re-animation on scroll up
                // entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.2
    });

    // Initial observation
    animateElements.forEach(element => {
        observer.observe(element);
    });


    // === Portfolio Filtering ===
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter; // Mengambil nilai data-filter dari tombol
            const portfolioItems = document.querySelectorAll('.portfolio-item'); // Mengambil semua item portofolio

            portfolioItems.forEach(item => {
                // Ambil string kategori dari data-category dan pisahkan menjadi array
                const itemCategories = item.dataset.category.split(' ');
                if (filter === 'all' || itemCategories.includes(filter)) { // Periksa apakah filter ada dalam array kategori item
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // === Pop-up/Modal Functionality ===
    const modal = document.getElementById('portfolio-modal');
    const closeButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalTechLogos = document.getElementById('modal-tech-logos');
    const modalTechTags = document.getElementById('modal-tech-tags');
    const modalLinks = document.querySelector('.modal-links');
    const modalImage = document.getElementById('modal-image');

    // Fungsi untuk melampirkan event listener ke tombol detail (dipanggil setelah item portofolio dibuat)
    function attachDetailButtonListeners() {
        const detailButtons = document.querySelectorAll('.btn-detail');
        detailButtons.forEach(button => {
            button.removeEventListener('click', handleDetailButtonClick); // Hapus listener sebelumnya jika ada
            button.addEventListener('click', handleDetailButtonClick); // Tambahkan listener baru
        });
    }

    function handleDetailButtonClick() {
        const itemId = this.dataset.itemId;
        const item = portfolioData[itemId]; // Menggunakan portfolioData yang telah dimuat

        if (item) {
            // Tampilkan Gambar Pratinjau (menggunakan item.previewImage)
            if (item.previewImage) {
                modalImage.src = item.previewImage;
                modalImage.style.display = 'block';
            } else {
                modalImage.style.display = 'none';
                modalImage.src = '';
            }

            modalTitle.textContent = item.title;

            // Modifikasi ini untuk menangani deskripsi array atau string
            modalDesc.innerHTML = ''; // Clear previous content
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
                // Replace \n with <br> for multiline string descriptions
                modalDesc.innerHTML = item.description.replace(/\n/g, '<br>');
            }

            // Tampilkan Logo Tools
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
                modalTechLogos.innerHTML = '<p style="font-size:0.9em; color: gray;">Tidak ada logo tools spesifik.</p>';
            }

            // Tampilkan Skill Required (tags) - Corrected this part
            modalTechTags.innerHTML = '';
            if (item.techSkills && item.techSkills.length > 0) {
                // Add the 'tags' class to the modalTechTags container itself
                modalTechTags.classList.add('tags'); // Add this line
                item.techSkills.forEach(skill => {
                    const span = document.createElement('span');
                    span.textContent = skill;
                    modalTechTags.appendChild(span);
                });
            } else {
                // Ensure to remove the 'tags' class if there are no skills to prevent styling issues
                modalTechTags.classList.remove('tags'); // Add this line
                modalTechTags.innerHTML = '<p style="font-size:0.9em; color: gray;">Tidak ada skill yang tercantum.</p>';
            }

            // Clear previous links and add new ones
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
                modalLinks.innerHTML = '<p style="font-size:0.9em; color: gray;">Tidak ada link terkait untuk proyek ini.</p>';
            }

            modal.classList.add('show');
        }
    }

    closeButton.addEventListener('click', function() {
        modal.classList.remove('show');
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.classList.remove('show');
        }
    });

    // === Dark Mode Toggle Logic ===
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const body = document.body;

    // Function to set the theme
    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            darkModeIcon.src = 'assets/images/mode/darkk.png'; // Corrected path for dark mode icon
            darkModeIcon.alt = 'Dark Mode Icon';
            darkModeToggle.classList.add('active');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            darkModeIcon.src = 'assets/images/mode/light.png'; // Corrected path for light mode icon
            darkModeIcon.alt = 'Light Mode Icon';
            darkModeToggle.classList.remove('active');
            localStorage.setItem('theme', 'light');
        }
    }

    // Check for saved theme preference on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setTheme(true);
    } else {
        setTheme(false); // Default to light mode if no preference or 'light'
    }

    // Toggle theme on button click
    darkModeToggle.addEventListener('click', function() {
        if (body.classList.contains('dark-mode')) {
            setTheme(false); // Switch to light mode
        } else {
            setTheme(true); // Switch to dark mode
        }
    });

    // === Form Shake Animation ===
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            const nameInput = contactForm.querySelector('input[type="text"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const messageTextarea = contactForm.querySelector('textarea');

            // This is client-side validation. For actual email submission, you'll need a backend.
            if (!nameInput.value || !emailInput.value || !messageTextarea.value) {
                event.preventDefault(); // Prevent form submission
                contactForm.classList.add('shake');
                contactForm.addEventListener('animationend', () => {
                    contactForm.classList.remove('shake');
                }, { once: true });
                alert('Mohon lengkapi semua kolom formulir!');
            } else {
                // For this demo, we'll simulate success and prevent actual submission
                event.preventDefault(); // Prevent actual form submission to a backend
                alert('Fitur belum tersedia');
                contactForm.reset(); // Reset the form after simulated submission
            }
        });
    }
});