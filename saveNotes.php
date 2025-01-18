<?php
// Path to the JSON file where notes are stored
$file_path = 'notes.json';

// Handle POST requests (saving a new note)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode the incoming JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    // Check if the "note" field exists in the request
    if (isset($data['note'])) {
        // Create a new note with the current date and time
        $noteData = [
            'note' => $data['note'],
            'date' => date('Y-m-d H:i:s') // Format: YYYY-MM-DD HH:MM:SS
        ];

        // Load existing notes from the file, or initialize an empty array if the file doesn't exist
        $existingNotes = file_exists($file_path) ? json_decode(file_get_contents($file_path), true) : [];
        $existingNotes[] = $noteData; // Add the new note to the array

        // Save the updated notes back to the file
        if (file_put_contents($file_path, json_encode($existingNotes, JSON_PRETTY_PRINT))) {
            echo json_encode(['status' => 'success', 'message' => 'Note saved successfully!']);
        } else {
            // Handle file write errors
            echo json_encode(['status' => 'error', 'message' => 'Failed to save note.']);
        }
    } else {
        // Handle missing "note" field in the request
        echo json_encode(['status' => 'error', 'message' => 'Invalid note data.']);
    }

// Handle GET requests with the "view" parameter (retrieving all notes)
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['view'])) {
    // Check if the notes file exists
    if (file_exists($file_path)) {
        // Load and return the notes as JSON
        $notes = json_decode(file_get_contents($file_path), true);
        echo json_encode(['status' => 'success', 'notes' => $notes]);
    } else {
        // Handle the case where no notes are found
        echo json_encode(['status' => 'error', 'message' => 'No notes found.']);
    }

// Handle DELETE requests (deleting notes)
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Decode the incoming JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    // Check if the "clear" parameter is set (deleting all notes)
    if (isset($_GET['clear'])) {
        // Delete the notes file if it exists
        if (file_exists($file_path)) {
            unlink($file_path); // Remove the file
            echo json_encode(['status' => 'success', 'message' => 'All notes deleted successfully!']);
        } else {
            // Handle the case where there are no notes to delete
            echo json_encode(['status' => 'error', 'message' => 'No notes to delete.']);
        }

    // Handle the deletion of specific notes by their indices
    } elseif (isset($data['indices'])) {
        // Check if the notes file exists
        if (file_exists($file_path)) {
            // Load the existing notes from the file
            $existingNotes = json_decode(file_get_contents($file_path), true);

            // Remove notes based on the provided indices
            foreach ($data['indices'] as $index) {
                unset($existingNotes[$index]);
            }

            // Reindex the array after deletion
            $existingNotes = array_values($existingNotes);

            // Save the updated notes back to the file
            if (file_put_contents($file_path, json_encode($existingNotes, JSON_PRETTY_PRINT))) {
                echo json_encode(['status' => 'success', 'message' => 'Selected notes deleted successfully!']);
            } else {
                // Handle file write errors
                echo json_encode(['status' => 'error', 'message' => 'Failed to delete selected notes.']);
            }
        } else {
            // Handle the case where no notes file is found
            echo json_encode(['status' => 'error', 'message' => 'No notes found.']);
        }
    } else {
        // Handle invalid delete requests
        echo json_encode(['status' => 'error', 'message' => 'Invalid delete request.']);
    }

// Handle unsupported request methods
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
