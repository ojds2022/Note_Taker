const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req, res) => { // serve the index.html file
    try {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

app.get('/notes', (req, res) => { // serve the notes.html file
    try {
        res.sendFile(path.join(__dirname, 'public', 'notes.html'));
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

app.get('/api/notes', (req, res) => { // api route to get notes
    try {
        const filePath = path.join(__dirname, 'db', 'db.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const notes = JSON.parse(data);
        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

app.post('/api/notes', (req, res) => { // api route to save a new note
    try {
        const filePath = path.join(__dirname, 'db', 'db.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const notes = JSON.parse(data);

        const newNote = req.body; // add the new note from the request body
        if (!newNote.title || !newNote.text) {
            return res.status(400).json({ error: 'Bad Request', message: 'Note must have a title and text' });
        }
        notes.push(newNote);

        fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8'); // write the updated notes array back to the file

        res.status(201).json(newNote); // respond with the new note
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

app.delete('/api/notes/:id', (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        const filePath = path.join(__dirname, 'db', 'db.json');
        const data = fs.readFileSync(filePath, 'utf8');
        let notes = JSON.parse(data);

        const newNotes = notes.filter(note => note.id !== noteId); // filter out the note with the specified ID

        fs.writeFileSync(filePath, JSON.stringify(newNotes, null, 2), 'utf8'); // write the updated notes array back to the file

        res.json({ message: 'Note deleted successfully' }); // respond with a success message
    } catch (err) {
        console.error(`Error deleting note: ${err}`);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

app.listen(PORT, () => console.log(`Now listening on http://localhost:${PORT}/`));