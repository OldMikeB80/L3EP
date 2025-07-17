import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, FAB, Chip, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '@store/store';
import {
  loadQuestionsByCategory,
  toggleBookmark,
  loadCategories,
  loadAllQuestions,
} from '@store/slices/questionSlice';
import { Question } from '@models/Question';
import { DatabaseService } from '@services/database/DatabaseService';
import { colors } from '@constants/colors';

const { width } = Dimensions.get('window');

interface StudyModeScreenProps {
  categoryId?: string;
}

const StudyModeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();

  const { categoryId } = (route.params as StudyModeScreenProps) || {};

  const { questions, categories } = useAppSelector((state) => state.questions);
  const { currentUser } = useAppSelector((state) => state.user);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  useEffect(() => {
    if (categoryId) {
      console.log('StudyModeScreen: Loading questions for category:', categoryId);
      dispatch(loadQuestionsByCategory(categoryId));
    } else {
      // Load all questions when no category is specified
      console.log('StudyModeScreen: Loading all questions');
      dispatch(loadAllQuestions());
    }
    dispatch(loadCategories());
  }, [categoryId, dispatch]);

  const filteredQuestions = questions.filter((q) => {
    if (onlyBookmarked && !q.isBookmarked) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    return true;
  });

  useEffect(() => {
    console.log('StudyModeScreen: Questions loaded:', questions.length);
    console.log('StudyModeScreen: Filtered questions:', filteredQuestions.length);
  }, [questions, filteredQuestions]);

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

  const handleBookmark = () => {
    if (currentQuestion) {
      // Use a default user ID if no user is logged in
      const userId = currentUser?.id || 'default-user';
      dispatch(
        toggleBookmark({
          userId: userId,
          questionId: currentQuestion.id,
        }) as any,
      );
    }
  };

  const renderCardView = () => {
    if (!currentQuestion) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Icon
              name="help-circle-outline"
              size={64}
              color="#999"
              style={{ alignSelf: 'center' }}
            />
            <Text style={styles.emptyText}>No questions available</Text>
            <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>
              Total questions loaded: {questions.length}
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                console.log('Reloading questions...');
                if (categoryId) {
                  dispatch(loadQuestionsByCategory(categoryId));
                } else {
                  dispatch(loadAllQuestions());
                }
              }}
              style={{ marginTop: 20 }}
            >
              Reload Questions
            </Button>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.questionCard}>
        <Card.Content>
          {/* Question Header */}
          <View style={styles.questionHeader}>
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
            <IconButton
              icon={currentQuestion.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              onPress={handleBookmark}
              size={24}
            />
          </View>

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
                  onPress={() => setShowAnswer(true)}
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
                    {showAsCorrect && <Icon name="check-circle" size={24} color={colors.success} />}
                    {showAsIncorrect && <Icon name="close-circle" size={24} color={colors.error} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {showAnswer && (
            <View style={styles.explanationContainer}>
              <View style={styles.explanationHeader}>
                <Icon name="information" size={20} color="#1976D2" />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Paragraph style={styles.explanationText}>{currentQuestion.explanation}</Paragraph>

              {currentQuestion.references && currentQuestion.references.length > 0 && (
                <View style={styles.referencesContainer}>
                  <Text style={styles.referencesTitle}>References:</Text>
                  {currentQuestion.references.map((ref, index) => (
                    <Text key={index} style={styles.referenceText}>
                      • {ref}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderListView = () => {
    return (
      <ScrollView style={styles.listContainer}>
        {filteredQuestions.map((question, index) => (
          <TouchableOpacity
            key={question.id}
            onPress={() => {
              setCurrentIndex(index);
              setViewMode('card');
              setShowAnswer(false);
            }}
          >
            <Card style={styles.listItem}>
              <Card.Content>
                <View style={styles.listItemHeader}>
                  <Text style={styles.listItemNumber}>Q{index + 1}</Text>
                  <Chip style={styles.listDifficultyChip}>{question.difficulty}</Chip>
                  {question.isBookmarked && <Icon name="bookmark" size={16} color="#FF9800" />}
                </View>
                <Text style={styles.listItemText} numberOfLines={2}>
                  {question.question}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Study Mode</Text>
          {currentCategory && <Text style={styles.headerSubtitle}>{currentCategory.name}</Text>}
        </View>

        <TouchableOpacity onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}>
          <Icon name={viewMode === 'card' ? 'view-list' : 'card'} size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal style={styles.filterContainer} showsHorizontalScrollIndicator={false}>
        <Chip
          selected={filterDifficulty === 'all'}
          onPress={() => setFilterDifficulty('all')}
          style={styles.filterChip}
        >
          All Levels
        </Chip>
        <Chip
          selected={filterDifficulty === 'easy'}
          onPress={() => setFilterDifficulty('easy')}
          style={styles.filterChip}
        >
          Easy
        </Chip>
        <Chip
          selected={filterDifficulty === 'medium'}
          onPress={() => setFilterDifficulty('medium')}
          style={styles.filterChip}
        >
          Medium
        </Chip>
        <Chip
          selected={filterDifficulty === 'hard'}
          onPress={() => setFilterDifficulty('hard')}
          style={styles.filterChip}
        >
          Hard
        </Chip>
        <Chip
          selected={onlyBookmarked}
          onPress={() => setOnlyBookmarked(!onlyBookmarked)}
          style={styles.filterChip}
          icon="bookmark"
        >
          Bookmarked
        </Chip>
      </ScrollView>

      {/* Progress Bar */}
      {viewMode === 'card' && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {filteredQuestions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {viewMode === 'card' ? renderCardView() : renderListView()}
      </View>

      {/* Navigation Controls */}
      <View style={styles.navigationControls}>
        <Button
          mode="contained"
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          labelStyle={currentIndex === 0 ? styles.navButtonTextDisabled : undefined}
        >
          Previous
        </Button>

        <Text style={styles.progressIndicator}>
          {currentIndex + 1} / {filteredQuestions.length}
        </Text>

        <Button
          mode="contained"
          onPress={handleNext}
          disabled={currentIndex === filteredQuestions.length - 1}
          style={[
            styles.navButton,
            currentIndex === filteredQuestions.length - 1 && styles.navButtonDisabled,
          ]}
          labelStyle={
            currentIndex === filteredQuestions.length - 1 ? styles.navButtonTextDisabled : undefined
          }
        >
          Next
        </Button>
      </View>

      {/* Floating Action Button for Quick Actions */}
      <FAB.Group
        open={false}
        visible
        icon="dots-vertical"
        actions={[
          {
            icon: 'shuffle',
            label: 'Shuffle',
            onPress: () => console.log('Shuffle questions'),
          },
          {
            icon: 'notebook',
            label: 'Notes',
            onPress: () => console.log('Open notes'),
          },
          {
            icon: 'chart-line',
            label: 'Stats',
            onPress: () => navigation.navigate('Progress' as never),
          },
        ]}
        onStateChange={() => {}}
        style={styles.fab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
  },
  filterChip: {
    backgroundColor: colors.surfaceVariant,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.textPrimary,
  },
  filterChipTextSelected: {
    color: colors.textOnPrimary,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Card View Styles
  cardContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  questionCard: {
    margin: 20,
    elevation: 4,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  questionContent: {
    padding: 20,
  },
  questionLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: 15,
  },
  optionsContainer: {
    marginVertical: 10,
  },
  optionCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
  },
  optionCardCorrect: {
    borderColor: colors.success,
    backgroundColor: '#E8F5E9',
  },
  optionText: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.textPrimary,
  },
  correctAnswer: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  correctAnswerText: {
    color: colors.textOnPrimary,
  },
  showAnswerButton: {
    marginTop: 20,
    backgroundColor: colors.accent,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.primary,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  referencesContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#90CAF9',
  },
  referencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  referenceText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
  },
  // List View Styles
  listContainer: {
    paddingVertical: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  listItemNumberText: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
  },
  listItemContent: {
    flex: 1,
  },
  listItemQuestion: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemDifficulty: {
    fontSize: 12,
    marginRight: 10,
  },
  difficultyEasy: {
    color: colors.success,
  },
  difficultyMedium: {
    color: colors.warning,
  },
  difficultyHard: {
    color: colors.error,
  },
  listItemBookmark: {
    marginLeft: 10,
  },
  listItemText: {
    fontSize: 15,
    color: '#333',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    padding: 10,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  progressIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
  // Additional styles
  categoryChip: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.accent,
  },
  categoryChipText: {
    color: colors.textOnAccent,
    fontSize: 12,
  },
  // Empty state
  emptyCard: {
    margin: 20,
    padding: 40,
    backgroundColor: colors.surface,
    elevation: 2,
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: colors.textSecondary,
  },
  // Question header styles
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  difficultyChip: {
    height: 28,
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
  // Option styles
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: colors.success,
    borderWidth: 2,
  },
  incorrectOption: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.error,
    borderWidth: 2,
    opacity: 0.9,
  },
  correctText: {
    fontWeight: '600',
    color: colors.success,
  },
  incorrectText: {
    fontWeight: '600',
    color: colors.error,
    opacity: 0.7,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookmarkButton: {
    padding: 10,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  listDifficultyChip: {
    marginRight: 10,
  },
});

export default StudyModeScreen;
