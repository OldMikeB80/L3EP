import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, RadioButton, Chip, Switch, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '@store/store';
import { startTestSession } from '@store/slices/testSlice';

interface ExamConfiguration {
  numberOfQuestions: number;
  timeLimit: number; // minutes
  categories: string[];
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
  shuffleQuestions: boolean;
  allowReview: boolean;
}

const MockExamSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { categories } = useAppSelector((state) => state.questions);

  const [config, setConfig] = useState<ExamConfiguration>({
    numberOfQuestions: 150, // Standard ASNT Level III exam length
    timeLimit: 240, // 4 hours
    categories: ['all'], // All categories by default
    difficulty: 'mixed',
    shuffleQuestions: true,
    allowReview: false,
  });

  const questionOptions = [
    { label: '50 Questions (Quick)', value: 50, time: 60 },
    { label: '100 Questions (Half)', value: 100, time: 150 },
    { label: '150 Questions (Full)', value: 150, time: 240 },
    { label: '200 Questions (Extended)', value: 200, time: 300 },
  ];

  const handleStartExam = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please log in to start a mock exam');
      return;
    }

    Alert.alert(
      'Start Mock Exam',
      `You are about to start a ${config.numberOfQuestions}-question mock exam with a ${config.timeLimit}-minute time limit. Are you ready?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: async () => {
            try {
              await dispatch(startTestSession({
                type: 'mock',
                numberOfQuestions: config.numberOfQuestions,
                timeLimit: config.timeLimit,
                userId: currentUser.id,
              })).unwrap();
              
              navigation.navigate('Test' as never, {
                testType: 'mock',
                timeLimit: config.timeLimit,
              } as never);
            } catch (error) {
              Alert.alert('Error', 'Failed to start mock exam');
            }
          }
        },
      ]
    );
  };

  const updateQuestionCount = (value: number) => {
    const option = questionOptions.find(opt => opt.value === value);
    if (option) {
      setConfig({
        ...config,
        numberOfQuestions: value,
        timeLimit: option.time,
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Exam Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoHeader}>
            <Icon name="information" size={24} color="#1976D2" />
            <Title style={styles.infoTitle}>ASNT Level III Mock Exam</Title>
          </View>
          <Paragraph style={styles.infoText}>
            This mock exam simulates the actual ASNT NDT Level III Basic examination. 
            The full exam consists of 150 questions to be completed in 4 hours, with a 
            passing score of 70%.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Exam Configuration */}
      <Card style={styles.configCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Exam Configuration</Title>
          
          {/* Question Count Selection */}
          <List.Subheader style={styles.subheader}>Number of Questions</List.Subheader>
          <RadioButton.Group 
            onValueChange={(value) => updateQuestionCount(Number(value))}
            value={config.numberOfQuestions.toString()}
          >
            {questionOptions.map((option) => (
              <View key={option.value} style={styles.radioItem}>
                <RadioButton value={option.value.toString()} />
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                  <Text style={styles.radioSubtext}>{option.time} minutes</Text>
                </View>
              </View>
            ))}
          </RadioButton.Group>

          {/* Difficulty Selection */}
          <List.Subheader style={styles.subheader}>Difficulty Level</List.Subheader>
          <View style={styles.chipContainer}>
            {['mixed', 'easy', 'medium', 'hard'].map((level) => (
              <Chip
                key={level}
                selected={config.difficulty === level}
                onPress={() => setConfig({ ...config, difficulty: level as any })}
                style={styles.chip}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Chip>
            ))}
          </View>

          {/* Additional Options */}
          <List.Subheader style={styles.subheader}>Options</List.Subheader>
          <View style={styles.switchItem}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>Shuffle Questions</Text>
              <Text style={styles.switchSubtext}>Randomize question order</Text>
            </View>
            <Switch
              value={config.shuffleQuestions}
              onValueChange={(value) => setConfig({ ...config, shuffleQuestions: value })}
              color="#1976D2"
            />
          </View>

          <View style={styles.switchItem}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>Allow Review</Text>
              <Text style={styles.switchSubtext}>Review answers after submission</Text>
            </View>
            <Switch
              value={config.allowReview}
              onValueChange={(value) => setConfig({ ...config, allowReview: value })}
              color="#1976D2"
            />
          </View>
        </Card.Content>
      </Card>

      {/* Exam Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Exam Summary</Title>
          
          <View style={styles.summaryRow}>
            <Icon name="help-circle" size={20} color="#666" />
            <Text style={styles.summaryLabel}>Questions:</Text>
            <Text style={styles.summaryValue}>{config.numberOfQuestions}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Icon name="timer" size={20} color="#666" />
            <Text style={styles.summaryLabel}>Time Limit:</Text>
            <Text style={styles.summaryValue}>
              {Math.floor(config.timeLimit / 60)}h {config.timeLimit % 60}m
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Icon name="target" size={20} color="#666" />
            <Text style={styles.summaryLabel}>Passing Score:</Text>
            <Text style={styles.summaryValue}>70%</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Icon name="puzzle" size={20} color="#666" />
            <Text style={styles.summaryLabel}>Difficulty:</Text>
            <Text style={styles.summaryValue}>
              {config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Tips Card */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <View style={styles.tipsHeader}>
            <Icon name="lightbulb" size={24} color="#FFC107" />
            <Title style={styles.tipsTitle}>Exam Tips</Title>
          </View>
          
          <View style={styles.tipItem}>
            <Icon name="clock-fast" size={16} color="#666" />
            <Text style={styles.tipText}>
              Pace yourself - aim for about 1.5 minutes per question
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Icon name="bookmark-outline" size={16} color="#666" />
            <Text style={styles.tipText}>
              Flag difficult questions and return to them later
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Icon name="eye-check" size={16} color="#666" />
            <Text style={styles.tipText}>
              Read each question carefully before selecting an answer
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Icon name="calculator" size={16} color="#666" />
            <Text style={styles.tipText}>
              Have a calculator ready for numerical questions
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
        
        <Button
          mode="contained"
          onPress={handleStartExam}
          style={styles.startButton}
          icon="play"
        >
          Start Exam
        </Button>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    margin: 20,
    backgroundColor: '#E3F2FD',
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 18,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  configCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  subheader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  radioContent: {
    marginLeft: 10,
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  radioSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  switchContent: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFF8E1',
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 0.45,
  },
  startButton: {
    flex: 0.45,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default MockExamSetupScreen; 