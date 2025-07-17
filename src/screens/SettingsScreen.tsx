import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Card,
  Title,
  List,
  Switch,
  Divider,
  Button,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '@store/store';
import { 
  setTheme, 
  updateNotificationSettings, 
  updateAudioSettings,
  updatePracticeSettings,
} from '@store/slices/settingsSlice';
import { colors } from '@constants/colors';
import { DatabaseService } from '@services/database/DatabaseService';
import { seedDatabase } from '@data/seedQuestions';
import { loadCategories, loadAllQuestions } from '@store/slices/questionSlice';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const { currentUser } = useAppSelector((state) => state.user);
  const { questions } = useAppSelector((state) => state.questions);
  
  const [clearDataDialog, setClearDataDialog] = useState(false);
  const [reseedDialog, setReseedDialog] = useState(false);
  
  const handleToggleDarkMode = () => {
    dispatch(setTheme(settings.theme === 'dark' ? 'light' : 'dark'));
  };
  
  const handleToggleNotifications = () => {
    dispatch(updateNotificationSettings({ enabled: !settings.notifications.enabled }));
  };
  
  const handleToggleSound = () => {
    dispatch(updateAudioSettings({ soundEffects: !settings.audio.soundEffects }));
  };
  
  const handleToggleShowExplanations = () => {
    dispatch(updatePracticeSettings({ showExplanations: !settings.practice.showExplanations }));
  };
  
  const handleToggleShuffleOptions = () => {
    dispatch(updatePracticeSettings({ shuffleOptions: !settings.practice.shuffleOptions }));
  };
  
  const handleClearProgress = async () => {
    setClearDataDialog(false);
    Alert.alert('Info', 'This feature will be available in a future update.');
  };
  
  const handleReseedDatabase = async () => {
    try {
      await seedDatabase();
      // Reload data
      dispatch(loadCategories());
      dispatch(loadAllQuestions());
      setReseedDialog(false);
      Alert.alert('Success', 'Database has been reseeded with sample questions.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reseed database. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>General</Title>
            
            <List.Item
              title="Dark Mode"
              description="Enable dark theme"
              left={(props) => <List.Icon {...props} icon="brightness-6" color={colors.primary} />}
              right={() => (
                <Switch
                  value={settings.theme === 'dark'}
                  onValueChange={handleToggleDarkMode}
                  color={colors.primary}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Notifications"
              description="Enable study reminders"
              left={(props) => <List.Icon {...props} icon="bell" color={colors.primary} />}
              right={() => (
                <Switch
                  value={settings.notifications.enabled}
                  onValueChange={handleToggleNotifications}
                  color={colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>
        
        {/* Test Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Test Settings</Title>
            
            <List.Item
              title="Sound Effects"
              description="Play sounds for correct/incorrect answers"
              left={(props) => <List.Icon {...props} icon="volume-high" color={colors.primary} />}
              right={() => (
                <Switch
                  value={settings.audio.soundEffects}
                  onValueChange={handleToggleSound}
                  color={colors.primary}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Show Explanations"
              description="Show explanations after answering questions"
              left={(props) => <List.Icon {...props} icon="information" color={colors.primary} />}
              right={() => (
                <Switch
                  value={settings.practice.showExplanations}
                  onValueChange={handleToggleShowExplanations}
                  color={colors.primary}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Shuffle Options"
              description="Randomize answer options in tests"
              left={(props) => <List.Icon {...props} icon="shuffle-variant" color={colors.primary} />}
              right={() => (
                <Switch
                  value={settings.practice.shuffleOptions}
                  onValueChange={handleToggleShuffleOptions}
                  color={colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>
        
        {/* Data Management */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Data Management</Title>
            
            <List.Item
              title="Clear Progress"
              description="Reset all your test results and progress"
              left={(props) => <List.Icon {...props} icon="delete" color={colors.error} />}
              onPress={() => setClearDataDialog(true)}
            />
            
            <Divider />
            
            <List.Item
              title="Reseed Database"
              description={`Currently ${questions.length} questions loaded`}
              left={(props) => <List.Icon {...props} icon="database-refresh" color={colors.warning} />}
              onPress={() => setReseedDialog(true)}
            />
          </Card.Content>
        </Card>
        
        {/* About */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About</Title>
            
            <List.Item
              title="L3EP - Level 3 Exam Prep"
              description="Version 1.0.0"
              left={(props) => <List.Icon {...props} icon="information" color={colors.primary} />}
            />
            
            <Divider />
            
            <List.Item
              title="Privacy Policy"
              description="View privacy policy"
              left={(props) => <List.Icon {...props} icon="shield-lock" color={colors.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy would be shown here.')}
            />
            
            <Divider />
            
            <List.Item
              title="Terms of Service"
              description="View terms of service"
              left={(props) => <List.Icon {...props} icon="file-document" color={colors.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Terms of Service', 'Terms of service would be shown here.')}
            />
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Clear Data Confirmation Dialog */}
      <Portal>
        <Dialog visible={clearDataDialog} onDismiss={() => setClearDataDialog(false)}>
          <Dialog.Title>Clear Progress</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to clear all your progress? This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearDataDialog(false)}>Cancel</Button>
            <Button onPress={handleClearProgress} textColor={colors.error}>
              Clear
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Reseed Database Dialog */}
      <Portal>
        <Dialog visible={reseedDialog} onDismiss={() => setReseedDialog(false)}>
          <Dialog.Title>Reseed Database</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              This will reload the sample questions. Your progress will be maintained. Continue?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReseedDialog(false)}>Cancel</Button>
            <Button onPress={handleReseedDatabase} textColor={colors.primary}>
              Reseed
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
});

export default SettingsScreen; 