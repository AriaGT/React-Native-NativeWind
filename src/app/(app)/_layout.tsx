import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerShown: true
        }}
      />
    </Stack>
  );
}