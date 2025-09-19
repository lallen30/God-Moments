import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';

type RootStackParamList = {
  LearnMore: { url: string; title: string };
};

type LearnMoreScreenRouteProp = RouteProp<RootStackParamList, 'LearnMore'>;
type LearnMoreScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LearnMore'>;

interface Props {
  route: LearnMoreScreenRouteProp;
  navigation: LearnMoreScreenNavigationProp;
}

const LearnMoreScreen = ({ route, navigation }: Props) => {
  const { url, title } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={colors.headerFont} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.headerFont,
    marginLeft: 16,
  },
  webview: {
    flex: 1,
  },
});

export default LearnMoreScreen;
