import React, { useEffect } from 'react';
import { StatusBar, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  Provider as PaperProvider,
  DefaultTheme,
  MD3DarkTheme,
  Button,
  Card,
  List,
  Avatar,
  Title,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import SplashScreen from 'react-native-splash-screen'; // Temporarily disabled
import { NetworkProvider } from 'react-native-offline';

import { store, RootState, useAppDispatch } from '@store/store';
import { DatabaseService } from '@services/database/DatabaseService';
import { seedDatabase } from '@data/seedQuestions';
import { loadSettingsFromStorage } from '@store/slices/settingsSlice';
import { loadUser, createUser } from '@store/slices/userSlice';
import { loadCategories, loadAllQuestions } from '@store/slices/questionSlice';
import { diagnostics } from './src/utils/diagnostics';
import { colors } from '@constants/colors';

// Screens
import HomeScreen from '@screens/HomeScreen';
import TestScreen from '@screens/TestScreen';
import ProgressScreen from '@screens/ProgressScreen';
import TestResultsScreen from '@screens/TestResultsScreen';
import MockExamSetupScreen from '@screens/MockExamSetupScreen';
import StudyModeScreen from '@screens/StudyModeScreen';
import CategoriesScreen from '@screens/CategoriesScreen';
import CategoryDetailScreen from '@screens/CategoryDetailScreen';
import SettingsScreen from '@screens/SettingsScreen';
import QuestionDetailScreen from '@screens/QuestionDetailScreen';

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

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);

  const handleCreateDefaultUser = async () => {
    try {
      await dispatch(
        createUser({
          name: 'Test User',
          email: 'test@example.com',
          dailyStudyGoal: 30,
          notificationsEnabled: true,
        }) as any,
      );
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <View style={placeholderStyles.container}>
        <Icon name="account-circle" size={64} color="#1976D2" />
        <Text style={placeholderStyles.title}>Welcome to NDT Exam Prep</Text>
        <Text style={placeholderStyles.subtitle}>Create a profile to track your progress</Text>
        <Button
          mode="contained"
          onPress={handleCreateDefaultUser}
          style={{ marginTop: 20, paddingHorizontal: 30 }}
        >
          Create Test Profile
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={profileStyles.container}>
      <View style={profileStyles.header}>
        <Avatar.Text
          size={80}
          label={currentUser.name.charAt(0)}
          style={{ backgroundColor: '#1976D2' }}
        />
        <Title style={profileStyles.name}>{currentUser.name}</Title>
        <Text style={profileStyles.email}>{currentUser.email}</Text>
      </View>

      <Card style={profileStyles.card}>
        <Card.Content>
          <List.Item
            title="Daily Study Goal"
            description={`${currentUser.dailyStudyGoal} minutes`}
            left={(props) => <List.Icon {...props} icon="timer" />}
          />
          <List.Item
            title="Notifications"
            description={currentUser.notificationsEnabled ? 'Enabled' : 'Disabled'}
            left={(props) => <List.Icon {...props} icon="bell" />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};





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

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Debug UI Component
const DebugUI = () => {
  const dispatch = useAppDispatch();
  const categories = useSelector((state: RootState) => state.questions.categories);
  const questions = useSelector((state: RootState) => state.questions.questions);
  
  // Only show in development mode
  if (!__DEV__) {
    return null;
  }

  const handleManualSeed = async () => {
    try {
      console.log('Manual seed triggered');
      await seedDatabase();

      // Reload data from database to Redux
      dispatch(loadCategories());
      dispatch(loadAllQuestions());
    } catch (error) {
      console.error('Manual seed error:', error);
    }
  };

  const handleClearAndReseed = async () => {
    try {
      console.log('Clear and reseed triggered');

      // Re-initialize database (this will recreate tables if needed)
      const db = DatabaseService.getInstance();
      await db.initializeDatabase();

      // Force reseed - seedDatabase will check if empty
      await seedDatabase();

      // Reload data from database to Redux
      dispatch(loadCategories());
      dispatch(loadAllQuestions());

      console.log('Clear and reseed completed');
    } catch (error) {
      console.error('Clear and reseed error:', error);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 50,
        right: 10,
        backgroundColor: colors.accentLight,
        padding: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: colors.accent,
        zIndex: 1000,
      }}
    >
      <Text style={{ fontWeight: 'bold', color: colors.textOnAccent, fontSize: 12 }}>
        Categories: {categories.length}
      </Text>
      <Text style={{ color: colors.textOnAccent, fontSize: 12 }}>
        Questions: {questions.length}
      </Text>
      <TouchableOpacity
        onPress={handleManualSeed}
        style={{
          marginTop: 5,
          backgroundColor: colors.success,
          padding: 5,
          borderRadius: 3,
        }}
      >
        <Text style={{ color: colors.textOnPrimary, fontSize: 11, textAlign: 'center' }}>
          Force Seed Database
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleClearAndReseed}
        style={{
          marginTop: 5,
          backgroundColor: colors.error,
          padding: 5,
          borderRadius: 3,
        }}
      >
        <Text style={{ color: colors.textOnPrimary, fontSize: 11, textAlign: 'center' }}>
          Clear & Reseed
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          const report = diagnostics.getReport();
          console.log('📊 DIAGNOSTICS REPORT:', report);
          Alert.alert(
            'Diagnostics',
            `Data Loads: ${report.summary.totalDataLoads}\nNavigations: ${report.summary.totalNavigations}\nErrors: ${report.summary.totalErrors}`
          );
        }}
        style={{
          marginTop: 5,
          backgroundColor: colors.info,
          padding: 5,
          borderRadius: 3,
        }}
      >
        <Text style={{ color: colors.textOnPrimary, fontSize: 11, textAlign: 'center' }}>
          Show Diagnostics
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const App = () => {
  console.log('========== APP STARTING ==========');

  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      accent: colors.accent,
      background: colors.background,
      surface: colors.surface,
      text: colors.textPrimary,
      placeholder: colors.textSecondary,
      error: colors.error,
      notification: colors.accent,
    },
  };

  // Commented out dark theme for future use
  // const darkTheme = {
  //   ...MD3DarkTheme,
  //   colors: {
  //     ...MD3DarkTheme.colors,
  //     primary: colors.primary,
  //     accent: colors.accent,
  //     background: colors.background,
  //     surface: colors.surface,
  //     text: colors.textPrimary,
  //     placeholder: colors.textSecondary,
  //     error: colors.error,
  //     notification: colors.accent,
  //   },
  // };

  useEffect(() => {
    // Set up global error handler
    const errorHandler = (error: Error, isFatal: boolean) => {
      diagnostics.logError(error, { isFatal });
      console.error('Global error caught:', error, 'Fatal:', isFatal);
    };
    
    // @ts-ignore
    global.ErrorUtils.setGlobalHandler(errorHandler);
    
    const initializeApp = async () => {
      try {
        // Initialize database
        const db = DatabaseService.getInstance();
        await db.initializeDatabase();

        // Seed database with initial data if empty
        const categories = await db.getCategories();
        console.log('App initialization - Categories found:', categories.length);

        if (!categories || categories.length === 0) {
          console.log('Database is empty, seeding with initial data...');
          await seedDatabase();

          // Verify seeding worked
          const verifyCategories = await db.getCategories();
          const verifyQuestions = await db.getAllQuestions();
          console.log(
            'After seeding - Categories:',
            verifyCategories.length,
            'Questions:',
            verifyQuestions.length,
          );
        } else {
          // Check if we have questions
          const allQuestions = await db.getAllQuestions();
          console.log('Existing database - Questions found:', allQuestions.length);
        }

        // Load data into Redux store
        console.log('Loading data into Redux store...');
        store.dispatch(loadCategories());
        store.dispatch(loadAllQuestions());

        // Load user settings
        store.dispatch(loadSettingsFromStorage());

        // Load current user or create default
        const userResult = await store.dispatch(loadUser()).unwrap();
        if (!userResult) {
          console.log('No user found, creating default user...');
          await store.dispatch(createUser({
            name: 'Test User',
            email: 'test@example.com',
            dailyStudyGoal: 30,
            notificationsEnabled: true,
          }) as any);
        }

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
          <AppContent />
        </PaperProvider>
      </NetworkProvider>
    </Provider>
  );
};

const AppContent = () => {
  return (
    <>
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
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Test" component={TestScreen} options={{ headerShown: false }} />
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
    </>
  );
};

export default App;
