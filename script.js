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
            div.setAttribute('data-category', item.techSkills.map(skill => skill.toLowerCase().replace(/\s/g, '-')).join(' ') + ' ' + (item.links.length > 0 ? 'projects' : '')); // Contoh kategori berdasarkan skill atau status link

            // Tambahkan kategori spesifik jika ada
            if (itemId.includes('project')) {
                div.setAttribute('data-category', div.getAttribute('data-category') + ' projects');
            } else if (itemId.includes('publication')) {
                div.setAttribute('data-category', div.getAttribute('data-category') + ' publications');
            } else if (itemId.includes('committee')) {
                div.setAttribute('data-category', div.getAttribute('data-category') + ' committee');
            }
            // Tambahkan kategori berdasarkan konten, Anda mungkin ingin menambahkan data-category langsung di JSON

            // Konten gambar
            const img = document.createElement('img');
            img.src = item.previewImage;
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
                p.textContent = item.description[0] + (item.description.length > 1 ? '...' : ''); // Tampilkan hanya baris pertama untuk short desc
            } else {
                p.textContent = item.description;
            }
            p.classList.add('short-desc');
            itemInfoDiv.appendChild(p);

            const tagsDiv = document.createElement('div');
            tagsDiv.classList.add('tags');
            item.techSkills.forEach(tag => {
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
        animateElements.forEach(element => observer.unobserve(element)); // Hapus observer lama
        document.querySelectorAll('.portfolio-item').forEach(element => observer.observe(element)); // Tambahkan observer ke item baru
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
        animateElements.forEach(element => {
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
                    animateElements.forEach(element => {
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
                entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.2
    });

    animateElements.forEach(element => {
        observer.observe(element);
    });

    // === Portfolio Filtering ===
    const filterButtons = document.querySelectorAll('.filter-btn');
    // portfolioItems akan diisi setelah data dimuat dan elemen dibuat

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            const portfolioItems = document.querySelectorAll('.portfolio-item'); // Ambil ulang item setiap kali filter diubah

            portfolioItems.forEach(item => {
                const categories = item.dataset.category.split(' ');
                if (filter === 'all' || categories.includes(filter)) {
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
        const detailButtons = document.querySelectorAll('.btn-detail'); // Ambil ulang tombol setelah inisialisasi portofolio
        detailButtons.forEach(button => {
            button.removeEventListener('click', handleDetailButtonClick); // Hapus listener sebelumnya jika ada
            button.addEventListener('click', handleDetailButtonClick); // Tambahkan listener baru
        });
    }

    function handleDetailButtonClick() {
        const itemId = this.dataset.itemId;
        const item = portfolioData[itemId]; // Menggunakan portfolioData yang telah dimuat

        if (item) {
            // Tampilkan Gambar Pratinjau
            if (item.previewImage) {
                modalImage.src = item.previewImage;
                modalImage.style.display = 'block';
            } else {
                modalImage.style.display = 'none';
                modalImage.src = '';
            }

            modalTitle.textContent = item.title;

            // Modifikasi ini untuk menangani deskripsi array atau string
            if (Array.isArray(item.description)) {
                const ul = document.createElement('ul');
                ul.style.listStyle = 'disc';
                ul.style.paddingLeft = '20px';
                item.description.forEach(point => {
                    const li = document.createElement('li');
                    li.textContent = point;
                    ul.appendChild(li);
                });
                modalDesc.innerHTML = '';
                modalDesc.appendChild(ul);
            } else {
                modalDesc.textContent = item.description.replace(/\\n/g, '\n');
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

            // Tampilkan Skill Required (tags)
            modalTechTags.innerHTML = '';
            if (item.techSkills && item.techSkills.length > 0) {
                item.techSkills.forEach(skill => {
                    const span = document.createElement('span');
                    span.textContent = skill;
                    modalTechTags.appendChild(span);
                });
            } else {
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
    const darkModeIcon = document.getElementById('darkModeIcon'); // Ambil elemen gambar ikon
    const body = document.body;

    // Function to set the theme
    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            darkModeIcon.src = 'assets/images/mode/darkk.png'; // Ganti ke ikon dark mode
            darkModeIcon.alt = 'Dark Mode Icon'; // Update alt text
            darkModeToggle.classList.add('active');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            darkModeIcon.src = 'assets/images/mode/light.png'; // Ganti ke ikon light mode
            darkModeIcon.alt = 'Light Mode Icon'; // Update alt text
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

            // Ini adalah validasi sisi klien. Untuk pengiriman email sungguhan, Anda memerlukan backend.
            if (!nameInput.value || !emailInput.value || !messageTextarea.value) {
                event.preventDefault(); // Mencegah pengiriman formulir
                contactForm.classList.add('shake');
                contactForm.addEventListener('animationend', () => {
                    contactForm.classList.remove('shake');
                }, { once: true });
                alert('Mohon lengkapi semua kolom formulir!');
            } else {
                // Untuk demo ini, kita akan mencegah submit ke backend
                event.preventDefault();
                alert('Pesan berhasil dikirim (simulasi)! Untuk fungsionalitas pengiriman email sungguhan, diperlukan implementasi backend.');
                contactForm.reset(); // Reset formulir setelah simulasi kirim
            }
        });
    }
});