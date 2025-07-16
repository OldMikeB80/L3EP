import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, ProgressBar, Avatar, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '@store/store';
import { loadUser } from '@store/slices/userSlice';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { currentUser, studyStreak, totalStudyTime } = useAppSelector((state) => state.user);
  const { categories } = useAppSelector((state) => state.questions);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  const categoryCards = [
    {
      id: 'cert_standards',
      title: 'Certification Standards',
      icon: 'certificate',
      color: '#4CAF50',
      description: 'SNT-TC-1A, CP-189, and more',
      progress: 0.65,
    },
    {
      id: 'materials',
      title: 'Materials & Processes',
      icon: 'factory',
      color: '#2196F3',
      description: 'Metallurgy, welding, and defects',
      progress: 0.45,
    },
    {
      id: 'ndt_methods',
      title: 'NDT Methods',
      icon: 'magnify-scan',
      color: '#FF9800',
      description: 'PT, MT, RT, UT, ET, and more',
      progress: 0.80,
    },
    {
      id: 'safety',
      title: 'Safety & Quality',
      icon: 'shield-check',
      color: '#9C27B0',
      description: 'Safety procedures and quality control',
      progress: 0.30,
    },
  ];

  const quickActions = [
    {
      title: 'Practice Test',
      icon: 'pencil',
      color: '#4CAF50',
      action: () => navigation.navigate('TestSetup' as never),
    },
    {
      title: 'Study Mode',
      icon: 'book-open-variant',
      color: '#2196F3',
      action: () => navigation.navigate('StudyMode' as never),
    },
    {
      title: 'Mock Exam',
      icon: 'timer',
      color: '#FF9800',
      action: () => navigation.navigate('MockExam' as never),
    },
    {
      title: 'Progress',
      icon: 'chart-line',
      color: '#9C27B0',
      action: () => navigation.navigate('Progress' as never),
    },
  ];

  const formatStudyTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Title style={styles.userName}>{currentUser?.name || 'Student'}</Title>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)}>
            <Avatar.Text 
              size={50} 
              label={currentUser?.name?.charAt(0) || 'S'} 
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="fire" size={24} color="#FF5722" />
            <Text style={styles.statValue}>{studyStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="clock" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{formatStudyTime(totalStudyTime)}</Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="target" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
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
                <Icon name={action.icon} size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category Progress */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Category Progress</Title>
          <TouchableOpacity onPress={() => navigation.navigate('Categories' as never)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {categoryCards.map((category) => (
          <Card 
            key={category.id} 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('CategoryDetail' as never, { categoryId: category.id } as never)}
          >
            <Card.Content>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Icon name={category.icon} size={24} color="white" />
                  </View>
                  <View style={styles.categoryText}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                </View>
                <IconButton icon="chevron-right" size={24} />
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>{Math.round(category.progress * 100)}%</Text>
                </View>
                <ProgressBar 
                  progress={category.progress} 
                  color={category.color} 
                  style={styles.progressBar}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Daily Tip */}
      <Card style={styles.tipCard}>
        <Card.Content>
          <View style={styles.tipHeader}>
            <Icon name="lightbulb" size={24} color="#FFC107" />
            <Title style={styles.tipTitle}>Daily Tip</Title>
          </View>
          <Paragraph style={styles.tipText}>
            Focus on understanding the principles behind each NDT method rather than just memorizing facts. 
            This will help you answer application-based questions more effectively.
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: '#0D47A1',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    elevation: 4,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
  },
  viewAllText: {
    color: '#1976D2',
    fontSize: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 50) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryCard: {
    marginBottom: 15,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 15,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  tipCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFF3E0',
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 16,
    marginLeft: 10,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen; 