import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, ProgressBar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '@store/store';
import { colors } from '@constants/colors';

const CategoryDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { categoryId } = route.params;
  
  const { categories, questions } = useAppSelector((state) => state.questions);
  const { categoryProgress } = useAppSelector((state) => state.progress);
  
  const category = categories.find((c) => c.id === categoryId);
  const categoryQuestions = questions.filter((q) => q.categoryId === categoryId);
  const progress = categoryProgress[categoryId];
  
  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Category not found</Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            buttonColor={colors.primary}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  
  const getCategoryColor = () => {
    return colors.categories[category.id as keyof typeof colors.categories] || colors.primary;
  };
  
  const getProgressPercentage = () => {
    if (!progress || progress.totalQuestions === 0) return 0;
    return progress.questionsAnswered / progress.totalQuestions;
  };
  
  const getAverageScore = () => {
    if (!progress || progress.questionsAnswered === 0) return 0;
    return Math.round(progress.averageScore);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor() }]}>
                <Icon name={category.icon || 'book'} size={48} color="white" />
              </View>
              <View style={styles.headerInfo}>
                <Title style={styles.categoryTitle}>{category.name}</Title>
                <Paragraph style={styles.categoryDescription}>
                  {category.description || 'Master this NDT category'}
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Statistics Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Your Progress</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{categoryQuestions.length}</Text>
                <Text style={styles.statLabel}>Total Questions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{progress?.questionsAnswered || 0}</Text>
                <Text style={styles.statLabel}>Answered</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getAverageScore()}%</Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={getProgressPercentage()}
                color={getCategoryColor()}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {Math.round(getProgressPercentage() * 100)}% Complete
              </Text>
            </View>
          </Card.Content>
        </Card>
        
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('StudyMode', { categoryId })}
            style={styles.actionButton}
            buttonColor={colors.primary}
            icon="book-open-variant"
          >
            Study Mode
          </Button>
          
          <Button
            mode="contained"
            onPress={() =>
              navigation.navigate('Test', {
                testType: 'category',
                categoryId,
                timeLimit: 0,
              })
            }
            style={styles.actionButton}
            buttonColor={colors.success}
            icon="pencil"
          >
            Practice Test
          </Button>
          
          <Button
            mode="outlined"
            onPress={() =>
              navigation.navigate('Test', {
                testType: 'category',
                categoryId,
                timeLimit: 60,
              })
            }
            style={styles.actionButton}
            textColor={colors.accent}
            icon="timer"
          >
            Timed Test (60 min)
          </Button>
        </View>
        
        {/* Subcategories or Topics */}
        {category.subcategories && category.subcategories.length > 0 && (
          <Card style={styles.topicsCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Topics Covered</Title>
              <View style={styles.topicsContainer}>
                {category.subcategories.map((sub, index) => (
                  <Chip
                    key={index}
                    style={[styles.topicChip, { backgroundColor: getCategoryColor() + '20' }]}
                    textStyle={{ color: getCategoryColor() }}
                  >
                    {sub.name}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    paddingHorizontal: 30,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  topicsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 2,
    borderRadius: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8,
  },
  topicChip: {
    margin: 4,
  },
});

export default CategoryDetailScreen; 