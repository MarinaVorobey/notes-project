const PREFIX = `${location.protocol}//${location.host}/dashboard`;

const req = (url, options = {}) => {
  const { body } = options;

  return fetch((PREFIX + url).replace(/\/\/$/, ""), {
    ...options,
    body: body ? JSON.stringify(body) : null,
    headers: {
      ...options.headers,
      ...(body
        ? {
          "Content-Type": "application/json",
        }
        : null),
    },
  }).then((res) =>
    res.ok
      ? res.json()
      : res.text().then((message) => {
        throw new Error(message);
      })
  );
};

export const getNotes = async ({ age, search, page } = {}) => {
  function textToCodePoints(str) {
    const output = [];
    for (let i = 0; i < str.length; i++) {
      output.push(str.codePointAt(i));
    }
    return output.join("_");
  }
  if (search) {
    search = textToCodePoints(search);
  }

  const res = await req("/notes", {
    headers: { age, search, page },
    method: "GET"
  });
  return res;
};

export const createNote = async (title, text) => {
  const res = await req("/new", {
    body: { title, text },
    method: "POST"
  });
  return res;
};

export const getNote = async (id) => {
  const res = await req(`/note/${id}`, {
    method: "GET"
  });
  return res;
};

export const archiveNote = async (id) => {
  const res = await req(`/note/${id}/archive`, {
    method: "PATCH"
  });
  return res;
};

export const unarchiveNote = async (id) => {
  const res = await req(`/note/${id}/restore`, {
    method: "PATCH"
  });
  return res;
};

export const editNote = async (id, title, text) => {
  const res = await req(`/note/${id}/edit`, {
    body: { title, text },
    method: "PATCH"
  });
  return res;
};

export const deleteNote = async (id) => {
  const res = await req(`/note/${id}/delete`, {
    method: "DELETE"
  });
  return res;
};

export const deleteAllArchived = async () => {
  const res = await req("/notes/delete_all", {
    method: "DELETE"
  });
  return res;
};

export const notePdfUrl = (id) => {
  return `${PREFIX}/note/${id}/download_pdf`;
};
