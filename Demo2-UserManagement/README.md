# User Management — Snack demo 2

The **second** past paper: a read-only user browser on `dummyjson.com/users`. Three screens,
no create/edit/delete anywhere in it.

One file. Imports only `react` and `react-native`, so Snack never runs its bundler.

**To use:** new Snack → paste `App.js` over Snack's `App.js` → delete every other file in the
tree (`package.json`, `index.js`, `components/`, `screens/`, `assets/`) → Save.

Covers Questions 1, 2 and 3. Question 4 needs React Navigation — see the last section.

---

## How this paper differs from the Event one

| | Event paper | This paper |
|---|---|---|
| Operations | GET, POST, PUT, DELETE | **GET only** |
| Screens | 4 | 3 |
| Forms | two | none |
| Validation | title / description length | search box length |
| Awkward bit | writes that don't persist | avatars come from a **different** API |

No forms and no writes makes this the easier of the two. The marks move into error handling
and the three-level navigation chain.

## The screens

```
Users list  →  User detail  →  Cart detail
```

| Screen | Request |
|---|---|
| Users list | `GET /users?limit=0` |
| User detail | `GET /users/{id}` then `GET /users/{id}/carts` |
| Cart detail | `GET /carts/{cartId}` |

`?limit=0` returns all 208 users in one call, which is what fills the "Total 208" counter in
the screenshot. Without it you get 30.

## The avatar trick — line 32

The paper is explicit and it's the one thing you can't guess:

```js
const avatarFor = (user) => {
  const n = ((Number(user.id) - 1) % 99) + 1;
  const folder = user.gender === 'female' ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${folder}/${n}.jpg`;
};
```

Users come from dummyjson but **portraits come from randomuser.me**, chosen by gender. The
modulo keeps the id inside 1–99, which the paper asks for — ids above 99 would give broken
images.

`user.image` from dummyjson exists but is a cartoon avatar, not what the screenshots show.

## The five exact messages — lines 20–24

They're pulled into constants at the top because the paper prints them word for word, and a
marker comparing strings will notice a paraphrase.

```js
const ERR_NETWORK = "Couldn't load data. Please check your connection and try again.";
const ERR_NO_USERS = 'No users found.';
const ERR_NO_USER = 'User information not available.';
const ERR_NO_PRODUCTS = 'This cart has no products.';
const ERR_SEARCH_SHORT = 'Please enter at least 2 characters to search.';
```

Where each fires:

| Message | When |
|---|---|
| `ERR_SEARCH_SHORT` | search box holds exactly 1 character |
| `ERR_NO_USERS` | the filtered list is empty |
| `ERR_NO_USER` | `/users/{id}` returns nothing usable |
| `ERR_NO_PRODUCTS` | the cart has an empty `products` array |
| `ERR_NETWORK` | any request throws |

Every screen also shows an `ActivityIndicator` while loading and hides it after — Q3 asks for
that on all screens.

---

## Where to change things

| What | Line |
|---|---|
| `BASE_URL` | 17 |
| The five messages | 20–24 |
| Avatar rule | 32 |
| Users request + list key `body.users` | 63–65 |
| User detail + carts requests | 98, 102 |
| Cart request | 120 |
| Search filter (`firstName` + `lastName`) | 85–88 |
| Minimum search length | 80, 85 |

Field names used: `firstName`, `lastName`, `age`, `gender`, `email`, `username`, `phone`,
`address.city`, `company.name`, `company.title`. On products: `thumbnail`, `title`, `price`,
`quantity`, `total`, `discountedTotal`.

## Search is client-side

The full list is already loaded, so filtering is instant and costs no extra request. If a paper
demands a search *request*, dummyjson has `GET /users/search?q=` — swap the filter on lines
85–88 for that call.

---

## Adding React Navigation — Question 4, 10 marks

This demo switches screens with a `screen` state variable. That works, but earns nothing on Q4,
which names React Navigation.

**Use `@react-navigation/stack`, never `@react-navigation/native-stack`.** `native-stack` cannot
be bundled by Snack — it dies with pages of Flow syntax errors that look like your own code is
broken. Both papers' library lists say `stack`.

Split the three screens into files, then:

```js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import UsersScreen from './screens/UsersScreen';
import UserDetailScreen from './screens/UserDetailScreen';
import CartDetailScreen from './screens/CartDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Users">
        <Stack.Screen name="Users" component={UsersScreen} options={{ title: 'Users' }} />
        <Stack.Screen name="UserDetail" component={UserDetailScreen} options={{ title: 'User Detail' }} />
        <Stack.Screen name="CartDetail" component={CartDetailScreen} options={{ title: 'Cart Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

`openUser(item)` becomes `navigation.navigate('UserDetail', { id: item.id })`, `openCart(c)`
becomes `navigation.navigate('CartDetail', { id: c.id })`, and each back arrow becomes
`navigation.goBack()`. Read the id with `route.params.id`.

**Build the navigator first**, before any fetching. Three screens showing nothing but their own
names, with working back — ten marks in five minutes.

Let Snack add the packages when it sees the imports. Do not hand-write `package.json`.
