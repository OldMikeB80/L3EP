import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, ProgressBar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';
import { useAppSelector } from '@store/store';
import { DatabaseService } from '@services/database/DatabaseService';

const { width } = Dimensions.get('window');

interface ChartData {
  value: number;
  label: string;
  date?: Date;
}

interface CategoryProgress {
  name: string;
  progress: number;
  questionsAnswered: number;
  totalQuestions: number;
  averageScore: number;
  color: string;
}

const ProgressScreen: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const [weeklyData, setWeeklyData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryProgress[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [totalStats, setTotalStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    studyTime: 0,
    averageScore: 0,
    strongCategories: [] as string[],
    weakCategories: [] as string[],
  });

  useEffect(() => {
    loadProgressData();
  }, [selectedPeriod]);

  const loadProgressData = async () => {
    // Load data from database
    const db = DatabaseService.getInstance();
    // Implementation would fetch actual data
    
    // Mock data for now
    setWeeklyData([
      { value: 75, label: 'Mon', date: new Date() },
      { value: 82, label: 'Tue', date: new Date() },
      { value: 78, label: 'Wed', date: new Date() },
      { value: 85, label: 'Thu', date: new Date() },
      { value: 90, label: 'Fri', date: new Date() },
      { value: 88, label: 'Sat', date: new Date() },
      { value: 92, label: 'Sun', date: new Date() },
    ]);

    setCategoryData([
      {
        name: 'Certification Standards',
        progress: 0.75,
        questionsAnswered: 150,
        totalQuestions: 200,
        averageScore: 82,
        color: '#4CAF50',
      },
      {
        name: 'Materials & Processes',
        progress: 0.60,
        questionsAnswered: 120,
        totalQuestions: 200,
        averageScore: 75,
        color: '#2196F3',
      },
      {
        name: 'NDT Methods',
        progress: 0.85,
        questionsAnswered: 340,
        totalQuestions: 400,
        averageScore: 88,
        color: '#FF9800',
      },
      {
        name: 'Safety & Quality',
        progress: 0.45,
        questionsAnswered: 90,
        totalQuestions: 200,
        averageScore: 68,
        color: '#9C27B0',
      },
    ]);

    setTotalStats({
      totalQuestions: 700,
      correctAnswers: 574,
      studyTime: 2460, // minutes
      averageScore: 82,
      strongCategories: ['NDT Methods', 'Certification Standards'],
      weakCategories: ['Safety & Quality'],
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#1976D2',
    },
  };

  const pieData = categoryData.map((category) => ({
    name: category.name,
    population: category.questionsAnswered,
    color: category.color,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <Text style={styles.screenTitle}>Your Progress</Text>
        
        <View style={styles.periodSelector}>
          {['week', 'month', 'all'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period as any)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'all' ? 'All Time' : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Overall Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{totalStats.correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct Answers</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="percent" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{totalStats.averageScore}%</Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="clock-outline" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{formatTime(totalStats.studyTime)}</Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="help-circle" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>{totalStats.totalQuestions}</Text>
            <Text style={styles.statLabel}>Questions Attempted</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Performance Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Performance Trend</Title>
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: weeklyData.map(d => d.label),
                datasets: [
                  {
                    data: weeklyData.map(d => d.value),
                  },
                ],
              }}
              width={width - 60}
              height={220}
              yAxisSuffix="%"
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Category Progress */}
      <Card style={styles.categoryCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Category Breakdown</Title>
          
          {categoryData.map((category) => (
            <View key={category.name} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryScore}>{category.averageScore}%</Text>
              </View>
              
              <ProgressBar 
                progress={category.progress} 
                color={category.color} 
                style={styles.categoryProgress}
              />
              
              <View style={styles.categoryStats}>
                <Text style={styles.categoryStatText}>
                  {category.questionsAnswered} / {category.totalQuestions} questions
                </Text>
                <Text style={styles.categoryStatText}>
                  {Math.round(category.progress * 100)}% complete
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Study Distribution Pie Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Study Distribution</Title>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={pieData}
              width={width - 60}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
          <View style={styles.legendContainer}>
            {categoryData.map((category) => (
              <View key={category.name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: category.color }]} />
                <Text style={styles.legendText}>{category.name}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Insights & Recommendations */}
      <Card style={styles.insightsCard}>
        <Card.Content>
          <View style={styles.insightsHeader}>
            <Icon name="lightbulb" size={24} color="#FFC107" />
            <Title style={styles.insightsTitle}>Insights & Recommendations</Title>
          </View>

          <View style={styles.insightItem}>
            <Icon name="trending-up" size={20} color="#4CAF50" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Strong Performance</Text>
              <Text style={styles.insightText}>
                You're excelling in {totalStats.strongCategories.join(' and ')}. 
                Keep up the great work!
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Icon name="alert-circle" size={20} color="#FF9800" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Focus Areas</Text>
              <Text style={styles.insightText}>
                Consider spending more time on {totalStats.weakCategories.join(' and ')} 
                to improve your overall score.
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Icon name="calendar-check" size={20} color="#2196F3" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Study Consistency</Text>
              <Text style={styles.insightText}>
                You've maintained a 7-day study streak! Consistent practice is key to success.
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Achievement Badges */}
      <Card style={styles.achievementsCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Recent Achievements</Title>
          <View style={styles.achievementsGrid}>
            <View style={styles.achievement}>
              <View style={[styles.achievementIcon, { backgroundColor: '#4CAF50' }]}>
                <Icon name="trophy" size={24} color="white" />
              </View>
              <Text style={styles.achievementText}>Quiz Master</Text>
              <Text style={styles.achievementSubtext}>100 questions</Text>
            </View>
            
            <View style={styles.achievement}>
              <View style={[styles.achievementIcon, { backgroundColor: '#FF9800' }]}>
                <Icon name="fire" size={24} color="white" />
              </View>
              <Text style={styles.achievementText}>Week Streak</Text>
              <Text style={styles.achievementSubtext}>7 days</Text>
            </View>
            
            <View style={styles.achievement}>
              <View style={[styles.achievementIcon, { backgroundColor: '#2196F3' }]}>
                <Icon name="star" size={24} color="white" />
              </View>
              <Text style={styles.achievementText}>High Scorer</Text>
              <Text style={styles.achievementSubtext}>90%+ average</Text>
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
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 2,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: 'white',
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#1976D2',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  statCard: {
    width: (width - 40) / 2,
    margin: 5,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartCard: {
    margin: 20,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  chartContainer: {
    height: 220,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#666',
  },
  categoryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  categoryScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  categoryProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryStatText: {
    fontSize: 12,
    color: '#666',
  },
  pieChartContainer: {
    height: 200,
    marginVertical: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  insightsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  insightsTitle: {
    fontSize: 18,
    marginLeft: 8,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  achievementsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievement: {
    alignItems: 'center',
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProgressScreen;
