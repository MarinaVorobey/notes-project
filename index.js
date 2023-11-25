require("dotenv").config();
const express = require("express");
const nunjucks = require("nunjucks");
const puppeteer = require("puppeteer");
const cookieParser = require("cookie-parser");
const {
  hash,
  auth,
  findUserByUsername,
  createUser,
  createSession,
  clearSessions,
  deleteSession
} = require("./auth");
const { getNotes, getNote, addNote, editNote } = require("./notesWork");
const {
  archiveOrRestore,
  deleteNote,
  deleteAllArchivedNotes
} = require("./archiveWork");
// const { create } = require("core-js/core/object");

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.set("view engine", "njk");
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

// Section "Authentication"
app.get("/", auth(), (req, res) => {
  if (req.user) return res.redirect("/dashboard");
  res.render("index", {
    authError:
      req.query.authError !== "true"
        ? req.query.authError
        : req.query.userOverwrite === "true"
          ? "Пользователь с таким именем уже существует"
          : req.query.emptyValue === "true"
            ? "Введите имя пользователя и пароль"
            : "Неверное имя пользователя или пароль"
  });
});

app.get("/dashboard", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");
  res.render("dashboard", {
    user: req.user
  });
});

app.post("/login", express.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const user = await findUserByUsername(username);
  if (!user || user.password !== hash(password)) {
    return res.redirect("/?authError=true");
  }

  const sessionId = await createSession(user.id);
  res.cookie("notesSessionId", sessionId.id, { httpOnly: true, maxAge: 7200000 }).redirect("/dashboard");
});

app.post("/signup", express.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  if (!username.length || !password.length) {
    return res.redirect("/?authError=true&emptyValue=true");
  }
  const user = await findUserByUsername(username);
  if (user) {
    return res.redirect("/?authError=true&userOverwrite=true");
  }

  const newUserId = await createUser(username, password);
  const sessionId = await createSession(newUserId);
  res.cookie("notesSessionId", sessionId.id, { httpOnly: true, maxAge: 7200000 }).redirect("/dashboard");
});

app.get("/logout", auth(), async (req, res) => {
  if (!req.user) return res.redirect("/");
  await deleteSession(req.user.id);
  res.clearCookie("notesSessionId").redirect("/");
});
// End of section "Authentication"

// Section "Working with notes"
app.get("/dashboard/notes", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");

  function codePointsToText(str) {
    const codePoints = str.split("_");
    return String.fromCodePoint(...codePoints);
  }
  let textFormatted;
  if (req.headers.search) {
    textFormatted = codePointsToText(req.headers.search);
  }

  const notes = await getNotes(req.user.id, {
    age: req.headers.age,
    page: req.headers.page,
    search: textFormatted
  });
  res.json(notes);
});

app.get("/dashboard/note/:id", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");
  if (!req.params.id.match(/^\d+$/)) return res.status(404)
    .send("Invalid note id");
  const note = await getNote(req.user.id, req.params.id);
  if (!note) return res.sendStatus(404);
  res.json(note);
});

app.post("/dashboard/new", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");
  if (req.body.text.length > 8000) {
    return res.status(413)
      .send("Text is too long. Maximum length allowed is 8000 charachers.");
  }
  const newNote = await addNote(req.user.id, req.body.title, req.body.text);
  res.json(newNote);
});

app.patch("/dashboard/note/:id/edit", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");
  if (!req.params.id.match(/^\d+$/)) return res.sendStatus(404);
  const edited = await editNote(req.user.id, req.params.id, req.body.title, req.body.text);
  if (!edited) return res.sendStatus(404);
  res.json(edited);
});
// End of section "Working with notes"

// Section "Working with archive"
app.patch("/dashboard/note/:id/archive", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");
  if (!req.params.id.match(/^\d+$/)) return res.sendStatus(404);
  const archived = await archiveOrRestore(req.user.id, req.params.id, false);
  if (!archived) return res.sendStatus(404);
  res.json(archived);
});

app.patch("/dashboard/note/:id/restore", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");
  if (!req.params.id.match(/^\d+$/)) return res.sendStatus(404);
  const unarchived = await archiveOrRestore(req.user.id, req.params.id, true);
  if (!unarchived) return res.sendStatus(404);
  res.json(unarchived);
});

app.delete("/dashboard/note/:id/delete", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");
  if (!req.params.id.match(/^\d+$/)) return res.sendStatus(404);
  const deleted = await deleteNote(req.user.id, req.params.id);
  if (!deleted) return res.sendStatus(404);
  res.json(204);
});

app.delete("/dashboard/notes/delete_all", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");
  const deleted = await deleteAllArchivedNotes(req.user.id);
  if (!deleted) return res.sendStatus(404);
  res.json(204);
});
// End of section "Working with archive"

// Section "PDF"
app.get("/dashboard/note/:id/download_pdf", auth(), async (req, res) => {
  if (!req.user) return res.status(401).redirect("/");
  if (!req.params.id.match(/^\d+$/)) return res.sendStatus(404);
  const note = await getNote(req.user.id, req.params.id);
  if (!note) return res.sendStatus(404);

  async function printPDF() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(`
    <html>
        <head>
          <title>Note ${req.params.id}</title>
        </head>
        <body>
           ${note.html}
        </body>
    </html>`);
    const pdf = await page.pdf({ format: "A4" });

    await page.close();
    await browser.close();
    return pdf;
  }

  printPDF().then(pdf => {
    res.set({ "Content-Type": "application/pdf", "Content-Length": pdf.length });
    res.send(pdf);
  });
});
// End of section "PDF"

setInterval(clearSessions, 7200000);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`  Listening on ${port}`);
});
