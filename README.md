# CSW430 Snack Demo — Event Management

A single Expo project, laid out exactly the way [Expo Snack](https://snack.expo.dev/) expects,
so it can be imported straight from GitHub.

A worked answer to the previous CSW430 final paper: an Event Management app on
`dummyjson.com/posts`, covering all four questions — four screens, React Navigation, full CRUD,
validation and caught errors.

## Import into Snack

Open [snack.expo.dev](https://snack.expo.dev/) → **⋯** menu → **Import git repository** → paste:

```
https://github.com/LeTrietHuan-Student/CSW430-Snack-Demo
```

**The repository must be public.** Snack fetches anonymously; against a private repo it fails
with *"not a properly formatted Expo project"*, which points at the wrong problem entirely.

## Layout

Snack needs `App.js` at the repository root and does not look inside subfolders. That is the
only reason this repo exists separately from the practice-kit repo.

```
App.js                  stack navigator, 4 routes
api.js                  BASE_URL + the five calls
EventsContext.js        the list, shared across screens
package.json            the four packages Snack installs
app.json                Expo project name
screens/
├── HomeScreen.js       GET list · Details / Edit / Delete
├── DetailScreen.js     GET one
├── AddEventScreen.js   POST + validation
└── EditEventScreen.js  PUT, prefilled
```

Nothing else lives here on purpose. Extra folders would make Snack scan them for imports and
install packages the demo never uses.

## What each question of the paper needed

| Q | Requirement | Where |
|---|---|---|
| 1 | Four screens designed | `screens/` |
| 2 | GET list, GET one, POST, PUT, DELETE | `api.js` + each screen |
| 3 | Title ≥ 3, description ≥ 10, caught save errors | `AddEventScreen`, `EditEventScreen` |
| 4 | React Navigation joining the screens | `App.js` |

## Four traps in that paper

Worth reading even when the API changes — these shapes recur.

**The paper's POST URL was wrong.** It printed `POST /posts`; the endpoint that works is
`POST /posts/add`. Following the paper gives an error that looks like your own bug.

**dummyjson simulates every write.** POST, PUT and DELETE return correct-looking objects and
persist nothing. So "refresh the list to include the new event" cannot work by refetching —
`EventsContext.js` merges the returned object into local state instead, which is what makes the
screens behave as described.

**`reactions` arrives as an object or a number.** The paper named both cases, so the marker is
looking for the `typeof` check. It's in `reactionsLabel()` in `api.js`.

**The cover image is random per load, not per event.** `seed/${id}` would freeze each event's
picture forever. `randomImage()` generates a fresh seed as the response is mapped.

## Running it

Snack installs these on import:

```
@react-navigation/native
@react-navigation/native-stack
react-native-screens
react-native-safe-area-context
```

Build the navigator first in any exam — it was 10 marks on its own and takes five minutes with
nothing else finished.
