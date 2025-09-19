import React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';
import { styles } from './EventDetailsStyles';
import { colors } from '../../../theme/colors';

const EventDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const event = route.params?.event;
  const { width } = useWindowDimensions();

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Define default rendering options
  const renderersProps = {
    img: {
      enableExperimentalPercentWidth: true
    }
  };

  const tagsStyles = {
    body: {
      color: colors.black,
      fontSize: 16,
      lineHeight: 24,
    },
    a: {
      color: colors.primary,
      textDecorationLine: 'underline',
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{event.event_title}</Text>
        <Text style={styles.date}>{formatDate(event.event_date)}</Text>
        <Text style={styles.time}>
          {formatTime(event.event_from_time)} - {formatTime(event.event_to_time)}
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.location}>
            {event.event_street_address}
            {event.event_apt_suite ? `\n${event.event_apt_suite}` : ''}
            {'\n'}
            {[
              event.event_city,
              event.event_state,
              event.event_zip
            ].filter(Boolean).join(', ')}
          </Text>
        </View>

        {event.event_content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <RenderHtml
              contentWidth={width - 40}
              source={{ html: event.event_content }}
              renderersProps={renderersProps}
              tagsStyles={tagsStyles}
              systemFonts={defaultSystemFonts}
              baseStyle={styles.description}
              defaultTextProps={{
                selectable: true
              }}
            />
          </View>
        )}

        {event.event_price && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price</Text>
            <Text style={styles.price}>${event.event_price}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default EventDetails;
