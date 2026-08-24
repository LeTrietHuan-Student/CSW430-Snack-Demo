import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';

const BASE_URL = 'https://kami-backend-5rs0.onrender.com';
const LOGIN_PATH = '/auth';
const RESOURCE = '/services';
const PRIMARY = '#EA4C74';

const ERR_NETWORK = "Couldn't load data. Please check your connection and try again.";
const ERR_SAVE = "Couldn't save. Please check your connection and try again.";
const ERR_EMPTY = 'No services found.';
const ERR_LOGIN = 'Login failed. Please check your phone and password.';

export default function App() {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState('');

  const [phone, setPhone] = useState('0373007856');
  const [password, setPassword] = useState('123');
  const [loginError, setLoginError] = useState('');

  const [screen, setScreen] = useState('list');
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(null);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [listError, setListError] = useState('');
  const [saveError, setSaveError] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [errors, setErrors] = useState({});

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

  const asList = (body) => (Array.isArray(body) ? body : body?.data || []);

  const handleLogin = async () => {
    setLoginError('');
    setBusy(true);
    try {
      const body = await request(LOGIN_PATH, {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });
      const t = body?.token || body?.accessToken || body?.data?.token;
      if (!t) throw new Error(`No token in response: ${JSON.stringify(body).slice(0, 120)}`);
      setToken(t);
      setUserName(body?.name || body?.data?.name || phone);
      loadItems(t);
    } catch (e) {
      setLoginError(e.message.startsWith('No token') ? e.message : ERR_LOGIN);
    } finally {
      setBusy(false);
    }
  };

  const loadItems = async (overrideToken) => {
    setLoading(true);
    setListError('');
    try {
      setItems(asList(await request(RESOURCE, {}, overrideToken)));
    } catch (e) {
      setListError(ERR_NETWORK);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (item) => {
    setScreen('detail');
    setCurrent(null);
    setLoading(true);
    try {
      setCurrent(await request(`${RESOURCE}/${item._id}`));
    } catch (e) {
      Alert.alert('Error', ERR_NETWORK);
      setScreen('list');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setCurrent(null);
    setName('');
    setPrice('0');
    setErrors({});
    setSaveError('');
    setScreen('form');
  };

  const openEdit = (item) => {
    setCurrent(item);
    setName(item.name || '');
    setPrice(String(item.price ?? 0));
    setErrors({});
    setSaveError('');
    setScreen('form');
  };

  const validate = () => {
    const next = {};
    if (name.trim().length < 3) next.name = 'Service name must be at least 3 characters';
    if (isNaN(Number(price)) || Number(price) < 0) next.price = 'Price must be a positive number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setSaveError('');
    if (!validate()) return;

    const payload = { name: name.trim(), price: Number(price) };
    setBusy(true);
    try {
      if (current?._id) {
        await request(`${RESOURCE}/${current._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await request(RESOURCE, { method: 'POST', body: JSON.stringify(payload) });
      }
      setScreen('list');
      loadItems();
    } catch (e) {
      setSaveError(ERR_SAVE);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (item) => {
    Alert.alert(
      'Warning',
      'Are you sure you want to remove this service? This operation cannot be returned',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: async () => {
            try {
              await request(`${RESOURCE}/${item._id}`, { method: 'DELETE' });
              setScreen('list');
              loadItems();
            } catch (e) {
              Alert.alert('Error', ERR_NETWORK);
            }
          },
        },
      ]
    );
  };

  const money = (n) => Number(n || 0).toLocaleString('vi-VN') + ' d';
  const when = (d) => (d ? new Date(d).toLocaleString('en-GB') : '-');

  const Header = ({ label, onBack }) => (
    <View style={s.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack}>
          <Text style={s.headerBack}>back</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={s.headerTitle}>{label}</Text>
    </View>
  );

  if (!token) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loginBox}>
          <Text style={s.loginTitle}>Login</Text>
          <TextInput
            style={s.input}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {loginError ? <Text style={s.error}>{loginError}</Text> : null}
          <TouchableOpacity style={s.button} onPress={handleLogin} disabled={busy}>
            {busy ? <ActivityIndicator color="#FFF" /> : <Text style={s.buttonText}>Login</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'form') {
    return (
      <SafeAreaView style={s.safe}>
        <Header label="Service" onBack={() => setScreen('list')} />
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <Text style={s.label}>Service name *</Text>
          <TextInput
            style={[s.input, errors.name && s.inputError]}
            placeholder="Input a service name"
            value={name}
            onChangeText={setName}
          />
          {errors.name ? <Text style={s.hintError}>{errors.name}</Text> : null}

          <Text style={s.label}>Price *</Text>
          <TextInput
            style={[s.input, errors.price && s.inputError]}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          {errors.price ? <Text style={s.hintError}>{errors.price}</Text> : null}

          {saveError ? <Text style={s.error}>{saveError}</Text> : null}

          <TouchableOpacity style={s.button} onPress={handleSubmit} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={s.buttonText}>{current?._id ? 'Update' : 'Add'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'detail') {
    return (
      <SafeAreaView style={s.safe}>
        <Header label="Service detail" onBack={() => setScreen('list')} />
        {loading || !current ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <Text style={s.row}>
              <Text style={s.bold}>Service name: </Text>
              {current.name}
            </Text>
            <Text style={s.row}>
              <Text style={s.bold}>Price: </Text>
              {money(current.price)}
            </Text>
            <Text style={s.row}>
              <Text style={s.bold}>Creator: </Text>
              {current.createdBy?.name || current.createdBy || '-'}
            </Text>
            <Text style={s.row}>
              <Text style={s.bold}>Time: </Text>
              {when(current.createdAt)}
            </Text>
            <Text style={s.row}>
              <Text style={s.bold}>Final update: </Text>
              {when(current.updatedAt)}
            </Text>

            <View style={s.rowBtns}>
              <TouchableOpacity style={s.button} onPress={() => openEdit(current)}>
                <Text style={s.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.button, s.danger]}
                onPress={() => confirmDelete(current)}
              >
                <Text style={s.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <Header label={userName.toUpperCase()} />
      <View style={s.brandRow}>
        <Text style={s.brand}>KAMI SPA</Text>
      </View>

      <View style={s.listHeader}>
        <Text style={s.listTitle}>Service list</Text>
        <TouchableOpacity style={s.addBtn} onPress={openAdd}>
          <Text style={s.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : listError ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={s.error}>{listError}</Text>
          <TouchableOpacity style={s.button} onPress={() => loadItems()}>
            <Text style={s.buttonText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item._id)}
          refreshing={loading}
          onRefresh={() => loadItems()}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={s.empty}>{ERR_EMPTY}</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.item} onPress={() => openDetail(item)}>
              <Text style={s.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={s.itemPrice}>{money(item.price)}</Text>
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
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loginBox: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  loginTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: PRIMARY,
    textAlign: 'center',
    marginBottom: 36,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBack: { color: '#FFF', fontSize: 14, marginRight: 14 },
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  brandRow: { alignItems: 'center', paddingVertical: 12 },
  brand: { color: PRIMARY, fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  listTitle: { fontWeight: 'bold', fontSize: 15 },
  addBtn: {
    backgroundColor: PRIMARY,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: '#FFF', fontSize: 20, lineHeight: 22 },
  item: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: { fontWeight: '600', flex: 1, marginRight: 8 },
  itemPrice: { color: '#333' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: '#C0392B' },
  hintError: { color: '#C0392B', fontSize: 12, marginBottom: 8 },
  error: { color: '#C0392B', textAlign: 'center', marginVertical: 10 },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
    flex: 1,
  },
  danger: { backgroundColor: '#C0392B' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  rowBtns: { flexDirection: 'row', gap: 10 },
  row: { marginBottom: 10, fontSize: 14 },
  bold: { fontWeight: 'bold' },
});
