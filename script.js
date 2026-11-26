let notes = [];
let selectedNote = -1;
let selectedDay = null;

const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const notesList = document.getElementById("notes-list");
const searchInput = document.getElementById("search");

const newBtn = document.getElementById("new-note");
const deleteBtn = document.getElementById("delete");

const exportBtn = document.getElementById("export-notes");
const importBtn = document.getElementById("import-notes");
const importFile = document.getElementById("import-file");

const calendarGrid = document.getElementById("calendar-grid");
const addWeekBtn = document.getElementById("add-week");

const modal = document.getElementById("day-modal");
const closeModal = document.getElementById("close-modal");
const modalDate = document.getElementById("modal-date");
const dayNoteInput = document.getElementById("day-note");

/* ---------- STARTUP ---------- */

loadNotes();
renderNotes();

/* ---------- DATE HELPERS ---------- */

function getCurrentSunday() {
    const today = new Date();

    const sunday = new Date(today);

    sunday.setHours(0, 0, 0, 0);

    sunday.setDate(
        sunday.getDate() - sunday.getDay()
    );

    return sunday;
}

function formatDate(dateString) {
    const d = new Date(dateString);

    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function createWeek(startDate) {

    const result = [];

    const current = new Date(startDate);

    for (let i = 0; i < 7; i++) {

        result.push({
            date: current.toISOString(),
            note: ""
        });

        current.setDate(
            current.getDate() + 1
        );
    }

    return result;
}

function createDefaultCalendar() {

    return createWeek(
        getCurrentSunday()
    );
}

function createNewNote() {

    return {
        title: "",
        content: "",
        calendar: createDefaultCalendar()
    };
}

/* ---------- STORAGE ---------- */

function saveNotes() {

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );
}

function loadNotes() {

    const stored =
        localStorage.getItem("notes");

    if (stored) {

        try {

            notes =
                JSON.parse(stored);

        } catch {

            notes = [];
        }
    }
}

/* ---------- NOTE LIST ---------- */

function renderNotes(filter = "") {

    notesList.innerHTML = "";

    notes.forEach((note, index) => {

        const search =
            filter.toLowerCase();

        const matches =

            !search ||

            (note.title || "")
                .toLowerCase()
                .includes(search) ||

            (note.content || "")
                .toLowerCase()
                .includes(search);

        if (!matches) {
            return;
        }

        const li =
            document.createElement("li");

        li.textContent =
            note.title ||
            "Untitled Note";

        if (index === selectedNote) {
            li.classList.add("active");
        }

        li.addEventListener(
            "click",
            () => {

                openNote(index);
            }
        );

        notesList.appendChild(li);
    });
}

function openNote(index) {

    selectedNote = index;

    titleInput.value =
        notes[index].title || "";

    contentInput.value =
        notes[index].content || "";

    renderNotes(
        searchInput.value
    );

    renderCalendar();
}

/* ---------- MAIN NOTE ---------- */

function autoSaveMainNote() {

    if (selectedNote < 0) {

        notes.push(
            createNewNote()
        );

        selectedNote =
            notes.length - 1;
    }

    notes[selectedNote].title =
        titleInput.value;

    notes[selectedNote].content =
        contentInput.value;

    saveNotes();

    renderNotes(
        searchInput.value
    );
}

titleInput.addEventListener(
    "input",
    autoSaveMainNote
);

contentInput.addEventListener(
    "input",
    autoSaveMainNote
);

/* ---------- CALENDAR ---------- */

function renderCalendar() {

    calendarGrid.innerHTML = "";

    if (selectedNote < 0) {
        return;
    }

    const calendar =
        notes[selectedNote].calendar;

    calendar.forEach(day => {

        const cell =
            document.createElement("div");

        cell.className =
            "day-cell";

        if (
            day.note &&
            day.note.trim()
        ) {
            cell.classList.add(
                "has-content"
            );
        }

        let preview =
            day.note || "";

        if (
            preview.length > 120
        ) {
            preview =
                preview.substring(
                    0,
                    120
                ) + "...";
        }

        preview =
            preview.replaceAll(
                "\n",
                "<br>"
            );

        cell.innerHTML = `
            <div class="day-date">
                ${formatDate(day.date)}
            </div>

            <div class="day-preview">
                ${preview}
            </div>
        `;

        cell.addEventListener(
            "click",
            () => {

                selectedDay = day;

                modalDate.textContent =
                    formatDate(
                        day.date
                    );

                dayNoteInput.value =
                    day.note;

                modal.classList.remove(
                    "hidden"
                );
            }
        );

        calendarGrid.appendChild(
            cell
        );
    });
}

/* ---------- ADD WEEK ---------- */

addWeekBtn.addEventListener(
    "click",
    () => {

        if (
            selectedNote < 0
        ) {
            return;
        }

        const calendar =
            notes[selectedNote]
                .calendar;

        const lastDate =
            new Date(
                calendar[
                    calendar.length - 1
                ].date
            );

        lastDate.setDate(
            lastDate.getDate() + 1
        );

        const nextWeek =
            createWeek(
                lastDate
            );

        calendar.push(
            ...nextWeek
        );

        saveNotes();

        renderCalendar();
    }
);

/* ---------- DAY NOTES ---------- */

dayNoteInput.addEventListener(
    "input",
    () => {

        if (!selectedDay) {
            return;
        }

        selectedDay.note =
            dayNoteInput.value;

        saveNotes();

        renderCalendar();
    }
);

/* ---------- MODAL ---------- */

closeModal.addEventListener(
    "click",
    () => {

        modal.classList.add(
            "hidden"
        );
    }
);

modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            modal.classList.add(
                "hidden"
            );
        }
    }
);

/* ---------- NEW NOTE ---------- */

newBtn.addEventListener(
    "click",
    () => {

        selectedNote = -1;

        titleInput.value = "";
        contentInput.value = "";

        calendarGrid.innerHTML = "";

        titleInput.focus();
    }
);

/* ---------- DELETE NOTE ---------- */

deleteBtn.addEventListener(
    "click",
    () => {

        if (
            selectedNote < 0
        ) {
            return;
        }

        notes.splice(
            selectedNote,
            1
        );

        selectedNote = -1;

        titleInput.value = "";
        contentInput.value = "";

        calendarGrid.innerHTML = "";

        saveNotes();

        renderNotes();
    }
);

/* ---------- SEARCH ---------- */

searchInput.addEventListener(
    "input",
    () => {

        renderNotes(
            searchInput.value
        );
    }
);

/* ---------- EXPORT ---------- */

exportBtn.addEventListener(
    "click",
    () => {

        const data =
            JSON.stringify(
                notes,
                null,
                2
            );

        const blob =
            new Blob(
                [data],
                {
                    type:
                    "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                "a"
            );

        a.href = url;

        a.download =
            "my-notes-backup.json";

        a.click();

        URL.revokeObjectURL(
            url
        );
    }
);

/* ---------- IMPORT ---------- */

importBtn.addEventListener(
    "click",
    () => {
        importFile.click();
    }
);

importFile.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        const reader =
            new FileReader();

        reader.onload =
            function(e) {

                try {

                    notes =
                        JSON.parse(
                            e.target.result
                        );

                    saveNotes();

                    selectedNote = -1;

                    titleInput.value =
                        "";

                    contentInput.value =
                        "";

                    calendarGrid.innerHTML =
                        "";

                    renderNotes();

                    alert(
                        "Notes imported successfully."
                    );

                } catch {

                    alert(
                        "Invalid backup file."
                    );
                }
            };

        reader.readAsText(file);
    }
);