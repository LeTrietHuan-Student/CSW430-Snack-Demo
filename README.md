# CSW430 Snack demos

Worked answers to two past papers. Each is a single `App.js` importing only `react` and
`react-native`, so Snack never runs its bundler and the dependency errors cannot happen.

| Demo | Covers | Where |
|---|---|---|
| **Event Management** | GET/POST/PUT/DELETE on `dummyjson.com/posts`, 4 screens, 2 forms | `App.js` (this folder) |
| **User Management** | GET only on `dummyjson.com/users`, 3 screens, no forms | `Demo2-UserManagement/` |
| **KAMI** | login → Bearer token, then CRUD | `Demo3-KamiAuth/` |

Demos 1 and 2 are worked answers to the two past papers. Demo 3 is insurance: neither past paper
needed a login, so nothing else here shows how to carry a token.

**To use either:** new Snack → paste its `App.js` over Snack's `App.js` → delete every other file
in the tree (`package.json`, `index.js`, `components/`, `screens/`, `assets/`) → Save.

Both cover Questions 1, 2 and 3 of their paper. Question 4 needs React Navigation — each README
has the snippet.

## What the two papers share

Same 40/40/10/10 split, same list → detail shape, same demand for exact error strings and
loading indicators on every screen, same `@react-navigation/stack` for Q4. Only the resource
changes. Build "list → detail, a GET each, real messages, a stack navigator" without thinking
and either paper is covered.

---

# Demo 1 — Event Management

Four screens, GET/POST/PUT/DELETE against `dummyjson.com/posts`, validation and caught errors.

---

## Where to change things

Line numbers are for the file as shipped.

### The API — lines 18–19

```js
const BASE_URL = 'https://dummyjson.com';
const RESOURCE = '/posts';
```

Change these two and every request follows. Nothing else holds a URL.

### Unwrapping the list — line 64

```js
const list = Array.isArray(body) ? body : body.posts || [];
```

Handles a bare `[...]` and `{"posts":[...]}`. For a different wrapper key, change `body.posts`
to `body.data`, `body.items`, or whatever the response uses. **Look at the JSON before you write
the screen** — 30 seconds in a browser saves ten minutes of guessing.

### The five calls

| Line | Call |
|---|---|
| 63 | `request(RESOURCE)` — list |
| 82 | `request(\`${RESOURCE}/${item.id}\`)` — one |
| 143 | `request(\`${RESOURCE}/add\`, { method: 'POST' })` — create |
| 135 | `request(\`${RESOURCE}/${current.id}\`, { method: 'PUT' })` — update |
| 165 | `request(\`${RESOURCE}/${item.id}\`, { method: 'DELETE' })` — delete |

**`/add` is dummyjson-specific.** Most APIs create with a plain `POST /resource`. Drop the
`/add` on line 143 unless the paper says otherwise.

### Field names

The app uses `title`, `body`, `tags` and `id`. If the data uses different names, change them in
these places and nowhere else:

| What | Lines |
|---|---|
| Reading into the edit form | 101, 102, 103 |
| The POST/PUT payload | 124–130 |
| Rendering a list row | 285, 286, 287 |
| The row key | 278 |
| Detail screen | 196–199 |

If the id is `_id` rather than `id`, replace `item.id` with `item._id` at lines 82, 165, 166, 278.

### Validation rules — lines 111–113

```js
if (title.trim().length < 3) next.title = 'Title must be at least 3 characters';
if (description.trim().length < 10) next.description = 'Description must be at least 10 characters';
```

Change the numbers and the message together — the marker looks for a message that names the
rule, not just a red border.

### Labels

| Text | Line |
|---|---|
| Header on the list | 262 |
| Screen titles | 210, 261 |
| Submit button | 251 |
| Delete confirm wording | 158 |

### Two defensive helpers

Line 37, `reactionsLabel` — handles a field arriving as an object *or* a number. Keep the shape
if a field can vary; delete it if not.

Line 33, `randomImage` — a fresh seed each load. If images come from the data instead, use
`item.image` and delete this.

---

## Adding React Navigation — Question 4, 10 marks

This demo switches screens with a `screen` state variable. That works, but earns nothing on Q4,
which asks for React Navigation by name.

**Use `@react-navigation/stack`, never `@react-navigation/native-stack`.** `native-stack` cannot
be bundled by Snack — it fails with pages of Flow syntax errors that look like your own code is
broken. The paper's own library list says `stack`. This cost an entire evening to discover.

Split the screens into their own files, then:

```js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import AddEventScreen from './screens/AddEventScreen';
import EditEventScreen from './screens/EditEventScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Events' }} />
        <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Event Detail' }} />
        <Stack.Screen name="AddEvent" component={AddEventScreen} options={{ title: 'Add Event' }} />
        <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

Inside a screen, `setScreen('detail')` becomes `navigation.navigate('Detail', { id: item.id })`,
and the back arrow becomes `navigation.goBack()`. Read params with `route.params`.

**Build the navigator first**, before any API work. Four screens showing nothing but their own
names, with working back — ten marks, five minutes, done before you write a single `fetch`.

Let Snack add the packages itself when it sees the imports. Do not hand-write `package.json`.

---

## Traps in the previous paper

- The paper printed `POST /posts`; the working endpoint is `POST /posts/add`.
- dummyjson **simulates** every write — nothing persists. Refetching after a POST will not show
  the new row, so the code merges the returned object into state instead.
- `reactions` arrives as an object *or* a number. The paper named both cases.
- The cover image is random **per load**, not per event.
- `native-stack` does not bundle on Snack. Use `stack`.
