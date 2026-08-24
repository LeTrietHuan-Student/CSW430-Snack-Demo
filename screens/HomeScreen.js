import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useEvents } from '../EventsContext';
import { deleteEvent, preview, PRIMARY } from '../api';

export default function HomeScreen({ navigation }) {
  const { events, loading, error, loadEvents, removeLocal } = useEvents();

  useEffect(() => {
    loadEvents();
  }, []);

  const confirmDelete = (item) => {
    Alert.alert('Confirm', 'Delete this event?', [
      { text: 'CANCEL', style: 'cancel' },
      {
        text: 'DELETE',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(item.id);
            removeLocal(item.id);
          } catch (e) {
            Alert.alert('Error', 'Could not delete. Please check your connection and try again.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.cover }} style={styles.cover} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.tags}>{(item.tags || []).join(' · ')}</Text>
      <Text style={styles.preview}>{preview(item.body)}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Detail', { id: item.id })}
        >
          <Text style={styles.btnText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('EditEvent', { event: item })}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => confirmDelete(item)}>
          <Text style={styles.btnDangerText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && events.length === 0) {
    return <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Event Management</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={loadEvents}>
            <Text style={styles.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={events}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={loadEvents}
        contentContainerStyle={{ padding: 12, paddingBottom: 90 }}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No events</Text> : null}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddEvent')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
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
  title: { fontSize: 15, fontWeight: 'bold', marginTop: 10, color: '#17181F' },
  tags: { fontSize: 12, color: '#8A8FA3', marginTop: 2 },
  preview: { fontSize: 13, color: '#4A4F60', marginTop: 6 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  btn: {
    borderWidth: 1,
    borderColor: '#D5DAE5',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnText: { fontSize: 13, color: '#17181F' },
  btnDanger: { backgroundColor: '#4A4F60', borderColor: '#4A4F60' },
  btnDangerText: { fontSize: 13, color: '#FFF' },
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
  empty: { textAlign: 'center', color: '#8A8FA3', marginTop: 40 },
  errorBox: { padding: 14, alignItems: 'center' },
  errorText: { color: '#C0392B', textAlign: 'center', marginBottom: 8 },
  retry: {
    backgroundColor: PRIMARY,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  retryText: { color: '#FFF', fontWeight: 'bold' },
});
