export const BASE_URL = 'https://dummyjson.com';
export const RESOURCE = '/posts';

export const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = text;
  }
  if (!res.ok) throw new Error((body && body.message) || `HTTP ${res.status}`);
  return body;
};

export const getEvents = async () => {
  const body = await request(RESOURCE);
  return Array.isArray(body) ? body : body.posts || [];
};

export const getEvent = (id) => request(`${RESOURCE}/${id}`);

export const addEvent = (data) =>
  request(`${RESOURCE}/add`, { method: 'POST', body: JSON.stringify(data) });

export const updateEvent = (id, data) =>
  request(`${RESOURCE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteEvent = (id) => request(`${RESOURCE}/${id}`, { method: 'DELETE' });

export const randomImage = () =>
  `https://picsum.photos/seed/${Math.floor(Math.random() * 100000)}/600/360`;

export const preview = (text, n = 120) => {
  if (!text) return '';
  return text.length > n ? text.slice(0, n).trim() + '...' : text;
};

export const reactionsLabel = (reactions) => {
  if (reactions && typeof reactions === 'object') {
    return `Likes: ${reactions.likes ?? 0} · Dislikes: ${reactions.dislikes ?? 0}`;
  }
  return `Reactions: ${reactions ?? 0}`;
};

export const PRIMARY = '#2E6BE6';
