import * as SecureStore from 'expo-secure-store';

export const saveASData = async (key: string, data: any) => {
  const stringData = JSON.stringify(data);
  await SecureStore.setItemAsync(key, stringData);
};

export const getASData = async <T>(key: string): Promise<T | null> => {
  const data = await SecureStore.getItemAsync(key);
  return data ? JSON.parse(data) : null;
};

export const deleteASData = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
}