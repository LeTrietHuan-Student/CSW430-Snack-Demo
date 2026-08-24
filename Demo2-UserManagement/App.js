import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';

const BASE_URL = 'https://dummyjson.com';
const PRIMARY = '#2E6BE6';

const ERR_NETWORK = "Couldn't load data. Please check your connection and try again.";
const ERR_NO_USERS = 'No users found.';
const ERR_NO_USER = 'User information not available.';
const ERR_NO_PRODUCTS = 'This cart has no products.';
const ERR_SEARCH_SHORT = 'Please enter at least 2 characters to search.';

const request = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const avatarFor = (user) => {
  const n = ((Number(user.id) - 1) % 99) + 1;
  const folder = user.gender === 'female' ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${folder}/${n}.jpg`;
};

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function App() {
  const [screen, setScreen] = useState('users');

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [query, setQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  const [user, setUser] = useState(null);
  const [carts, setCarts] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');

  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const body = await request('/users?limit=0');
      setUsers(body.users || []);
      setTotal(body.total || (body.users || []).length);
    } catch (e) {
      setUsersError(ERR_NETWORK);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onChangeQuery = (text) => {
    setQuery(text);
    const t = text.trim();
    setSearchError(t.length === 1 ? ERR_SEARCH_SHORT : '');
  };

  const visibleUsers = (() => {
    const t = query.trim().toLowerCase();
    if (t.length < 2) return users;
    return users.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(t)
    );
  })();

  const openUser = async (item) => {
    setScreen('user');
    setUser(null);
    setCarts([]);
    setUserError('');
    setUserLoading(true);
    try {
      const detail = await request(`/users/${item.id}`);
      if (!detail || !detail.id) throw new Error('missing');
      setUser(detail);
      try {
        const cartBody = await request(`/users/${item.id}/carts`);
        setCarts(cartBody.carts || []);
      } catch (e) {
        setCarts([]);
      }
    } catch (e) {
      setUserError(e.message === 'missing' ? ERR_NO_USER : ERR_NETWORK);
    } finally {
      setUserLoading(false);
    }
  };

  const openCart = async (item) => {
    setScreen('cart');
    setCart(null);
    setCartError('');
    setCartLoading(true);
    try {
      setCart(await request(`/carts/${item.id}`));
    } catch (e) {
      setCartError(ERR_NETWORK);
    } finally {
      setCartLoading(false);
    }
  };

  const Header = ({ label, onBack }) => (
    <View style={s.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack}>
          <Text style={s.headerBack}>←</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={s.headerTitle}>{label}</Text>
    </View>
  );

  const Message = ({ text }) => (
    <View style={s.messageBox}>
      <Text style={s.messageText}>{text}</Text>
    </View>
  );

  if (screen === 'cart') {
    const products = cart?.products || [];
    return (
      <SafeAreaView style={s.safe}>
        <Header label="Cart Detail" onBack={() => setScreen('user')} />
        {cartLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : cartError ? (
          <Message text={cartError} />
        ) : products.length === 0 ? (
          <Message text={ERR_NO_PRODUCTS} />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(p) => String(p.id)}
            ListHeaderComponent={<Text style={s.sectionLabel}>Products</Text>}
            contentContainerStyle={{ padding: 14 }}
            renderItem={({ item }) => (
              <View style={s.productCard}>
                <Image source={{ uri: item.thumbnail }} style={s.productImage} />
                <View style={{ flex: 1 }}>
                  <Text style={s.productTitle}>{item.title}</Text>
                  <View style={s.pillRow}>
                    <Text style={s.pill}>{money(item.price)}</Text>
                    <Text style={s.pillMuted}>x{item.quantity}</Text>
                  </View>
                  <Text style={s.productMeta}>
                    total: <Text style={s.bold}>{money(item.total)}</Text>
                    {'   '}
                    discounted:{' '}
                    <Text style={s.bold}>
                      {money(item.discountedTotal ?? item.discountedPrice)}
                    </Text>
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  if (screen === 'user') {
    return (
      <SafeAreaView style={s.safe}>
        <Header label="User Detail" onBack={() => setScreen('users')} />
        {userLoading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : userError ? (
          <Message text={userError} />
        ) : !user ? (
          <Message text={ERR_NO_USER} />
        ) : (
          <ScrollView contentContainerStyle={{ padding: 14 }}>
            <View style={s.userCard}>
              <Image source={{ uri: avatarFor(user) }} style={s.userAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={s.userLine}>
                  {user.age} · {user.gender} · @{user.username}
                </Text>
                <Text style={s.userLine}>{user.email}</Text>
                <Text style={s.userLine}>{user.phone}</Text>
                <Text style={s.userLine}>City: {user.address?.city || '-'}</Text>
                <Text style={s.userLine}>Company: {user.company?.name || '-'}</Text>
                <Text style={s.userLine}>{user.company?.title || ''}</Text>
              </View>
            </View>

            <Text style={s.sectionLabel}>Carts</Text>

            {carts.length === 0 ? (
              <Message text="This user has no carts." />
            ) : (
              carts.map((c) => (
                <TouchableOpacity key={c.id} style={s.cartCard} onPress={() => openCart(c)}>
                  <Text style={s.cartTitle}>Cart #{c.id}</Text>
                  <Text style={s.cartLine}>
                    totalProducts: {c.totalProducts} · totalQuantity: {c.totalQuantity}
                  </Text>
                  <Text style={s.cartLine}>
                    total: {c.total} · discountedTotal: {c.discountedTotal}
                  </Text>
                  <Text style={s.cartLink}>Tap to view products →</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <Header label="Users" />

      <View style={s.searchWrap}>
        <TextInput
          style={s.search}
          placeholder="Search users..."
          value={query}
          onChangeText={onChangeQuery}
          autoCorrect={false}
        />
        {searchError ? <Text style={s.searchError}>{searchError}</Text> : null}
      </View>

      <View style={s.listMeta}>
        <Text style={s.listMetaText}>
          {query.trim().length >= 2 ? 'Search results' : 'All users'}
        </Text>
        <Text style={s.listMetaText}>Total {total}</Text>
      </View>

      {usersLoading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : usersError ? (
        <View>
          <Message text={usersError} />
          <TouchableOpacity style={s.retry} onPress={loadUsers}>
            <Text style={s.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : visibleUsers.length === 0 ? (
        <Message text={ERR_NO_USERS} />
      ) : (
        <FlatList
          data={visibleUsers}
          keyExtractor={(u) => String(u.id)}
          contentContainerStyle={{ padding: 14, paddingTop: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.userRow} onPress={() => openUser(item)}>
              <Image source={{ uri: avatarFor(item) }} style={s.rowAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowName}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={s.rowLine}>
                  {item.age} · {item.gender} · {item.email}
                </Text>
                <Text style={s.rowLine}>City: {item.address?.city || '-'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E8F0',
  },
  headerBack: { fontSize: 20, marginRight: 14, color: '#17181F' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#17181F' },

  searchWrap: { paddingHorizontal: 14, paddingTop: 12 },
  search: {
    borderWidth: 1,
    borderColor: '#D5DAE5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#FFF',
    fontSize: 14,
  },
  searchError: { color: '#C0392B', fontSize: 12, marginTop: 6 },

  listMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listMetaText: { fontSize: 12, color: '#8A8FA3' },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },
  rowAvatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12, backgroundColor: '#DDD' },
  rowName: { fontSize: 15, fontWeight: 'bold', color: '#17181F' },
  rowLine: { fontSize: 12, color: '#6B7085', marginTop: 2 },

  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },
  userAvatar: { width: 64, height: 64, borderRadius: 32, marginRight: 14, backgroundColor: '#DDD' },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#17181F', marginBottom: 4 },
  userLine: { fontSize: 12.5, color: '#4A4F60', marginTop: 1 },

  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#17181F', marginTop: 18, marginBottom: 8 },

  cartCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },
  cartTitle: { fontSize: 14, fontWeight: 'bold', color: '#17181F' },
  cartLine: { fontSize: 12.5, color: '#6B7085', marginTop: 3 },
  cartLink: { fontSize: 12.5, color: PRIMARY, marginTop: 8 },

  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },
  productImage: { width: 56, height: 56, borderRadius: 6, marginRight: 12, backgroundColor: '#EEE' },
  productTitle: { fontSize: 14, fontWeight: 'bold', color: '#17181F' },
  pillRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  pill: {
    fontSize: 12,
    color: '#17181F',
    borderWidth: 1,
    borderColor: '#D5DAE5',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  pillMuted: { fontSize: 12, color: '#6B7085' },
  productMeta: { fontSize: 11.5, color: '#6B7085', marginTop: 6 },
  bold: { fontWeight: 'bold', color: '#17181F' },

  messageBox: { padding: 24, alignItems: 'center' },
  messageText: { color: '#C0392B', textAlign: 'center', fontSize: 14 },
  retry: {
    alignSelf: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryText: { color: '#FFF', fontWeight: 'bold' },
});
