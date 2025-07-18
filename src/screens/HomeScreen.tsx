import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Card,
  Title,
  Paragraph,
  ProgressBar,
  Avatar,
  IconButton,
  Button,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '@store/store';
import { loadUser } from '@store/slices/userSlice';
import { loadCategories, loadAllQuestions } from '@store/slices/questionSlice';
import { StorageService } from '@services/storage/StorageService';
import { seedDatabase } from '@data/seedQuestions';
import { colors } from '@constants/colors';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { currentUser, studyStreak, totalStudyTime } = useAppSelector((state) => state.user);
  const { categories, questions, isLoading } = useAppSelector((state) => state.questions);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  const quickActions = [
    {
      title: 'Practice Test',
      icon: 'pencil',
      color: colors.success,
      action: () => (navigation as any).navigate('Test', { testType: 'practice' }),
      description: '15 questions',
    },
    {
      title: 'Study Mode',
      icon: 'book-open-variant',
      color: colors.primary,
      action: () => (navigation as any).navigate('StudyMode'),
      description: 'Learn at your pace',
    },
    {
      title: 'Mock Exam',
      icon: 'timer',
      color: colors.accent,
      action: () => (navigation as any).navigate('MockExamSetup'),
      description: 'Full 150 questions',
    },
    {
      title: 'Progress',
      icon: 'chart-line',
      color: colors.categories.materials_processes,
      action: () => (navigation as any).navigate('Progress'),
      description: 'Track performance',
    },
  ];

  const formatStudyTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Debug banner removed for production */}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>L3EP - Level 3 Exam Prep</Text>
              <Title style={styles.userName}>{currentUser?.name || 'Student'}</Title>
            </View>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Profile')}>
              <Avatar.Text
                size={50}
                label={currentUser?.name?.charAt(0) || 'S'}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon name="calendar-check" size={24} color={colors.success} />
              <Text style={styles.statValue}>{studyStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon name="clock-outline" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{formatStudyTime(totalStudyTime)}</Text>
              <Text style={styles.statLabel}>Study Time</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon name="check-circle" size={24} color={colors.accent} />
              <Text style={styles.statValue}>{questions.length}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.action}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Icon name={action.icon} size={28} color="white" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Study by Category</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Categories')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {categories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => (navigation as any).navigate('StudyMode', { categoryId: category.id })}
              activeOpacity={0.8}
            >
              <Card style={styles.categoryCard}>
                <Card.Content>
                  <View style={styles.categoryContent}>
                    <View
                      style={[
                        styles.categoryIcon,
                        {
                          backgroundColor:
                            colors.categories[category.id as keyof typeof colors.categories] ||
                            colors.primary,
                        },
                      ]}
                    >
                      <Icon name={category.icon} size={24} color="white" />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryTitle}>{category.name}</Text>
                      <Text style={styles.categorySubtitle}>
                        {category.totalQuestions} questions
                      </Text>
                      <View style={styles.progressContainer}>
                        <ProgressBar
                          progress={0}
                          color={
                            colors.categories[category.id as keyof typeof colors.categories] ||
                            colors.primary
                          }
                          style={styles.categoryProgress}
                        />
                        <Text style={styles.progressText}>0%</Text>
                      </View>
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Tip */}
        <Card style={styles.tipCard}>
          <Card.Content>
            <View style={styles.tipHeader}>
              <Icon name="lightbulb" size={24} color={colors.accent} />
              <Title style={styles.tipTitle}>Daily Tip</Title>
            </View>
            <Paragraph style={styles.tipText}>
              Level 3 exams test your ability to interpret codes, write procedures, and manage NDT
              programs. Focus on understanding the "why" behind each method, not just the "how".
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  debugCard: {
    display: 'none',
  },
  debugTitle: {
    display: 'none',
  },
  debugText: {
    display: 'none',
  },
  seedButton: {
    display: 'none',
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  userName: {
    color: colors.textOnPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: colors.accent,
  },
  avatarLabel: {
    color: colors.textOnAccent,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    elevation: 4,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 50) / 2,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryCard: {
    marginBottom: 15,
    elevation: 2,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  categorySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryProgress: {
    height: 6,
    borderRadius: 3,
    flex: 1,
    marginRight: 8,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    minWidth: 30,
  },
  tipCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.surfaceVariant,
    elevation: 2,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 16,
    marginLeft: 10,
    color: colors.textPrimary,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
