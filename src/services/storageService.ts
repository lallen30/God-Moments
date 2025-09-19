import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  async set(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  async get(key: string): Promise<any> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      // Get all keys first
      const keys = await AsyncStorage.getAllKeys();
      
      if (keys.length === 0) {
        return; // Nothing to clear
      }
      
      // Try multiRemove first as it's more efficient
      try {
        await AsyncStorage.multiRemove(keys);
        return;
      } catch (multiError) {
        console.warn('Error with multiRemove, falling back to individual removal:', multiError);
        
        // Fall back to removing items one by one
        for (const key of keys) {
          try {
            await AsyncStorage.removeItem(key);
          } catch (individualError) {
            console.warn(`Failed to remove item with key: ${key}`, individualError);
            // Continue with other keys
          }
        }
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      // Don't throw the error, just log it
    }
  }
}

export const storageService = new StorageService();
