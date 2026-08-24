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
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';

const BASE_URL = 'https://dummyjson.com';
const RESOURCE = '/posts';
const PRIMARY = '#2E6BE6';

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const randomImage = () =>
  `https://picsum.photos/seed/${Math.floor(Math.random() * 100000)}/600/360`;

const preview = (text, n = 120) =>
  !text ? '' : text.length > n ? text.slice(0, n).trim() + '...' : text;

const reactionsLabel = (r) =>
  r && typeof r === 'object'
    ? `Likes: ${r.likes ?? 0} · Dislikes: ${r.dislikes ?? 0}`
    : `Reactions: ${r ?? 0}`;

export default function App() {
  const [screen, setScreen] = useState('home');
  const [events, setEvents] = useState([]);
  const [current, setCurrent] = useState(null);
  const [detail, setDetail] = useState(null);
  const [cover, setCover] = useState('');

  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setListError('');
    try {
      const body = await request(RESOURCE);
      const list = Array.isArray(body) ? body : body.posts || [];
      setEvents(list.map((e) => ({ ...e, cover: randomImage() })));
    } catch (e) {
      setListError('Could not load events. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openDetail = async (item) => {
    setDetail(null);
    setCover(randomImage());
    setScreen('detail');
    try {
      setDetail(await request(`${RESOURCE}/${item.id}`));
    } catch (e) {
      Alert.alert('Error', 'Could not load this event.');
      setScreen('home');
    }
  };

  const openAdd = () => {
    setCurrent(null);
    setTitle('');
    setDescription('');
    setTags('');
    setErrors({});
    setSaveError('');
    setScreen('form');
  };

  const openEdit = (item) => {
    setCurrent(item);
    setTitle(item.title || '');
    setDescription(item.body || '');
    setTags((item.tags || []).join(', '));
    setErrors({});
    setSaveError('');
    setScreen('form');
  };

  const validate = () => {
    const next = {};
    if (title.trim().length < 3) next.title = 'Title must be at least 3 characters';
    if (description.trim().length < 10)
      next.description = 'Description must be at least 10 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setSaveError('');
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      body: description.trim(),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      userId: 1,
    };

    setSaving(true);
    try {
      if (current) {
        await request(`${RESOURCE}/${current.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setEvents((prev) =>
          prev.map((e) => (e.id === current.id ? { ...e, ...payload } : e))
        );
      } else {
        const created = await request(`${RESOURCE}/add`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setEvents((prev) => [{ ...created, cover: randomImage() }, ...prev]);
      }
      setScreen('home');
    } catch (e) {
      setSaveError("Couldn't save. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item) => {
    Alert.alert('Confirm', 'Delete this event?', [
      { text: 'CANCEL', style: 'cancel' },
      {
        text: 'DELETE',
        style: 'destructive',
        onPress: async () => {
          try {
            await request(`${RESOURCE}/${item.id}`, { method: 'DELETE' });
            setEvents((prev) => prev.filter((e) => e.id !== item.id));
          } catch (e) {
            Alert.alert('Error', 'Could not delete. Please try again.');
          }
        },
      },
    ]);
  };

  const Header = ({ label, back }) => (
    <View style={s.header}>
      {back ? (
        <TouchableOpacity onPress={() => setScreen('home')}>
          <Text style={s.headerBack}>←</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={s.headerTitle}>{label}</Text>
    </View>
  );

  if (screen === 'detail') {
    return (
      <SafeAreaView style={s.safe}>
        <Header label="Event Detail" back />
        {!detail ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView>
            <Image source={{ uri: cover }} style={s.detailCover} />
            <View style={{ padding: 16 }}>
              <Text style={s.detailTitle}>{detail.title}</Text>
              <Text style={s.tags}>{(detail.tags || []).join(' · ')}</Text>
              <Text style={s.meta}>{reactionsLabel(detail.reactions)}</Text>
              <Text style={s.body}>{detail.body}</Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  if (screen === 'form') {
    return (
      <SafeAreaView style={s.safe}>
        <Header label={current ? 'Edit Event' : 'Add Event'} back />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={s.section}>Event Info</Text>

          <Text style={s.label}>Title *</Text>
          <TextInput
            style={[s.input, errors.title && s.inputError]}
            placeholder="Tech Conference 2025"
            value={title}
            onChangeText={setTitle}
          />
          <Text style={errors.title ? s.errorHint : s.hint}>
            {errors.title || 'Title must be at least 3 characters'}
          </Text>

          <Text style={s.label}>Description *</Text>
          <TextInput
            style={[s.input, s.textArea, errors.description && s.inputError]}
            placeholder="Annual event focusing on innovations in AI and IoT..."
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text style={errors.description ? s.errorHint : s.hint}>
            {errors.description || 'Description must be at least 10 characters'}
          </Text>

          <Text style={s.label}>Tags (comma-separated)</Text>
          <TextInput
            style={s.input}
            placeholder="Technology, Conference"
            value={tags}
            onChangeText={setTags}
          />

          {saveError ? <Text style={s.saveError}>{saveError}</Text> : null}

          <TouchableOpacity style={s.button} onPress={handleSubmit} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={s.buttonText}>{current ? 'Update Event' : 'Add Event'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <Header label="Events" />
      <Text style={s.heading}>Event Management</Text>

      {listError ? (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={s.saveError}>{listError}</Text>
          <TouchableOpacity style={s.button} onPress={loadEvents}>
            <Text style={s.buttonText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading && events.length === 0 ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          refreshing={loading}
          onRefresh={loadEvents}
          contentContainerStyle={{ padding: 12, paddingBottom: 90 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Image source={{ uri: item.cover }} style={s.cover} />
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.tags}>{(item.tags || []).join(' · ')}</Text>
              <Text style={s.preview}>{preview(item.body)}</Text>

              <View style={s.actions}>
                <TouchableOpacity style={s.smallBtn} onPress={() => openDetail(item)}>
                  <Text style={s.smallBtnText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.smallBtn} onPress={() => openEdit(item)}>
                  <Text style={s.smallBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.smallBtn, s.dangerBtn]}
                  onPress={() => confirmDelete(item)}
                >
                  <Text style={s.dangerBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={s.fab} onPress={openAdd}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
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
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#17181F' },
  heading: { fontSize: 18, fontWeight: 'bold', padding: 14, paddingBottom: 4 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },
  cover: { width: '100%', height: 150, borderRadius: 8, backgroundColor: '#DDD' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 10, color: '#17181F' },
  tags: { fontSize: 12, color: '#8A8FA3', marginTop: 2 },
  preview: { fontSize: 13, color: '#4A4F60', marginTop: 6 },
  actions: { flexDirection: 'row', marginTop: 12 },
  smallBtn: {
    borderWidth: 1,
    borderColor: '#D5DAE5',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  smallBtnText: { fontSize: 13, color: '#17181F' },
  dangerBtn: { backgroundColor: '#4A4F60', borderColor: '#4A4F60' },
  dangerBtnText: { fontSize: 13, color: '#FFF' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7A7F8F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: { color: '#FFF', fontSize: 30, lineHeight: 34 },
  detailCover: { width: '100%', height: 220, backgroundColor: '#DDD' },
  detailTitle: { fontSize: 20, fontWeight: 'bold', color: '#17181F' },
  meta: { fontSize: 13, color: '#4A4F60', marginTop: 4 },
  body: { fontSize: 14, color: '#2E3140', marginTop: 14, lineHeight: 21 },
  section: { fontSize: 15, fontWeight: 'bold', marginBottom: 12, color: '#17181F' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#2E3140' },
  input: {
    borderWidth: 1,
    borderColor: '#D5DAE5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  inputError: { borderColor: '#C0392B' },
  textArea: { height: 100, textAlignVertical: 'top' },
  hint: { fontSize: 11, color: '#8A8FA3', marginTop: 4, marginBottom: 12 },
  errorHint: { fontSize: 11, color: '#C0392B', marginTop: 4, marginBottom: 12 },
  saveError: { color: '#C0392B', marginTop: 14, textAlign: 'center' },
  button: {
    backgroundColor: '#7A7F8F',
    borderRadius: 6,
    paddingVertical: 13,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
});
