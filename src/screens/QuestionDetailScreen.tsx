import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '@store/store';
import { colors } from '@constants/colors';

const QuestionDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { questionId } = route.params;
  
  const { questions } = useAppSelector((state) => state.questions);
  const question = questions.find((q) => q.id === questionId);
  
  if (!question) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Question not found</Text>
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
  
  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Question Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.questionHeader}>
              <Title style={styles.questionTitle}>Question</Title>
              <Chip
                style={[styles.difficultyChip, { backgroundColor: getDifficultyColor() + '20' }]}
                textStyle={{ color: getDifficultyColor() }}
              >
                {question.difficulty?.toUpperCase() || 'MEDIUM'}
              </Chip>
            </View>
            <Paragraph style={styles.questionText}>{question.question}</Paragraph>
          </Card.Content>
        </Card>
        
        {/* Options Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Options</Title>
            {question.options.map((option, index) => {
              const isCorrect = option.id === question.correctAnswer;
              return (
                <View
                  key={option.id}
                  style={[
                    styles.optionItem,
                    isCorrect && styles.correctOption,
                  ]}
                >
                  <Text style={styles.optionLabel}>
                    {String.fromCharCode(65 + index)}. {option.text}
                  </Text>
                  {isCorrect && (
                    <Icon name="check-circle" size={20} color={colors.success} />
                  )}
                </View>
              );
            })}
          </Card.Content>
        </Card>
        
        {/* Explanation Card */}
        {question.explanation && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Explanation</Title>
              <Paragraph style={styles.explanationText}>{question.explanation}</Paragraph>
            </Card.Content>
          </Card>
        )}
        
        {/* References Card */}
        {question.reference_texts && question.reference_texts.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>References</Title>
              {question.reference_texts.map((ref, index) => (
                <View key={index} style={styles.referenceItem}>
                  <Icon name="book-open-variant" size={16} color={colors.primary} />
                  <Text style={styles.referenceText}>{ref}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
        
        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Tags</Title>
              <View style={styles.tagsContainer}>
                {question.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    style={styles.tagChip}
                    textStyle={styles.tagText}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
            textColor={colors.primary}
          >
            Back to Questions
          </Button>
        </View>
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
    paddingBottom: 20,
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
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  difficultyChip: {
    height: 28,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  correctOption: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
  },
  optionLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -4,
  },
  tagChip: {
    margin: 4,
    backgroundColor: colors.primary + '20',
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  actionButton: {
    borderRadius: 8,
  },
});

export default QuestionDetailScreen; 