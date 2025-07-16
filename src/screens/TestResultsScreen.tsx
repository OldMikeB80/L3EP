import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, Chip, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { PieChart } from 'react-native-svg-charts'; // Removed - using chart-kit
import { useAppSelector, useAppDispatch } from '@store/store';
import { resetTest } from '@store/slices/testSlice';
import { incrementDailyStat, checkAchievements } from '@store/slices/progressSlice';

interface ResultCategory {
  name: string;
  correct: number;
  total: number;
  percentage: number;
}

const TestResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  
  const { testSession } = useAppSelector((state) => state.test);
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [categoryBreakdown, setCategoryBreakdown] = useState<ResultCategory[]>([]);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  useEffect(() => {
    if (testSession) {
      // Update daily stats
      dispatch(incrementDailyStat({
        stat: 'questionsAttempted',
        value: testSession.totalQuestions,
      }));
      dispatch(incrementDailyStat({
        stat: 'questionsCorrect',
        value: testSession.correctAnswers,
      }));
      
      // Check for new achievements
      dispatch(checkAchievements());
      
      // Calculate category breakdown
      calculateCategoryBreakdown();
    }
  }, [testSession]);

  const calculateCategoryBreakdown = () => {
    // In a real app, this would analyze questions by category
    // For now, using mock data
    const breakdown: ResultCategory[] = [
      {
        name: 'Certification Standards',
        correct: Math.floor(Math.random() * 10) + 5,
        total: 15,
        percentage: 0,
      },
      {
        name: 'Materials & Processes',
        correct: Math.floor(Math.random() * 8) + 4,
        total: 12,
        percentage: 0,
      },
      {
        name: 'NDT Methods',
        correct: Math.floor(Math.random() * 15) + 10,
        total: 20,
        percentage: 0,
      },
      {
        name: 'Safety & Quality',
        correct: Math.floor(Math.random() * 5) + 3,
        total: 8,
        percentage: 0,
      },
    ];
    
    breakdown.forEach(cat => {
      cat.percentage = (cat.correct / cat.total) * 100;
    });
    
    setCategoryBreakdown(breakdown);
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `I scored ${testSession?.score.toFixed(1)}% on my NDT Level III practice test! 
        Correct answers: ${testSession?.correctAnswers}/${testSession?.totalQuestions}
        Download NDT Exam Prep to practice: https://ndtexamprep.com`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleReturnHome = () => {
    dispatch(resetTest());
    navigation.navigate('Main' as never);
  };

  const handleReviewAnswers = () => {
    navigation.navigate('ReviewAnswers' as never, { sessionId: testSession?.id });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return 'Outstanding! You\'re well prepared!';
    if (score >= 80) return 'Great job! Keep up the excellent work!';
    if (score >= 70) return 'Good performance! A bit more practice will help.';
    if (score >= 60) return 'You\'re getting there! Focus on weak areas.';
    return 'Keep practicing! Review the material and try again.';
  };

  if (!testSession) {
    return (
      <View style={styles.container}>
        <Text>No test results available</Text>
      </View>
    );
  }

  const pieData = [
    {
      value: testSession.correctAnswers,
      svg: { fill: '#4CAF50' },
      key: 'correct',
    },
    {
      value: testSession.totalQuestions - testSession.correctAnswers,
      svg: { fill: '#F44336' },
      key: 'incorrect',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Score Card */}
      <Card style={styles.scoreCard}>
        <Card.Content style={styles.scoreContent}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: getScoreColor(testSession.score) }]}>
              {testSession.score.toFixed(0)}%
            </Text>
            <Text style={styles.scoreLabel}>Your Score</Text>
          </View>
          
          {/* Temporarily disabled PieChart until chart library is properly configured
          <View style={styles.pieChartContainer}>
            <PieChart
              style={{ height: 150, width: 150 }}
              data={pieData}
              spacing={0}
              outerRadius={'95%'}
              innerRadius={'60%'}
            />
            <View style={styles.pieChartCenter}>
              <Text style={styles.pieChartCenterText}>
                {testSession.correctAnswers}/{testSession.totalQuestions}
              </Text>
            </View>
          </View>
          */}
          <View style={styles.pieChartContainer}>
            <View style={styles.pieChartCenter}>
              <Text style={styles.pieChartCenterText}>
                {testSession?.correctAnswers || 0}/{testSession?.totalQuestions || 0}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Performance Message */}
      <Card style={styles.messageCard}>
        <Card.Content>
          <View style={styles.messageHeader}>
            <Icon 
              name={testSession.score >= 70 ? 'emoticon-happy' : 'emoticon-neutral'} 
              size={24} 
              color={getScoreColor(testSession.score)} 
            />
            <Title style={styles.messageTitle}>
              {getPerformanceMessage(testSession.score)}
            </Title>
          </View>
          
          <Paragraph style={styles.messageText}>
            You answered {testSession.correctAnswers} out of {testSession.totalQuestions} questions correctly.
            {testSession.score >= 70 
              ? ' You passed the practice test!' 
              : ' The passing score is 70%.'}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Test Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Test Summary</Title>
          
          <View style={styles.summaryRow}>
            <Icon name="help-circle" size={20} color="#666" />
            <Text style={styles.summaryLabel}>Total Questions:</Text>
            <Text style={styles.summaryValue}>{testSession.totalQuestions}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.summaryLabel}>Correct Answers:</Text>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
              {testSession.correctAnswers}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Icon name="close-circle" size={20} color="#F44336" />
            <Text style={styles.summaryLabel}>Incorrect Answers:</Text>
            <Text style={[styles.summaryValue, { color: '#F44336' }]}>
              {testSession.totalQuestions - testSession.correctAnswers}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Icon name="timer" size={20} color="#666" />
            <Text style={styles.summaryLabel}>Time Taken:</Text>
            <Text style={styles.summaryValue}>
              {testSession.duration ? `${Math.floor(testSession.duration / 60)}m ${testSession.duration % 60}s` : 'N/A'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Category Breakdown */}
      <Card style={styles.breakdownCard}>
        <Card.Content>
          <TouchableOpacity 
            style={styles.breakdownHeader}
            onPress={() => setShowDetailedResults(!showDetailedResults)}
          >
            <Title style={styles.sectionTitle}>Category Performance</Title>
            <Icon 
              name={showDetailedResults ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {showDetailedResults && categoryBreakdown.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryScore}>
                  {category.correct}/{category.total} ({category.percentage.toFixed(0)}%)
                </Text>
              </View>
              <ProgressBar 
                progress={category.percentage / 100} 
                color={getScoreColor(category.percentage)} 
                style={styles.categoryProgress}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Recommendations */}
      {testSession.score < 80 && (
        <Card style={styles.recommendationCard}>
          <Card.Content>
            <View style={styles.recommendationHeader}>
              <Icon name="lightbulb" size={24} color="#FFC107" />
              <Title style={styles.recommendationTitle}>Study Recommendations</Title>
            </View>
            
            <Paragraph style={styles.recommendationText}>
              Based on your performance, we recommend focusing on:
            </Paragraph>
            
            {categoryBreakdown
              .filter(cat => cat.percentage < 70)
              .map((cat, index) => (
                <Chip 
                  key={index} 
                  style={styles.recommendationChip}
                  icon="book-open-variant"
                >
                  {cat.name}
                </Chip>
              ))}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={handleReviewAnswers}
          style={styles.actionButton}
          icon="eye"
        >
          Review Answers
        </Button>
        
        <Button
          mode="contained"
          onPress={handleReturnHome}
          style={styles.actionButton}
          icon="home"
        >
          Return Home
        </Button>
      </View>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Icon name="share-variant" size={20} color="#1976D2" />
        <Text style={styles.shareText}>Share Results</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scoreCard: {
    margin: 20,
    elevation: 4,
  },
  scoreContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  pieChartCenterText: {
    fontSize: 18,
    fontWeight: '600',
  },
  messageCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageTitle: {
    fontSize: 18,
    marginLeft: 10,
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
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
  breakdownCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
  },
  categoryScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryProgress: {
    height: 6,
    borderRadius: 3,
  },
  recommendationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFF8E1',
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    marginBottom: 10,
  },
  recommendationChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 0.48,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
  },
  shareText: {
    fontSize: 16,
    color: '#1976D2',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default TestResultsScreen; 