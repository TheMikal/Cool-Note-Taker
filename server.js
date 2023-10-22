// imports
const path = require("path");
const express = require("express");
const fs = require("fs");

// Helper method for generating unique ids
const UUID = require("uniqid");

const PORT = process.env.PORT || 3001;

// Creates new app with express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("/public"));

// index page route
app.get("/", (req, res) =>
    res.sendFile(path.join(__dirname, "public/index.html"))
);

// A get route for the notes page
app.get("/notes", (req, res) =>
    res.sendFile(path.join(__dirname, "public/notes.html"))
);

// a route for getting the notes json data
app.get("/api/notes", function (req, res) {
    fs.readFile("db/db.json", "utf8", (err, data) => {
        var jsonData = JSON.parse(data);
        console.log(jsonData);
        res.json(jsonData);
    });
});

// read then append the newly added note to the json file
const rtaj = (content, file) => {
    fs.readFile(file, "utf8", (err, data) => {
        if (err) {
        console.error(err);
        } else {
        const noteData = JSON.parse(data);
        parsedData.push(content);
        newJsonNote(file, noteData);
        }
    });
};

// puts data in the json
const newJsonNote = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
        err ? console.error(err) : console.info(`note written to ${destination}`)
    );

// adds the note to the db.json file, and then returns the new note to the client
app.post("/api/notes", (req, res) => {
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
        title: title,
        text: text,
        id: UUID(),
        };

        rtaj(newNote, "db/db.json");

        const response = {
        status: "success",
        body: newNote,
        };

        res.json(response);
    } else {
        res.json("Couldn't post note");
    }
});

// delete by id route
app.delete("/api/notes/:id", (req, res) => {
    let id = req.params.id;
    let parsedData;
    fs.readFile("db/db.json", "utf8", (err, data) => {
        if (err) {
        console.error(err);
        } else {
        parsedData = JSON.parse(data);
        const filterData = parsedData.filter((note) => note.id !== id);
        newJsonNote("db/db.json", filterData);
        }
    });
    res.send(`Destroyed note id: ${req.params.id}`);
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);