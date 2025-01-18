    // Maximum word limit for the note
    const MAX_WORDS = 5000;

    // Function to sanitize user input to prevent XSS attacks
    function sanitizeInput(input) {
        // Remove HTML tags and replace special characters with HTML entities
        return input.replace(/<[^>]*>/g, '').replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[char]));
    }

    // Function to save a note
    function saveNote() {
        // Get the note content from the input field and calculate word count
        const note = document.getElementById('noteInput').value.trim();
        const wordCount = note.split(/\s+/).length;

        // Check if the word count exceeds the maximum limit
        if (wordCount > MAX_WORDS) {
            alert(`Maximum limit of ${MAX_WORDS} words exceeded. Please shorten your note.`);
            return;
        }

        // Sanitize the note content to ensure safety
        const sanitizedNote = sanitizeInput(note);

        // Get the current date and time for the note's metadata
        const currentDate = new Date();
        const day = currentDate.toLocaleString('default', { weekday: 'long' });
        const date = currentDate.getDate();
        const month = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();
        const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Create the note content with metadata
        const noteWithMetadata = `<p><strong>${day}, ${date} ${month} ${year} - ${time}</strong></p>${sanitizedNote}`;

        // Send the note to the backend for saving
        fetch('saveNotes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: noteWithMetadata })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    document.getElementById('noteInput').value = ''; // Clear the input field
                } else {
                    alert(`Error: ${data.message}`);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Function to fetch and display notes in the modal
    function viewNotes() {
        // Fetch notes from the backend
        fetch('saveNotes.php?view=true')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    if (data.notes.length > 0) {
                        // Generate HTML content for each note
                        const notesContent = data.notes.map((note, index) =>
                            `<div class="note-metadata">${note.date}</div>
                             <div class="note-item">
                                <input type="checkbox" class="note-checkbox" value="${index}">
                                <div class="note-text">${note.note}</div>
                             </div>`
                        ).join('');
                        document.getElementById('notesContent').innerHTML = notesContent;
                    } else {
                        document.getElementById('notesContent').innerHTML = '<p>No notes saved yet!</p>';
                    }
                    // Display the notes modal
                    document.getElementById('notesModal').style.display = 'block';
                    document.getElementById('notesOverlay').style.display = 'block';
                } else {
                    alert(data.message || 'Error fetching notes.');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Function to delete selected notes
    function deleteSelectedNotes() {
        // Get all checked checkboxes and their indices
        const checkboxes = document.querySelectorAll('.note-checkbox:checked');
        const selectedIndices = Array.from(checkboxes).map(checkbox => checkbox.value);

        // Check if no notes are selected
        if (selectedIndices.length === 0) {
            alert('No notes selected for deletion.');
            return;
        }

        // Confirm the deletion
        if (confirm('Are you sure you want to delete the selected notes?')) {
            // Send the selected indices to the backend for deletion
            fetch('saveNotes.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ indices: selectedIndices })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert(data.message);
                        viewNotes(); // Refresh the notes list
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    }

    // Function to clear all notes
    function clearAllNotes() {
        // Confirm the deletion of all notes
        if (confirm('Are you sure you want to delete all notes?')) {
            // Send a request to clear all notes
            fetch('saveNotes.php?clear=true', { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert(data.message);
                        document.getElementById('notesContent').innerHTML = '<p>No notes saved yet!</p>';
                    } else {
                        alert(`Error: ${data.message}`);
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    }

    // Function to close the notes modal
    function closeNotesModal() {
        document.getElementById('notesModal').style.display = 'none';
        document.getElementById('notesOverlay').style.display = 'none';
    }

    // Function to open the credits modal
    function openCreditsModal() {
        document.getElementById('creditsModal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }

    // Function to close the credits modal
    function closeCreditsModal() {
        document.getElementById('creditsModal').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }
    