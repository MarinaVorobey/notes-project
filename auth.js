require("dotenv").config();
const crypto = require("crypto");
const knex = require("knex")({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
});

function hash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function findUserBySessionId(sessionId) {
  const userId = await knex("sessions")
    .select("user_id")
    .where({ id: sessionId })
    .limit(1);
  const user = await knex("users")
    .select("id", "username")
    .where({ id: userId[0].user_id })
    .limit(1);
  return user[0];
}

function auth() {
  return async (req, res, next) => {
    if (!req.cookies["notesSessionId"]) {
      return next();
    }
    const user = await findUserBySessionId(req.cookies["notesSessionId"]);
    if (!user) {
      return next();
    }
    req.user = user;
    next();
  };
}

async function findUserByUsername(username) {
  const user = await knex("users").select().where({ username }).limit(1);
  return user[0];
}

async function createUser(username, password) {
  await knex("users").insert({
    username: username,
    password: hash(password)
  });
  const user = await findUserByUsername(username);
  return user.id;
}

async function createSession(userId) {
  const existingSessions = await knex("sessions")
    .select("id")
    .where({ user_id: userId })
    .limit(1);
  if (existingSessions.length) {
    return existingSessions[0];
  }

  await knex("sessions").insert({
    user_id: userId,
    expires: new Date(Date.now() + 7200000)
  });
  const sessionId = await knex("sessions")
    .select("id")
    .where({ user_id: userId })
    .limit(1);
  return sessionId[0];
}

async function deleteSession(id) {
  return knex("sessions").where({ user_id: id }).delete();
}

async function clearSessions() {
  const sessions = await knex("sessions").select("id", "expires");
  const expired = [];
  for (const session of sessions) {
    if (new Date(session.expires) - Date.now() <= 0) {
      expired.push(session.id);
    }
  }
  knex("sessions").whereIn("id", expired).delete();
}

module.exports = {
  knex,
  hash,
  auth,
  findUserByUsername,
  createUser,
  createSession,
  clearSessions,
  findUserBySessionId,
  deleteSession
};
