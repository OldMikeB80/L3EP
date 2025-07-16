import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, FAB, Chip, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '@store/store';
import { loadQuestionsByCategory, toggleBookmark } from '@store/slices/questionSlice';
import { Question } from '@models/Question';

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
      dispatch(loadQuestionsByCategory(categoryId));
    }
  }, [categoryId]);

  const filteredQuestions = questions.filter(q => {
    if (onlyBookmarked && !q.isBookmarked) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    return true;
  });

  const currentQuestion = filteredQuestions[currentIndex];
  const currentCategory = categories.find(c => c.id === categoryId);

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
    if (currentQuestion && currentUser) {
      dispatch(toggleBookmark({
        userId: currentUser.id,
        questionId: currentQuestion.id,
      }));
    }
  };

  const renderCardView = () => {
    if (!currentQuestion) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>No questions available</Text>
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
              icon={currentQuestion.isBookmarked ? "bookmark" : "bookmark-outline"}
              onPress={handleBookmark}
              size={24}
            />
          </View>

          {/* Question Text */}
          <Title style={styles.questionText}>{currentQuestion.question}</Title>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  showAnswer && option.id === currentQuestion.correctAnswer && styles.correctOption,
                  showAnswer && option.id !== currentQuestion.correctAnswer && styles.incorrectOption,
                ]}
                onPress={() => setShowAnswer(true)}
                disabled={showAnswer}
              >
                <Text style={[
                  styles.optionText,
                  showAnswer && option.id === currentQuestion.correctAnswer && styles.correctText,
                ]}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Explanation */}
          {showAnswer && (
            <View style={styles.explanationContainer}>
              <View style={styles.explanationHeader}>
                <Icon name="information" size={20} color="#1976D2" />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Paragraph style={styles.explanationText}>
                {currentQuestion.explanation}
              </Paragraph>
              
              {currentQuestion.references && currentQuestion.references.length > 0 && (
                <View style={styles.referencesContainer}>
                  <Text style={styles.referencesTitle}>References:</Text>
                  {currentQuestion.references.map((ref, index) => (
                    <Text key={index} style={styles.referenceText}>• {ref}</Text>
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
                  <Chip size={20} style={styles.listDifficultyChip}>
                    {question.difficulty}
                  </Chip>
                  {question.isBookmarked && (
                    <Icon name="bookmark" size={16} color="#FF9800" />
                  )}
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
          {currentCategory && (
            <Text style={styles.headerSubtitle}>{currentCategory.name}</Text>
          )}
        </View>
        
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}>
          <Icon name={viewMode === 'card' ? 'view-list' : 'card'} size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        style={styles.filterContainer}
        showsHorizontalScrollIndicator={false}
      >
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
                { width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }
              ]}
            />
          </View>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {viewMode === 'card' ? renderCardView() : renderListView()}
      </View>

      {/* Navigation Controls (Card View Only) */}
      {viewMode === 'card' && (
        <View style={styles.navigationControls}>
          <Button
            mode="outlined"
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            style={styles.navButton}
            icon="chevron-left"
          >
            Previous
          </Button>
          
          {!showAnswer ? (
            <Button
              mode="contained"
              onPress={() => setShowAnswer(true)}
              style={styles.navButton}
              icon="eye"
            >
              Show Answer
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              style={styles.navButton}
              icon="chevron-right"
            >
              Next
            </Button>
          )}
        </View>
      )}

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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    maxHeight: 60,
  },
  filterChip: {
    marginRight: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
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
  emptyCard: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  questionCard: {
    elevation: 2,
  },
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
    borderColor: '#4CAF50',
  },
  mediumChip: {
    borderColor: '#FF9800',
  },
  hardChip: {
    borderColor: '#F44336',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  correctText: {
    fontWeight: '600',
    color: '#2E7D32',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
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
  listContainer: {
    flex: 1,
  },
  listItem: {
    marginBottom: 10,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginRight: 10,
  },
  listDifficultyChip: {
    marginRight: 10,
  },
  listItemText: {
    fontSize: 15,
    color: '#333',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flex: 0.48,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
});

export default StudyModeScreen; 