import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, ProgressBar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '@store/store';
import { loadCategories } from '@store/slices/questionSlice';

const { width } = Dimensions.get('window');

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { categories } = useAppSelector((state) => state.questions);
  const { categoryProgress } = useAppSelector((state) => state.progress);

  useEffect(() => {
    dispatch(loadCategories());
  }, []);

  const getCategoryProgress = (categoryId: string) => {
    const progress = categoryProgress[categoryId];
    if (!progress) return 0;
    return (progress.questionsAnswered / progress.totalQuestions) || 0;
  };

  const getCategoryScore = (categoryId: string) => {
    const progress = categoryProgress[categoryId];
    if (!progress || progress.questionsAnswered === 0) return null;
    return progress.averageScore;
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('CategoryDetail' as never, { categoryId } as never);
  };

  const handleStartPractice = (categoryId: string) => {
    navigation.navigate('Test' as never, { 
      testType: 'category',
      categoryId,
      timeLimit: 0,
    } as never);
  };

  const handleStartStudy = (categoryId: string) => {
    navigation.navigate('StudyMode' as never, { categoryId } as never);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <Title style={styles.screenTitle}>Categories</Title>
        <Paragraph style={styles.screenSubtitle}>
          Master each category to prepare for your NDT Level III exam
        </Paragraph>
      </View>

      {/* Categories Grid */}
      <View style={styles.categoriesContainer}>
        {categories.map((category) => {
          const progress = getCategoryProgress(category.id);
          const score = getCategoryScore(category.id);
          
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.8}
            >
              <Card style={styles.card}>
                <Card.Content>
                  {/* Category Header */}
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      <Icon name={category.icon} size={28} color="white" />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryQuestions}>
                        {category.totalQuestions} questions
                      </Text>
                    </View>
                  </View>

                  {/* Category Description */}
                  <Paragraph style={styles.categoryDescription} numberOfLines={2}>
                    {category.description}
                  </Paragraph>

                  {/* Progress Section */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressPercentage}>
                        {(progress * 100).toFixed(0)}%
                      </Text>
                    </View>
                    <ProgressBar 
                      progress={progress} 
                      color={category.color} 
                      style={styles.progressBar}
                    />
                  </View>

                  {/* Score Display */}
                  {score !== null && (
                    <View style={styles.scoreSection}>
                      <Icon 
                        name="chart-line" 
                        size={16} 
                        color={score >= 70 ? '#4CAF50' : '#FF9800'} 
                      />
                      <Text style={[
                        styles.scoreText,
                        { color: score >= 70 ? '#4CAF50' : '#FF9800' }
                      ]}>
                        Average Score: {score.toFixed(0)}%
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: category.color + '20' }]}
                      onPress={() => handleStartStudy(category.id)}
                    >
                      <Icon name="book-open-variant" size={18} color={category.color} />
                      <Text style={[styles.actionButtonText, { color: category.color }]}>
                        Study
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.practiceButton]}
                      onPress={() => handleStartPractice(category.id)}
                    >
                      <Icon name="pencil" size={18} color="white" />
                      <Text style={[styles.actionButtonText, styles.practiceButtonText]}>
                        Practice
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* All Categories Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <Icon name="certificate" size={24} color="#1976D2" />
            <Title style={styles.summaryTitle}>Overall Progress</Title>
          </View>
          
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {categories.reduce((sum, cat) => sum + cat.totalQuestions, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Questions</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Object.values(categoryProgress).reduce(
                  (sum, prog) => sum + prog.questionsAnswered, 0
                )}
              </Text>
              <Text style={styles.statLabel}>Answered</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {(
                  (Object.values(categoryProgress).reduce(
                    (sum, prog) => sum + prog.questionsAnswered, 0
                  ) / 
                  categories.reduce((sum, cat) => sum + cat.totalQuestions, 0)) * 100
                ).toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
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
  headerStats: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  categoriesContainer: {
    padding: 10,
  },
  categoryCard: {
    marginBottom: 15,
  },
  card: {
    marginHorizontal: 10,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoryQuestions: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  practiceButton: {
    backgroundColor: '#1976D2',
  },
  practiceButtonText: {
    color: 'white',
  },
  summaryCard: {
    margin: 20,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    marginLeft: 10,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default CategoriesScreen; 