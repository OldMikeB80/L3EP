import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@constants/colors';

// This component demonstrates what the app icon should look like
// The actual icon needs to be created in a graphics program and exported as PNG
export const AppIconDesign: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconBackground}>
        <Text style={styles.iconText}>L3EP</Text>
      </View>
      <Text style={styles.instructions}>
        App Icon Design:{'\n'}- Background: Michigan Blue (#00274C){'\n'}- Text: Michigan Maize
        (#FFCB05){'\n'}- Font: Bold, centered{'\n'}- Rounded corners (20% radius){'\n'}
        {'\n'}
        Sizes needed:{'\n'}
        iOS: 1024x1024 (then scaled down){'\n'}
        Android: 512x512 (then scaled down)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  iconBackground: {
    width: 200,
    height: 200,
    backgroundColor: colors.primary, // Michigan Blue
    borderRadius: 40, // 20% radius
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconText: {
    fontSize: 60,
    fontWeight: '900',
    color: colors.accent, // Michigan Maize
    letterSpacing: -2,
  },
  instructions: {
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AppIconDesign;
