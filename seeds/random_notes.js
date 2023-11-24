/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('notes').del()
  await knex('notes').insert([
    {
      user_id: 1,
      created: new Date(Date.now() - 7889800000),
      is_active: true,
      title: "Very old note",
      note_text: "This note is very old"
    },
    {
      user_id: 1,
      created: new Date(Date.now() - 2649800000),
      is_active: true,
      title: "Old note",
      note_text: "This note is old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 2",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 3",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 4",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 5",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 6",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 7",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 8",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 9",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 10",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 11",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 12",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 13",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 14",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 15",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 16",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 17",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 18",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 19",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 20",
      note_text: "This note is not old"
    },
    {
      user_id: 1,
      created: new Date(),
      is_active: true,
      title: "New note 21",
      note_text: "This note is not old"
    },
  ]);
};
