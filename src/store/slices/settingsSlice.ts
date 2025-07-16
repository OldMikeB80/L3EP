import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    enabled: boolean;
    dailyReminder: boolean;
    reminderTime: string; // HH:MM format
    weeklyReport: boolean;
  };
  display: {
    fontSize: 'small' | 'medium' | 'large';
    showFormulas: boolean;
    showImages: boolean;
    compactMode: boolean;
  };
  practice: {
    defaultQuestions: number;
    defaultTimeLimit: number; // minutes
    showExplanations: boolean;
    enableConfidence: boolean;
    shuffleOptions: boolean;
  };
  audio: {
    enabled: boolean;
    soundEffects: boolean;
    readQuestions: boolean;
  };
  dataSync: {
    autoSync: boolean;
    syncOnWiFiOnly: boolean;
    lastSync: Date | null;
  };
}

const initialState: SettingsState = {
  theme: 'light',
  notifications: {
    enabled: true,
    dailyReminder: true,
    reminderTime: '09:00',
    weeklyReport: true,
  },
  display: {
    fontSize: 'medium',
    showFormulas: true,
    showImages: true,
    compactMode: false,
  },
  practice: {
    defaultQuestions: 15,
    defaultTimeLimit: 30,
    showExplanations: true,
    enableConfidence: true,
    shuffleOptions: true,
  },
  audio: {
    enabled: false,
    soundEffects: true,
    readQuestions: false,
  },
  dataSync: {
    autoSync: true,
    syncOnWiFiOnly: true,
    lastSync: null,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<SettingsState['theme']>) => {
      state.theme = action.payload;
      AsyncStorage.setItem('theme', action.payload);
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<SettingsState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
      AsyncStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    updateDisplaySettings: (state, action: PayloadAction<Partial<SettingsState['display']>>) => {
      state.display = { ...state.display, ...action.payload };
      AsyncStorage.setItem('display', JSON.stringify(state.display));
    },
    updatePracticeSettings: (state, action: PayloadAction<Partial<SettingsState['practice']>>) => {
      state.practice = { ...state.practice, ...action.payload };
      AsyncStorage.setItem('practice', JSON.stringify(state.practice));
    },
    updateAudioSettings: (state, action: PayloadAction<Partial<SettingsState['audio']>>) => {
      state.audio = { ...state.audio, ...action.payload };
      AsyncStorage.setItem('audio', JSON.stringify(state.audio));
    },
    updateDataSyncSettings: (state, action: PayloadAction<Partial<SettingsState['dataSync']>>) => {
      state.dataSync = { ...state.dataSync, ...action.payload };
      AsyncStorage.setItem('dataSync', JSON.stringify(state.dataSync));
    },
    loadSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
    resetSettings: () => {
      AsyncStorage.multiRemove([
        'theme',
        'notifications',
        'display',
        'practice',
        'audio',
        'dataSync',
      ]);
      return initialState;
    },
  },
});

// Async action to load settings from storage
export const loadSettingsFromStorage = () => async (dispatch: any) => {
  try {
    const keys = ['theme', 'notifications', 'display', 'practice', 'audio', 'dataSync'];
    const values = await AsyncStorage.multiGet(keys);
    
    const settings: Partial<SettingsState> = {};
    
    values.forEach(([key, value]) => {
      if (value) {
        try {
          if (key === 'theme') {
            settings.theme = value as SettingsState['theme'];
          } else {
            (settings as any)[key] = JSON.parse(value);
          }
        } catch (e) {
          // Handle parse error
        }
      }
    });
    
    dispatch(settingsSlice.actions.loadSettings(settings));
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};

export const {
  setTheme,
  updateNotificationSettings,
  updateDisplaySettings,
  updatePracticeSettings,
  updateAudioSettings,
  updateDataSyncSettings,
  loadSettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer; 