import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '@store/store';
import {
  loadQuestionsByCategory,
  toggleBookmark,
  loadAllQuestions,
} from '@store/slices/questionSlice';
import { Question } from '@models/Question';
import { colors } from '@constants/colors';

interface StudyModeScreenProps {
  categoryId?: string;
}

const StudyModeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();

  const { categoryId } = (route.params as StudyModeScreenProps) || {};

  const { questions, categories, isLoading } = useAppSelector((state) => state.questions);
  const { currentUser } = useAppSelector((state) => state.user);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  useEffect(() => {
    loadQuestions();
  }, [categoryId]);

  const loadQuestions = async () => {
    try {
      if (categoryId) {
        console.log('Loading questions for category:', categoryId);
        await dispatch(loadQuestionsByCategory(categoryId)).unwrap();
      } else {
        console.log('Loading all questions');
        await dispatch(loadAllQuestions()).unwrap();
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    return true;
  });

  const currentQuestion = filteredQuestions[currentIndex];
  const currentCategory = categories.find((c) => c.id === categoryId);

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleBookmark = async () => {
    if (currentQuestion && currentUser) {
      try {
        await dispatch(
          toggleBookmark({
            userId: currentUser.id,
            questionId: currentQuestion.id,
          })
        ).unwrap();
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
    }
  };

  const handleOptionPress = (optionId: string) => {
    if (!showAnswer) {
      setShowAnswer(true);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Study Mode</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.centerContainer}>
          <Icon name="help-circle-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>No questions available</Text>
          <Button
            mode="contained"
            onPress={loadQuestions}
            style={styles.reloadButton}
          >
            Reload Questions
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Study Mode</Text>
          {currentCategory && (
            <Text style={styles.headerSubtitle}>{currentCategory.name}</Text>
          )}
        </View>

        <TouchableOpacity onPress={handleBookmark}>
          <Icon
            name={currentQuestion?.isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* Difficulty Filter */}
      <ScrollView
        horizontal
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
        showsHorizontalScrollIndicator={false}
      >
        <Chip
          selected={filterDifficulty === 'all'}
          onPress={() => setFilterDifficulty('all')}
          style={[styles.filterChip, filterDifficulty === 'all' && styles.filterChipSelected]}
        >
          All Levels
        </Chip>
        <Chip
          selected={filterDifficulty === 'easy'}
          onPress={() => setFilterDifficulty('easy')}
          style={[styles.filterChip, filterDifficulty === 'easy' && styles.filterChipSelected]}
        >
          Easy
        </Chip>
        <Chip
          selected={filterDifficulty === 'medium'}
          onPress={() => setFilterDifficulty('medium')}
          style={[styles.filterChip, filterDifficulty === 'medium' && styles.filterChipSelected]}
        >
          Medium
        </Chip>
        <Chip
          selected={filterDifficulty === 'hard'}
          onPress={() => setFilterDifficulty('hard')}
          style={[styles.filterChip, filterDifficulty === 'hard' && styles.filterChipSelected]}
        >
          Hard
        </Chip>
      </ScrollView>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {filteredQuestions.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Question Card */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentQuestion && (
          <Card style={styles.questionCard}>
            <Card.Content>
              {/* Difficulty Badge */}
              <Chip
                mode="outlined"
                style={[
                  styles.difficultyChip,
                  currentQuestion.difficulty === 'easy' && styles.easyChip,
                  currentQuestion.difficulty === 'medium' && styles.mediumChip,
                  currentQuestion.difficulty === 'hard' && styles.hardChip,
                ]}
              >
                {currentQuestion.difficulty.toUpperCase()}
              </Chip>

              {/* Question Text */}
              <Title style={styles.questionText}>{currentQuestion.question}</Title>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option) => {
                  const isCorrect = option.id === currentQuestion.correctAnswer;
                  const showAsCorrect = showAnswer && isCorrect;
                  const showAsIncorrect = showAnswer && !isCorrect;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        showAsCorrect && styles.correctOption,
                        showAsIncorrect && styles.incorrectOption,
                      ]}
                      onPress={() => handleOptionPress(option.id)}
                      disabled={showAnswer}
                    >
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionText,
                            showAsCorrect && styles.correctText,
                            showAsIncorrect && styles.incorrectText,
                          ]}
                        >
                          {option.text}
                        </Text>
                        {showAsCorrect && (
                          <Icon name="check-circle" size={20} color={colors.success} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Explanation */}
              {showAnswer && currentQuestion.explanation && (
                <View style={styles.explanationContainer}>
                  <View style={styles.explanationHeader}>
                    <Icon name="information" size={20} color={colors.primary} />
                    <Text style={styles.explanationTitle}>Explanation</Text>
                  </View>
                  <Paragraph style={styles.explanationText}>
                    {currentQuestion.explanation}
                  </Paragraph>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Navigation Controls */}
      <View style={styles.navigationControls}>
        <Button
          mode="contained"
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
        >
          Previous
        </Button>

        <Button
          mode="contained"
          onPress={handleNext}
          disabled={currentIndex === filteredQuestions.length - 1}
          style={[
            styles.navButton,
            currentIndex === filteredQuestions.length - 1 && styles.navButtonDisabled,
          ]}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterScroll: {
    backgroundColor: colors.surface,
    maxHeight: 60,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: colors.surfaceVariant,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    elevation: 2,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  difficultyChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  easyChip: {
    borderColor: colors.success,
  },
  mediumChip: {
    borderColor: colors.warning,
  },
  hardChip: {
    borderColor: colors.error,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 8,
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: colors.success,
    borderWidth: 2,
  },
  incorrectOption: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.error,
    borderWidth: 1,
    opacity: 0.7,
  },
  correctText: {
    color: colors.success,
    fontWeight: '600',
  },
  incorrectText: {
    color: colors.error,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: colors.primary,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    paddingHorizontal: 32,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    color: colors.textSecondary,
  },
  reloadButton: {
    marginTop: 20,
  },
});

export default StudyModeScreen;
