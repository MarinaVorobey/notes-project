require("dotenv").config();
const { knex } = require("./auth");

const showdown = require("showdown");
const converter = new showdown.Converter({ emoji: true });

const fs = require("fs");
const defaultText = fs.readFileSync("./defaultNote.txt").toString();

async function getNotes(userId, options) {
  const hasNote = await knex("notes")
    .select().where({ user_id: userId }).limit(1);
  if (!hasNote.length) {
    const defaultNote = await addNote(userId, "Ваша первая заметка", defaultText);
    return {
      data: defaultNote,
      hasMore: false
    };
  }
  const isActive = options.age !== "archive";
  let notes;
  if (options.search) {
    notes = await knex("notes")
      .orderBy("created", "desc")
      .select()
      .where({
        user_id: userId,
        is_active: isActive
      })
      .andWhereILike("title", `%${options.search}%`)
      .limit(20 * options.page + 1);
  } else {
    notes = await knex("notes")
      .orderBy("created", "desc")
      .select()
      .where({
        user_id: userId,
        is_active: isActive
      })
      .limit(20 * options.page + 1);
  }

  if (options.age !== "alltime" && options.age !== "archive") {
    const duration = (options.age === "3months") ? 7889400000 : 2629800000;
    notes = notes.filter((note) => Date.now() - new Date(note.created) <= duration);
  }

  const hasMore = notes.length > options.page * 20;
  if (options.page > 1) {
    notes = notes.slice((options.page - 1) * 20, notes.length);
  }
  if (hasMore) notes.pop();

  if (options.search) {
    const regex = new RegExp(`(${options.search})`, "gi");
    notes = notes.map((note) => {
      const titleFormatted = note.title
        .replace(regex, "<mark>$&</mark>");
      return {
        _id: note.id,
        isActive: note.is_active,
        created: note.created,
        highlights: titleFormatted,
        html: note.note_text
      }
    });
  } else {
    notes = notes.map((note) => {
      return {
        _id: note.id,
        isActive: note.is_active,
        created: note.created,
        title: note.title,
        html: note.note_text
      }
    });
  }
  return {
    data: notes,
    hasMore
  };
}

async function getNote(userId, noteId) {
  const note = await knex("notes")
    .select()
    .where({
      id: noteId,
      user_id: userId
    }).limit(1);
  if (!note.length) return;
  return {
    _id: noteId,
    isActive: note[0].is_active,
    isArchived: !note[0].is_active,
    created: note[0].created,
    title: note[0].title,
    html: note[0].note_text
  };
}

async function addNote(userId, title, text) {
  const formattedText = converter.makeHtml(text);
  const creationTime = new Date();
  const newNote = await knex("notes").insert({
    user_id: userId,
    created: creationTime,
    is_active: true,
    title,
    note_text: formattedText
  }).returning("id");
  return {
    _id: newNote[0].id,
    isActive: true,
    created: creationTime,
    title,
    html: formattedText
  };
}

async function editNote(userId, noteId, title, text) {
  const editing = await knex("notes").select()
    .where({
      id: noteId,
      user_id: userId
    }).limit(1);
  if (!editing.length) return;
  const formattedText = converter.makeHtml(text);
  await knex("notes").where({ id: noteId })
    .update({
      title,
      note_text: formattedText
    });
  return {
    _id: noteId,
    isActive: editing[0].is_active,
    created: editing[0].created,
    title: title,
    html: formattedText
  };
}

module.exports = {
  getNotes,
  getNote,
  addNote,
  editNote
};
