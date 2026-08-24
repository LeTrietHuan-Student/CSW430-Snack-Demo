import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EventsProvider } from './EventsContext';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import AddEventScreen from './screens/AddEventScreen';
import EditEventScreen from './screens/EditEventScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <EventsProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Events' }} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Event Detail' }} />
          <Stack.Screen name="AddEvent" component={AddEventScreen} options={{ title: 'Add Event' }} />
          <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </EventsProvider>
  );
}
