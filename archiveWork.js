require("dotenv").config();
const { knex } = require("./auth");

async function archiveOrRestore(userId, noteId, archived) {
  const archiving = await knex("notes").select()
    .where({
      id: noteId,
      user_id: userId,
      is_active: !archived
    }).limit(1);
  if (!archiving.length) return;
  await knex("notes").where({ id: noteId })
    .update({ is_active: archived });
  return "Successful opearation";
}

async function deleteNote(userId, noteId) {
  const deleted = await knex("notes").where({
    id: noteId,
    user_id: userId,
    is_active: false
  }).del(['id']);
  if (!deleted.length) return;
  return true;
}

async function deleteAllArchivedNotes(userId) {
  const deleted = await knex("notes").where({
    user_id: userId,
    is_active: false
  }).del(['id']);
  if (!deleted.length) return;
  return true;
}

module.exports = {
  archiveOrRestore,
  deleteNote,
  deleteAllArchivedNotes
};
