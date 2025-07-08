document.addEventListener('DOMContentLoaded', () => {
    const calendarContainer = document.getElementById('calendar-container');
    const letterModal = document.getElementById('letter-modal');
    const modalDate = document.getElementById('modal-date');
    const galleryDisplayArea = document.getElementById('gallery-display-area'); // New
    const noImagesText = document.getElementById('no-images-text');         // New
    const imagePreviewsContainer = document.getElementById('image-previews-container'); // New
    const imageUploadInput = document.getElementById('image-upload');     // Still this ID, but now handles multiple
    const letterInput = document.getElementById('letter-input');
    const saveContentBtn = document.getElementById('save-content');
    const deleteAllContentBtn = document.getElementById('delete-all-content'); // Renamed
    const closeButton = document.querySelector('.close-button');

    let selectedDate = null; // To store the currently selected date (YYYY-MM-DD)
    let currentImages = []; // Array to hold Base64 strings of images for the current date in the modal

    // Function to generate the full year calendar
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

                // Check if there's any content (letter or images) for this date
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
        imagePreviewsContainer.innerHTML = ''; // Clear previous previews
        if (currentImages.length === 0) {
            noImagesText.style.display = 'block';
            galleryDisplayArea.style.justifyContent = 'center'; // Center when empty
        } else {
            noImagesText.style.display = 'none';
            galleryDisplayArea.style.justifyContent = 'flex-start'; // Align top when images are present
            currentImages.forEach((base64Image, index) => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('image-preview-wrapper');

                const img = document.createElement('img');
                img.src = base64Image;
                img.alt = `Image ${index + 1}`;
                wrapper.appendChild(img);

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-image-btn');
                deleteBtn.textContent = 'X';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent modal from closing if button is within a clickable area
                    removeImage(index);
                });
                wrapper.appendChild(deleteBtn);

                imagePreviewsContainer.appendChild(wrapper);
            });
        }
    }

    // Function to remove an image from the currentImages array
    function removeImage(indexToRemove) {
        currentImages.splice(indexToRemove, 1); // Remove the image at the specified index
        displayImagePreviews(); // Re-render the previews
    }


    // Function to open the content modal (letter and gallery)
    function openContentModal(date) {
        selectedDate = date;
        modalDate.textContent = `letter for grasya  ${formatDateDisplay(date)}`;

        // Load existing content or initialize
        const storedData = JSON.parse(localStorage.getItem(date)) || { letter: '', images: [] };
        letterInput.value = storedData.letter || '';
        currentImages = storedData.images || []; // Initialize currentImages with stored ones

        imageUploadInput.value = ''; // Clear file input for new selections
        displayImagePreviews(); // Render existing images

        letterModal.style.display = 'flex';
        setTimeout(() => letterModal.classList.add('active'), 10);
        letterInput.focus();
    }

    // Function to close the modal
    function closeContentModal() {
        letterModal.classList.remove('active');
        setTimeout(() => {
            letterModal.style.display = 'none';
            selectedDate = null;
            letterInput.value = '';
            imageUploadInput.value = '';
            currentImages = []; // Clear current images
            imagePreviewsContainer.innerHTML = ''; // Clear previews from modal
            noImagesText.style.display = 'block'; // Show no image text again
        }, 300);

        generateCalendar(new Date().getFullYear()); // Re-generate calendar to update 'has-content' class
    }

    // Format date for display in the modal
    function formatDateDisplay(dateString) {
        const [year, month, day] = dateString.split('-');
        const dateObj = new Date(year, parseInt(month) - 1, day);
        return dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Event listener for image file selection (handles multiple)
    imageUploadInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            // Process each selected file
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) { // Ensure it's an image
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        currentImages.push(e.target.result); // Add Base64 string to the array
                        displayImagePreviews(); // Re-render to show new image
                    };
                    reader.readAsDataURL(file); // Read as Base64
                } else {
                    alert('Please select only image files.');
                }
            });
            imageUploadInput.value = ''; // Clear file input so same files can be re-selected if needed
        }
    });

    // Save content (letter and images) to local storage
    saveContentBtn.addEventListener('click', () => {
        if (selectedDate) {
            const letterContent = letterInput.value.trim();
            const contentToStore = {};

            if (letterContent) {
                contentToStore.letter = letterContent;
            }
            if (currentImages.length > 0) {
                contentToStore.images = currentImages; // Store the array of images
            }

            if (Object.keys(contentToStore).length > 0) {
                localStorage.setItem(selectedDate, JSON.stringify(contentToStore));
            } else {
                localStorage.removeItem(selectedDate); // Remove if both are empty
            }
            closeContentModal();
        }
    });

    // Delete all content (letter and images) for the selected date
    deleteAllContentBtn.addEventListener('click', () => {
        if (selectedDate && confirm('Are you sure you want to delete ALL content (letter and all images) for this date?')) {
            localStorage.removeItem(selectedDate);
            closeContentModal();
        }
    });

    // Close modal when close button is clicked
    closeButton.addEventListener('click', closeContentModal);

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target == letterModal) {
            closeContentModal();
        }
    });

    // Generate the calendar for the current year when the page loads
    const currentYearToDisplay = new Date().getFullYear();
    generateCalendar(currentYearToDisplay);
});