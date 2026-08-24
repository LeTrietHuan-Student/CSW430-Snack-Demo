# KAMI — Snack demo 3

The **token authentication** rehearsal. Labs 5–7 run on the course's own backend, which — unlike
`dummyjson` — makes you log in first and send a token with every later request.

One file, zero dependencies. Same paste-and-run shape as Demos 1 and 2.

Login: **0373007856** / **123**

---

## Why this exists

Neither past paper needed a login. Both used `dummyjson`, wide open, no headers. So Demos 1 and
2 never show you how to carry a token — and that is the one shape they cannot teach.

| | Demos 1 & 2 | This demo |
|---|---|---|
| Auth | none | login → Bearer token |
| Writes | simulated, discarded | **real, they persist** |
| Backend | always up | free Render instance, sleeps when idle |
| Seen in an exam? | yes, twice | not yet |

Treat it as insurance. If tomorrow's API is open, Demos 1 and 2 are the closer match, and this
one is 15 minutes of extra reading. If it needs a login, this is the only thing that helps.

## The whole auth pattern — lines 48–67

The token lives in state; one helper attaches it to every request. That's all there is to it.

```js
const [token, setToken] = useState(null);

const request = async (path, options = {}, overrideToken) => {
  const active = overrideToken || token;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(active ? { Authorization: `Bearer ${active}` } : {}),
      ...(options.headers || {}),
    },
  });
  ...
};
```

Log in, store the token, and every later call is authenticated without another thought:

```js
const body = await request('/auth', {
  method: 'POST',
  body: JSON.stringify({ phone, password }),
});
const t = body?.token || body?.accessToken || body?.data?.token;
setToken(t);
```

**Three things worth copying exactly:**

**The token field is a guess.** Line 79 tries `token`, `accessToken`, then `data.token`, because
no paper documents which one comes back. If login fails, the error prints the actual response so
you can see the real field name and fix that one line.

**`overrideToken` exists for a reason.** React state updates are not immediate — right after
`setToken(t)`, `token` is still `null` inside the same function. So the first load passes the
token directly: `loadItems(t)`. Without that, your first request after login goes out
unauthenticated and 401s, which looks like the login failed. This trips people up constantly.

**Read the body as text, then parse.** Line 58 does `res.text()` inside a `try/catch` before
`JSON.parse`. Error responses are often HTML or empty, and calling `res.json()` on those throws
a confusing parse error instead of your real status code.

## Where to change things

| What | Line |
|---|---|
| `BASE_URL` | 17 |
| `LOGIN_PATH` | 18 |
| `RESOURCE` | 19 |
| Error messages | 22–25 |
| Login body — `{ phone, password }` | 77 |
| Token field extraction | 79 |
| Header scheme — `Bearer` | 54 |
| List unwrapping — `body.data` | 69 |
| Validation rules | 137–138 |

Some APIs use `Token abc` or `x-auth-token` rather than `Bearer abc` — line 54 is the only place
that decides.

Fields used: `_id`, `name`, `price`, `createdBy`, `createdAt`, `updatedAt`. Note **`_id`**, not
`id` — this is Mongo-backed, unlike dummyjson.

## The backend sleeps

It's a free Render instance. The first request after a quiet spell takes 30–60 seconds or times
out entirely. **Try twice before assuming anything is broken**, and if you're demoing it, wake it
up a few minutes beforehand by loading the login screen.

I could not reach it from where this was written, so unlike Demos 1 and 2 the requests here are
unverified against a live server. The shapes come from the Lab 5–7 papers.

## Adding React Navigation — Q4

Same as the other demos: split the screens into files and wrap them in a stack.

**`@react-navigation/stack`, never `native-stack`** — the latter cannot be bundled by Snack.

```js
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
```

With a login screen there's one extra move: after a successful login, replace the stack rather
than pushing onto it, so Back can't return to the login form.

```js
navigation.reset({ index: 0, routes: [{ name: 'List' }] });
```
