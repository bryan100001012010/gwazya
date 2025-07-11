document.addEventListener('DOMContentLoaded', () => {
    const calendarContainer = document.getElementById('calendar-container');
    const letterModal = document.getElementById('letter-modal');
    const modalDate = document.getElementById('modal-date');
    const galleryDisplayArea = document.getElementById('gallery-display-area');
    const noImagesText = document.getElementById('no-images-text');
    const imagePreviewsContainer = document.getElementById('image-previews-container');
    const imageUploadInput = document.getElementById('image-upload');
    const letterInput = document.getElementById('letter-input');
    const saveContentBtn = document.getElementById('save-content');
    const deleteAllContentBtn = document.getElementById('delete-all-content');
    const closeButton = document.querySelector('.close-button');

    // NEW Lightbox elements
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let selectedDate = null;
    let currentImages = []; // Array to hold Base64 strings of images for the current date in the modal
    let currentImageIndex = 0; // NEW: To keep track of the currently viewed image in the lightbox

    // Function to generate the full year calendar (no changes here)
    function generateCalendar(year) {
        calendarContainer.innerHTML = '';

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        for (let month = 0; month < 12; month++) {
            const monthDiv = document.createElement('div');
            monthDiv.classList.add('year-calendar');

            const monthTitle = document.createElement('h3');
            monthTitle.textContent = monthNames[month];
            monthDiv.appendChild(monthTitle);

            const dayNamesRow = document.createElement('div');
            dayNamesRow.classList.add('month-grid');
            dayNames.forEach(day => {
                const dayNameSpan = document.createElement('span');
                dayNameSpan.classList.add('day-name');
                dayNameSpan.textContent = day;
                dayNamesRow.appendChild(dayNameSpan);
            });
            monthDiv.appendChild(dayNamesRow);

            const monthGrid = document.createElement('div');
            monthGrid.classList.add('month-grid');

            const firstDay = new Date(year, month, 1);
            const startingDay = firstDay.getDay();

            for (let i = 0; i < startingDay; i++) {
                const emptyCell = document.createElement('span');
                emptyCell.classList.add('date-cell', 'empty-cell');
                monthGrid.appendChild(emptyCell);
            }

            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const dateCell = document.createElement('span');
                dateCell.classList.add('date-cell');
                dateCell.textContent = day;

                const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dateCell.dataset.date = fullDate;

                if (year === currentYear && month === currentMonth && day === currentDay) {
                    dateCell.classList.add('current-day');
                }

                const storedData = JSON.parse(localStorage.getItem(fullDate));
                if (storedData && (storedData.letter || (storedData.images && storedData.images.length > 0))) {
                    dateCell.classList.add('has-content');
                }

                dateCell.addEventListener('click', () => openContentModal(fullDate));

                monthGrid.appendChild(dateCell);
            }
            monthDiv.appendChild(monthGrid);
            calendarContainer.appendChild(monthDiv);
        }
    }

    // Function to display image previews in the modal
    function displayImagePreviews() {
        imagePreviewsContainer.innerHTML = '';
        if (currentImages.length === 0) {
            noImagesText.style.display = 'block';
            galleryDisplayArea.style.justifyContent = 'center';
        } else {
            noImagesText.style.display = 'none';
            galleryDisplayArea.style.justifyContent = 'flex-start';
            currentImages.forEach((base64Image, index) => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('image-preview-wrapper');

                const img = document.createElement('img');
                img.src = base64Image;
                img.alt = `Image ${index + 1}`;
                wrapper.appendChild(img);

                // NEW: Add click listener to open lightbox
                img.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent the modal itself from potentially closing
                    openLightbox(index);
                });


                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-image-btn');
                deleteBtn.textContent = 'X';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeImage(index);
                });
                wrapper.appendChild(deleteBtn);

                imagePreviewsContainer.appendChild(wrapper);
            });
        }
    }

    // Function to remove an image from the currentImages array (no changes here)
    function removeImage(indexToRemove) {
        currentImages.splice(indexToRemove, 1);
        displayImagePreviews();
    }

    // Function to open the content modal (no changes here)
    function openContentModal(date) {
        selectedDate = date;
        modalDate.textContent = `Letter for Grasya ${formatDateDisplay(date)}`;

        const storedData = JSON.parse(localStorage.getItem(date)) || { letter: '', images: [] };
        letterInput.value = storedData.letter || '';
        currentImages = storedData.images || [];

        imageUploadInput.value = '';
        displayImagePreviews();

        letterModal.style.display = 'flex';
        setTimeout(() => letterModal.classList.add('active'), 10);
        letterInput.focus();
    }

    // Function to close the modal (no changes here, as lightbox has its own close)
    function closeContentModal() {
        letterModal.classList.remove('active');
        setTimeout(() => {
            letterModal.style.display = 'none';
            selectedDate = null;
            letterInput.value = '';
            imageUploadInput.value = '';
            currentImages = [];
            imagePreviewsContainer.innerHTML = '';
            noImagesText.style.display = 'block';
        }, 300);

        generateCalendar(new Date().getFullYear());
    }

    // Format date for display in the modal (no changes here)
    function formatDateDisplay(dateString) {
        const [year, month, day] = dateString.split('-');
        const dateObj = new Date(year, parseInt(month) - 1, day);
        return dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Event listener for image file selection (no changes here)
    imageUploadInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImages.push(e.target.result);
                        displayImagePreviews();
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert('Please select only image files.');
                }
            });
            imageUploadInput.value = '';
        }
    });

    // Save content (letter and images) to local storage (no changes here)
    saveContentBtn.addEventListener('click', () => {
        if (selectedDate) {
            const letterContent = letterInput.value.trim();
            const contentToStore = {};

            if (letterContent) {
                contentToStore.letter = letterContent;
            }
            if (currentImages.length > 0) {
                contentToStore.images = currentImages;
            }

            if (Object.keys(contentToStore).length > 0) {
                localStorage.setItem(selectedDate, JSON.stringify(contentToStore));
            } else {
                localStorage.removeItem(selectedDate);
            }
            closeContentModal();
        }
    });

    // Delete all content (letter and images) for the selected date (no changes here)
    deleteAllContentBtn.addEventListener('click', () => {
        if (selectedDate && confirm('Are you sure you want to delete ALL content (letter and all images) for this date?')) {
            localStorage.removeItem(selectedDate);
            closeContentModal();
        }
    });

    // Close content modal when its close button is clicked (no changes here)
    closeButton.addEventListener('click', closeContentModal);

    // Close content modal when clicking outside its content (no changes here)
    window.addEventListener('click', (event) => {
        if (event.target == letterModal) {
            closeContentModal();
        }
    });

    // --- NEW LIGHTBOX FUNCTIONS ---

    // Function to open the lightbox
    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightboxModal.style.display = 'flex';
        setTimeout(() => lightboxModal.classList.add('active'), 10);
    }

    // Function to update the image in the lightbox
    function updateLightboxImage() {
        if (currentImages.length > 0) {
            lightboxImg.src = currentImages[currentImageIndex];
            // Show/hide navigation buttons based on image count
            lightboxPrev.style.display = currentImages.length > 1 ? 'flex' : 'none';
            lightboxNext.style.display = currentImages.length > 1 ? 'flex' : 'none';
        } else {
            // Should not happen if openLightbox is only called when images exist
            closeLightbox();
        }
    }

    // Function to navigate to the previous image
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing lightbox if clicking outside
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        updateLightboxImage();
    });

    // Function to navigate to the next image
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing lightbox if clicking outside
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        updateLightboxImage();
    });

    // Function to close the lightbox
    function closeLightbox() {
        lightboxModal.classList.remove('active');
        setTimeout(() => {
            lightboxModal.style.display = 'none';
            lightboxImg.src = ''; // Clear the image source
        }, 300);
    }

    // Event listener to close lightbox when the close button is clicked
    lightboxClose.addEventListener('click', closeLightbox);

    // Event listener to close lightbox when clicking outside the image
    lightboxModal.addEventListener('click', (event) => {
        // Only close if the click is directly on the modal background, not on the image or buttons
        if (event.target === lightboxModal) {
            closeLightbox();
        }
    });

    // Optional: Close lightbox with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Generate the calendar for the current year when the page loads
    const currentYearToDisplay = new Date().getFullYear();
    generateCalendar(currentYearToDisplay);
});
