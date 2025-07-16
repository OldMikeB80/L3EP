import React, { useEffect } from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import SplashScreen from 'react-native-splash-screen'; // Temporarily disabled
import { NetworkProvider } from 'react-native-offline';

import { store } from '@store/store';
import { DatabaseService } from '@services/database/DatabaseService';
import { loadSettingsFromStorage } from '@store/slices/settingsSlice';
import { loadUser } from '@store/slices/userSlice';

// Screens
import HomeScreen from '@screens/HomeScreen';
import TestScreen from '@screens/TestScreen';
import ProgressScreen from '@screens/ProgressScreen';
import TestResultsScreen from '@screens/TestResultsScreen';
import MockExamSetupScreen from '@screens/MockExamSetupScreen';
import StudyModeScreen from '@screens/StudyModeScreen';
import CategoriesScreen from '@screens/CategoriesScreen';

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  Test: { testType: string; categoryId?: string; timeLimit?: number };
  TestResults: { sessionId: string };
  StudyMode: { categoryId?: string };
  MockExamSetup: undefined;
  CategoryDetail: { categoryId: string };
  Profile: undefined;
  Settings: undefined;
  QuestionDetail: { questionId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Progress: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Placeholder screens (to be implemented)

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={placeholderStyles.container}>
    <Icon name="hammer-wrench" size={64} color="#ccc" />
    <Text style={placeholderStyles.title}>{title}</Text>
    <Text style={placeholderStyles.subtitle}>Coming Soon</Text>
  </View>
);

const ProfileScreen = () => <PlaceholderScreen title="Profile" />;
const CategoryDetailScreen = () => <PlaceholderScreen title="Category Details" />;
const SettingsScreen = () => <PlaceholderScreen title="Settings" />;
const QuestionDetailScreen = () => <PlaceholderScreen title="Question Details" />;

const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#666',
  },
});

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Categories':
              iconName = focused ? 'view-grid' : 'view-grid-outline';
              break;
            case 'Progress':
              iconName = focused ? 'chart-line' : 'chart-line-variant';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#1976D2',
      accent: '#FF9800',
    },
  };

  const darkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#1976D2',
      accent: '#FF9800',
    },
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        const db = DatabaseService.getInstance();
        await db.initializeDatabase();

        // Load user settings
        store.dispatch(loadSettingsFromStorage() as any);
        
        // Load current user
        store.dispatch(loadUser());

        // Hide splash screen
        // SplashScreen.hide(); // Temporarily disabled
      } catch (error) {
        console.error('App initialization error:', error);
        // SplashScreen.hide(); // Temporarily disabled
      }
    };

    initializeApp();
  }, []);

  return (
    <Provider store={store}>
      <NetworkProvider>
        <PaperProvider theme={lightTheme}>
          <StatusBar barStyle="dark-content" backgroundColor="#1976D2" />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#1976D2',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="Main" 
                component={MainTabs} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Test" 
                component={TestScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="TestResults" 
                component={TestResultsScreen}
                options={{ title: 'Test Results' }}
              />
              <Stack.Screen 
                name="StudyMode" 
                component={StudyModeScreen}
                options={{ title: 'Study Mode' }}
              />
              <Stack.Screen 
                name="MockExamSetup" 
                component={MockExamSetupScreen}
                options={{ title: 'Mock Exam Setup' }}
              />
              <Stack.Screen 
                name="CategoryDetail" 
                component={CategoryDetailScreen}
                options={{ title: 'Category Details' }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
              <Stack.Screen 
                name="QuestionDetail" 
                component={QuestionDetailScreen}
                options={{ title: 'Question Details' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </NetworkProvider>
    </Provider>
  );
};

export default App; 