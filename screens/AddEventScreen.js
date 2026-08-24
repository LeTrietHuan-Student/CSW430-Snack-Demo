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
import { addEvent } from '../api';

export default function AddEventScreen({ navigation }) {
  const { addLocal } = useEvents();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

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

    setSaving(true);
    try {
      const created = await addEvent({
        title: title.trim(),
        body: description.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        userId: 1,
      });
      addLocal(created);
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
        placeholder="Tech Conference 2025"
        value={title}
        onChangeText={setTitle}
      />
      <Text style={errors.title ? styles.errorHint : styles.hint}>
        {errors.title || 'Title must be at least 3 characters'}
      </Text>

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea, errors.description && styles.inputError]}
        placeholder="Annual event focusing on innovations in AI and IoT..."
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={errors.description ? styles.errorHint : styles.hint}>
        {errors.description || 'Description must be at least 10 characters'}
      </Text>

      <Text style={styles.label}>Tags (comma-separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="Technology, Conference"
        value={tags}
        onChangeText={setTags}
      />

      {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={saving}>
        {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Add Event</Text>}
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
  textArea: { height: 100, textAlignVertical: 'top' },
  hint: { fontSize: 11, color: '#8A8FA3', marginTop: 4, marginBottom: 12 },
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
