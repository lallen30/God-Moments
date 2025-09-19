import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './Styles';
import axiosRequest from '../../../utils/axiosUtils';
import { API } from '../../../config/apiConfig';
import axios from 'axios';
import { colors } from '../../../theme/colors';

interface CalendarEvent {
  event_id: string;
  event_title: string;
  event_content: string;
  event_date: string;
  event_to_time: string;
  event_from_time: string;
  event_street_address: string;
  event_apt_suite: string;
  event_city: string;
  event_state: string;
  event_zip: string;
  event_longitude: string | null;
  event_latitude: string | null;
  event_price: string | null;
}

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    dotColor?: string;
  };
}

const CalendarScreen = ({ navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const fetchEvents = async () => {
    try {
      // Try to get token from both possible storage locations
      let token = await AsyncStorage.getItem('userToken');
      if (!token) {
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          token = userData?.loginInfo?.token;
        }
      }

      if (!token) {
        console.error('No token found in either storage location');
        return;
      }

      console.log('Fetching events with token');
      const response = await axiosRequest.get(API.ENDPOINTS.GET_EVENTS, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        params: { 
          month: new Date(selectedDate).getMonth() + 1, // Adding 1 because getMonth() returns 0-11
          year: new Date(selectedDate).getFullYear()
        }
      });
      
      console.log('Events API Response:', response);

      if (response?.data?.status === 'ok' && Array.isArray(response?.data?.listing)) {
        const eventsData = response.data.listing;
        console.log('Events found:', eventsData);
        setEvents(eventsData);
        
        // Mark dates that have events
        const marked: MarkedDates = {};
        eventsData.forEach((event: CalendarEvent) => {
          const eventDate = event.event_date;
          marked[eventDate] = {
            marked: true,
            dotColor: colors.tertiary
          };
        });
        
        // Also mark the selected date
        const selectedDateKey = new Date(selectedDate).toISOString().split('T')[0];
        marked[selectedDateKey] = {
          ...marked[selectedDateKey],
          selected: true,
          selectedColor: colors.primary // Add this to make selected date more visible
        };
        
        setMarkedDates(marked);
      } else {
        console.warn('Unexpected response format:', response);
        setEvents([]);
        setMarkedDates({
          [selectedDate]: {
            selected: true,
            selectedColor: colors.primary
          }
        });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          params: error.config?.params,
          response: error.response?.data
        });
      }
      setEvents([]);
      setMarkedDates({
        [selectedDate]: {
          selected: true
        }
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]); // Re-fetch when selected date changes

  useEffect(() => {
    console.log('Selected date changed to:', selectedDate);
    console.log('Current events:', events);
    console.log('Filtered events:', filteredEvents);
  }, [selectedDate, events, filteredEvents]);

  const onDayPress = (day: any) => {
    console.log('Day pressed - raw data:', day);
    const newSelectedDate = day.dateString;
    console.log('Setting new selected date:', newSelectedDate);
    
    // Update marked dates to include the new selection
    const newMarkedDates = { ...markedDates };
    
    // Remove selected state from previous date
    const previousSelectedDateKey = new Date(selectedDate).toISOString().split('T')[0];
    if (markedDates[previousSelectedDateKey]) {
      newMarkedDates[previousSelectedDateKey] = {
        ...markedDates[previousSelectedDateKey],
        selected: false
      };
      // If the date only had selected: true, remove it entirely
      if (!newMarkedDates[previousSelectedDateKey].marked) {
        delete newMarkedDates[previousSelectedDateKey];
      }
    }
    
    // Add selected state to new date
    newMarkedDates[newSelectedDate] = {
      ...markedDates[newSelectedDate],
      selected: true
    };
    
    // Update states
    setMarkedDates(newMarkedDates);
    setSelectedDate(newSelectedDate);
  };

  // Filter events for selected date
  const filteredEvents = useMemo(() => {
    console.log('Filtering events for date:', selectedDate);
    console.log('Available events:', events);
    const filtered = events.filter(event => event.event_date === selectedDate);
    console.log('Filtered events for selected date:', filtered);
    return filtered;
  }, [events, selectedDate]);

  const formatDate = (dateString: string) => {
    console.log('Formatting date:', dateString);
    try {
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      const date = new Date(year, month - 1, day); // month is 0-based in Date constructor
      console.log('Constructed date:', date);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formattedSelectedDate = useMemo(() => {
    return formatDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    console.log('Selected date state updated:', selectedDate);
    console.log('Formatted date:', formatDate(selectedDate));
  }, [selectedDate]);

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

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: colors.secondary,
          selectedDayTextColor: colors.white,
          todayTextColor: colors.primary,
          dotColor: colors.danger,
          arrowColor: colors.dark,
          monthTextColor: colors.dark,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayColor: colors.tertiary,
          textDayHeaderColor: colors.secondary
        }}
      />
      <View style={[styles.sectionHeader, { padding: 20, marginVertical: 15 }]}>
        <Text style={[styles.sectionTitle, { fontSize: 20, fontWeight: '600' }]}>
          Events for {formatDate(selectedDate)}
        </Text>
      </View>
      <ScrollView style={styles.eventsContainer}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <TouchableOpacity
              key={event.event_id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetails', { event })}
            >
              <Text style={styles.eventTitle}>{event.event_title}</Text>
              <Text style={styles.eventTime}>
                {formatTime(event.event_from_time)} - {formatTime(event.event_to_time)}
              </Text>
              <Text style={styles.eventLocation}>
                {event.event_street_address}
                {event.event_apt_suite ? `, ${event.event_apt_suite}` : ''}
                {event.event_city ? `, ${event.event_city}` : ''}
                {event.event_state ? `, ${event.event_state}` : ''}
                {event.event_zip ? ` ${event.event_zip}` : ''}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>No events on this date</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default CalendarScreen;
