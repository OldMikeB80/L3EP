/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Enable react-native-gesture-handler
import 'react-native-gesture-handler';

// Configure react-native-vector-icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
Icon.loadFont();

AppRegistry.registerComponent(appName, () => App); 