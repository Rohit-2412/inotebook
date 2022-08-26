const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// Route 1:
// Get all the notes using: GET "/api/notes/fetchallnotes" Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured")
    }
})

// Route 2:
// Add a new note : POST "/api/notes/addnote" - Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {

    try {

        const { title, description, tag } = req.body;
        // if there are errors, then return bad request and the arrays
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();

        res.json(savedNote);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured")
    }

})


// Route 3:
// Update note : PUT "/api/notes/updatenote:id" - Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // Create a new note object
        const newNote = {};
        if (title) { newNote.title = title; }
        if (description) { newNote.description = description; }
        if (tag) { newNote.tag = tag; }

        // find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return require.status(404).send("Not found");
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured")
    }
})

// Route 4:
// Delete an existing note : DELETE "/api/notes/deletnote:id" - Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return require.status(404).send("Not found");
        }

        // Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ note: note, "Sucess": "Note has been deletd" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured")
    }
})
module.exports = router