import { ScreenContent } from '@/components/ScreenContent';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <ScreenContent title="Home" path="src/app/index.tsx"></ScreenContent>
    </>
  );
}
