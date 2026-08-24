import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useEvents } from '../EventsContext';
import { updateEvent } from '../api';

export default function EditEventScreen({ route, navigation }) {
  const { event } = route.params;
  const { updateLocal } = useEvents();

  const [title, setTitle] = useState(event.title || '');
  const [description, setDescription] = useState(event.body || '');
  const [tags, setTags] = useState((event.tags || []).join(', '));

  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const next = {};
    if (title.trim().length < 3) next.title = 'Title must be at least 3 characters';
    if (description.trim().length < 10) next.description = 'Description must be at least 10 characters';
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
    };

    setSaving(true);
    try {
      await updateEvent(event.id, payload);
      updateLocal(event.id, payload);
      navigation.goBack();
    } catch (e) {
      setSaveError("Couldn't save. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.section}>Event Info</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={[styles.input, errors.title && styles.inputError]}
        value={title}
        onChangeText={setTitle}
      />
      {errors.title ? <Text style={styles.errorHint}>{errors.title}</Text> : <View style={styles.gap} />}

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea, errors.description && styles.inputError]}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      {errors.description ? (
        <Text style={styles.errorHint}>{errors.description}</Text>
      ) : (
        <View style={styles.gap} />
      )}

      <Text style={styles.label}>Tags (comma-separated)</Text>
      <TextInput style={styles.input} value={tags} onChangeText={setTags} />

      {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Update Event</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
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
  textArea: { height: 120, textAlignVertical: 'top' },
  gap: { height: 12 },
  errorHint: { fontSize: 11, color: '#C0392B', marginTop: 4, marginBottom: 12 },
  saveError: { color: '#C0392B', marginTop: 14, textAlign: 'center' },
  button: {
    backgroundColor: '#7A7F8F',
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
});
