import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, RadioButton, Button, ProgressBar, IconButton, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import MathJax from 'react-native-mathjax'; // Temporarily disabled
import { useAppDispatch, useAppSelector } from '@store/store';
import { Question, Option } from '@models/Question';
import { TestSession, TestQuestion } from '@models/User';
import { submitAnswer, nextQuestion, previousQuestion, bookmarkQuestion } from '@store/slices/testSlice';

const { width, height } = Dimensions.get('window');

interface TestScreenProps {
  testType: 'practice' | 'mock' | 'category' | 'weak_areas';
  categoryId?: string;
  timeLimit?: number; // in minutes
}

const TestScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  
  const { testType, categoryId, timeLimit } = route.params as TestScreenProps;
  
  const { currentQuestion, questionIndex, totalQuestions, testSession } = useAppSelector(
    (state) => state.test
  );
  
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : 0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeLimit && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Time\'s Up!',
      'The test time has expired. Your answers have been saved.',
      [
        {
          text: 'View Results',
          onPress: () => navigation.navigate('TestResults' as never),
        },
      ],
      { cancelable: false }
    );
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      Alert.alert('Select an Answer', 'Please select an answer before proceeding.');
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
    
    dispatch(
      submitAnswer({
        questionId: currentQuestion!.id,
        userAnswer: selectedAnswer,
        isCorrect,
        timeSpent: timeLimit ? (timeLimit * 60 - timeRemaining) : 0,
        confidence,
      })
    );

    if (testType === 'practice') {
      setShowExplanation(true);
    } else {
      handleNextQuestion();
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < totalQuestions - 1) {
      dispatch(nextQuestion());
      setSelectedAnswer('');
      setShowExplanation(false);
      setConfidence('medium');
    } else {
      // Test completed
      Alert.alert(
        'Test Completed!',
        'You have completed all questions.',
        [
          {
            text: 'View Results',
            onPress: () => navigation.navigate('TestResults' as never),
          },
        ]
      );
    }
  };

  const handlePreviousQuestion = () => {
    if (questionIndex > 0) {
      dispatch(previousQuestion());
      setSelectedAnswer('');
      setShowExplanation(false);
    }
  };

  const handleBookmark = () => {
    dispatch(bookmarkQuestion(currentQuestion!.id));
  };

  const renderOption = (option: Option) => {
    const isSelected = selectedAnswer === option.id;
    const isCorrect = showExplanation && option.id === currentQuestion?.correctAnswer;
    const isWrong = showExplanation && isSelected && !isCorrect;

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionCard,
          isSelected && styles.selectedOption,
          isCorrect && styles.correctOption,
          isWrong && styles.wrongOption,
        ]}
        onPress={() => !showExplanation && setSelectedAnswer(option.id)}
        disabled={showExplanation}
      >
        <View style={styles.optionContent}>
          <RadioButton
            value={option.id}
            status={isSelected ? 'checked' : 'unchecked'}
            onPress={() => !showExplanation && setSelectedAnswer(option.id)}
            disabled={showExplanation}
            color={isCorrect ? '#4CAF50' : isWrong ? '#F44336' : '#1976D2'}
          />
          <Text style={[styles.optionText, (isCorrect || isWrong) && styles.highlightedText]}>
            {option.text}
          </Text>
        </View>
        {option.imageUrl && (
          <Image source={{ uri: option.imageUrl }} style={styles.optionImage} />
        )}
      </TouchableOpacity>
    );
  };

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading question...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.progressInfo}>
            <Text style={styles.questionNumber}>
              Question {questionIndex + 1} of {totalQuestions}
            </Text>
          </View>
          
          {timeLimit && (
            <View style={[styles.timerContainer, timeRemaining < 300 && styles.timerWarning]}>
              <Icon name="timer" size={18} color={timeRemaining < 300 ? '#F44336' : '#666'} />
              <Text style={[styles.timerText, timeRemaining < 300 && styles.timerTextWarning]}>
                {formatTime(timeRemaining)}
              </Text>
            </View>
          )}
        </View>
        
        <ProgressBar 
          progress={(questionIndex + 1) / totalQuestions} 
          color="#1976D2" 
          style={styles.progressBar}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <Card style={styles.questionCard}>
          <Card.Content>
            <View style={styles.questionHeader}>
              <View style={styles.questionMeta}>
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
                <TouchableOpacity onPress={handleBookmark}>
                  <Icon 
                    name={currentQuestion.isBookmarked ? "bookmark" : "bookmark-outline"} 
                    size={24} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            
            {currentQuestion.imageUrl && (
              <Image 
                source={{ uri: currentQuestion.imageUrl }} 
                style={styles.questionImage}
                resizeMode="contain"
              />
            )}
            
            {currentQuestion.formulaLatex && (
              <View style={styles.mathJax}>
                <Text style={styles.formulaText}>
                  Formula: {currentQuestion.formulaLatex}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map(renderOption)}
        </View>

        {/* Confidence Level (for practice mode) */}
        {testType === 'practice' && !showExplanation && (
          <Card style={styles.confidenceCard}>
            <Card.Content>
              <Text style={styles.confidenceTitle}>How confident are you?</Text>
              <View style={styles.confidenceButtons}>
                <TouchableOpacity
                  style={[styles.confidenceButton, confidence === 'low' && styles.confidenceSelected]}
                  onPress={() => setConfidence('low')}
                >
                  <Text style={[styles.confidenceText, confidence === 'low' && styles.confidenceTextSelected]}>
                    Low
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confidenceButton, confidence === 'medium' && styles.confidenceSelected]}
                  onPress={() => setConfidence('medium')}
                >
                  <Text style={[styles.confidenceText, confidence === 'medium' && styles.confidenceTextSelected]}>
                    Medium
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confidenceButton, confidence === 'high' && styles.confidenceSelected]}
                  onPress={() => setConfidence('high')}
                >
                  <Text style={[styles.confidenceText, confidence === 'high' && styles.confidenceTextSelected]}>
                    High
                  </Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Explanation (shown after answering in practice mode) */}
        {showExplanation && (
          <Card style={styles.explanationCard}>
            <Card.Content>
              <View style={styles.explanationHeader}>
                <Icon 
                  name={selectedAnswer === currentQuestion.correctAnswer ? "check-circle" : "close-circle"} 
                  size={24} 
                  color={selectedAnswer === currentQuestion.correctAnswer ? "#4CAF50" : "#F44336"} 
                />
                <Text style={styles.explanationTitle}>
                  {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
                </Text>
              </View>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              
              {currentQuestion.references && currentQuestion.references.length > 0 && (
                <View style={styles.referencesContainer}>
                  <Text style={styles.referencesTitle}>References:</Text>
                  {currentQuestion.references.map((ref, index) => (
                    <Text key={index} style={styles.referenceText}>• {ref}</Text>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Button
          mode="outlined"
          onPress={handlePreviousQuestion}
          disabled={questionIndex === 0}
          style={styles.navButton}
        >
          Previous
        </Button>
        
        <Button
          mode="contained"
          onPress={showExplanation ? handleNextQuestion : handleSubmitAnswer}
          style={styles.navButton}
        >
          {showExplanation ? (questionIndex === totalQuestions - 1 ? 'Finish' : 'Next') : 'Submit'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressInfo: {
    flex: 1,
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  timerWarning: {
    backgroundColor: '#FFEBEE',
  },
  timerText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timerTextWarning: {
    color: '#F44336',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    marginBottom: 20,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  questionImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
  mathJax: {
    backgroundColor: 'transparent',
  },
  formulaText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: 10,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  wrongOption: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  highlightedText: {
    fontWeight: '600',
  },
  optionImage: {
    width: '100%',
    height: 100,
    marginTop: 10,
    borderRadius: 4,
  },
  confidenceCard: {
    marginBottom: 20,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  confidenceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confidenceButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  confidenceSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  confidenceTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  explanationCard: {
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  explanationTitle: {
    fontSize: 18,
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
    borderTopColor: '#E0E0E0',
  },
  referencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  referenceText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flex: 0.45,
  },
});

export default TestScreen; 