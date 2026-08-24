import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { getEvent, randomImage, reactionsLabel, PRIMARY } from '../api';

export default function DetailScreen({ route }) {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [cover] = useState(randomImage());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setEvent(await getEvent(id));
      } catch (e) {
        setError('Could not load this event. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />;
  }

  if (error || !event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: cover }} style={styles.cover} />

      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.tags}>{(event.tags || []).join(' · ')}</Text>
        <Text style={styles.meta}>{reactionsLabel(event.reactions)}</Text>
        <Text style={styles.description}>{event.body}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  cover: { width: '100%', height: 220, backgroundColor: '#DDD' },
  body: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#17181F' },
  tags: { fontSize: 13, color: '#8A8FA3', marginTop: 6 },
  meta: { fontSize: 13, color: '#4A4F60', marginTop: 4 },
  description: { fontSize: 14, color: '#2E3140', marginTop: 14, lineHeight: 21 },
  errorText: { color: '#C0392B', textAlign: 'center' },
});
