import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { apiService } from '../../../services/apiService';
import { storageService } from '../../../services/storageService';
import { colors } from '../../../theme/colors';

interface DailyWord {
  notification_id: number;
  daily_word: string;
  content: string;
  link: string;
  date: string;
  full_date: string;
  created_at: string;
  sent_at: string;
}

type RootStackParamList = {
  WordDetail: { word: DailyWord; sourceScreen?: string };
  LearnMore: { url: string; title: string };
};

const DailyWordsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const [wordList, setWordList] = useState<DailyWord[]>([]);
  const [filteredWordList, setFilteredWordList] = useState<DailyWord[]>([]);
  const [allWordsLoaded, setAllWordsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingAllWords, setLoadingAllWords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const PER_PAGE = 20; // Items per page

  // Navigate to word detail
  const navigateToWordDetail = (word: DailyWord) => {
    navigation.navigate('WordDetail', { word, sourceScreen: 'DailyWords' });
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    try {
      // Handle different date formats
      let date: Date;
      
      // Check if the date is in DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        // Create date using Date constructor (year, month-1, day)
        // Note: month is 0-indexed in JavaScript Date constructor
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      // Check if the date is in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD)
      else if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        date = new Date(dateString);
      }
      // Try to parse as timestamp or other format (including ISO 8601 with timezone)
      else {
        date = new Date(dateString);
      }
      
      // Validate the date
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Format as a readable date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('DailyWordsScreen - Error formatting date:', error);
      return dateString; // Return original if error
    }
  };

  // Fetch all notifications/words
  const fetchWords = async (isRefreshing = false, pageNumber = 1) => {
    try {
      if (pageNumber === 1) {
        if (!isRefreshing) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
      } else {
        setLoadingMore(true);
      }
      setError(null);

      console.log(`Fetching daily words - Page: ${pageNumber}, Per Page: ${PER_PAGE}`);
      const response = await apiService.fetchAndStoreNotifications(pageNumber, PER_PAGE, pageNumber > 1);
      
      console.log('API Response:', response);
      
      if (response && response.data && Array.isArray(response.data)) {

        
        if (pageNumber === 1) {
          // First page or refresh - replace all data
          setWordList(response.data);
          setCurrentPage(pageNumber);
        } else {
          // Subsequent pages - append NEW items only with deduplication
          const newItems = response.newItems || [];
          console.log(`Appending ${newItems.length} new items to existing ${wordList.length} items`);
          setWordList(prevWords => {
            const combinedWords = [...prevWords, ...newItems];
            // Deduplicate based on notification_id
            const uniqueWords = combinedWords.filter((word, index, self) => 
              index === self.findIndex(w => w.notification_id === word.notification_id)
            );
            console.log(`After deduplication: ${uniqueWords.length} unique words (${combinedWords.length - uniqueWords.length} duplicates removed)`);
            return uniqueWords;
          });
          setCurrentPage(pageNumber);
        }
        
        // Update pagination info
        if (response.pagination) {
          const paginationInfo = response.pagination;
          setTotalItems(paginationInfo.total_count || 0);
          // Use the correct field names from the API response
          const hasMore = paginationInfo.has_next_page || false;
          setHasMoreData(hasMore);
          console.log(`Pagination: Page ${paginationInfo.current_page} of ${paginationInfo.total_pages}, Total: ${paginationInfo.total_count}, Has More: ${hasMore}`);
        } else {
          // If no pagination info, check if we got new items
          const newItems = response.newItems || [];
          const hasMore = newItems.length >= PER_PAGE;
          setHasMoreData(hasMore);
          console.log(`No pagination info. Got ${newItems.length} items, Has More: ${hasMore}`);
        }
        
        const newItemsCount = response.newItems ? response.newItems.length : response.data.length;
        console.log(`Successfully loaded ${newItemsCount} new daily words`);
      } else {
        console.log('No data in response or invalid response format');
        if (pageNumber === 1) {
          // Try to load from storage if API fails
          const storedNotifications = await storageService.get('notifications');
          if (storedNotifications && Array.isArray(storedNotifications)) {
            console.log('Using stored notifications');
            setWordList(storedNotifications);
            setHasMoreData(false);
          } else {
            setWordList([]);
            setHasMoreData(false);
          }
        } else {
          // For subsequent pages, if no data, assume no more pages
          setHasMoreData(false);
        }
      }
    } catch (error) {
      console.error('Error fetching daily words:', error);
      setError('Failed to load daily words. Please try again.');
      
      if (pageNumber === 1) {
        // Try to load from storage if API fails
        try {
          const storedNotifications = await storageService.get('notifications');
          if (storedNotifications && Array.isArray(storedNotifications)) {
            console.log('Using stored notifications after error');
            setWordList(storedNotifications);
          } else {
            setWordList([]);
          }
          setHasMoreData(false);
        } catch (storageError) {
          console.error('Error loading from storage:', storageError);
          setWordList([]);
          setHasMoreData(false);
        }
      } else {
        // For subsequent pages, if error, assume no more pages
        setHasMoreData(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Load more data (infinite scroll)
  const loadMoreWords = () => {
    console.log('loadMoreWords called:', {
      loadingMore,
      hasMoreData,
      loading,
      refreshing,
      currentPage,
      wordListLength: wordList.length,
      searchQuery: searchQuery.trim()
    });
    
    // Don't load more if we're searching
    if (searchQuery.trim() !== '') {
      console.log('loadMoreWords blocked: search is active');
      return;
    }
    
    if (!loadingMore && hasMoreData && !loading && !refreshing) {
      const nextPage = currentPage + 1;
      console.log(`Loading more words - Page ${nextPage}`);
      fetchWords(false, nextPage);
    } else {
      console.log('loadMoreWords blocked:', {
        loadingMore: loadingMore ? 'YES' : 'NO',
        hasMoreData: hasMoreData ? 'YES' : 'NO',
        loading: loading ? 'YES' : 'NO',
        refreshing: refreshing ? 'YES' : 'NO'
      });
    }
  };

  // Handle scroll event to trigger loading more data
  const handleScroll = (event: any) => {
    // Don't handle scroll for infinite loading if we're searching
    if (searchQuery.trim() !== '') {
      return;
    }
    
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100; // How close to bottom before triggering
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && hasMoreData && !loadingMore && !loading && !refreshing) {
      console.log('Scroll triggered load more');
      loadMoreWords();
    }
  };

  // Load all words for comprehensive search
  const loadAllWords = async () => {
    if (allWordsLoaded || loadingAllWords) {
      return; // Already loaded or currently loading
    }

    setLoadingAllWords(true);
    console.log('Loading all words for comprehensive search...');

    try {
      // Start from page 1 to ensure we get all data
      let startPage = 1;
      let allWords: any[] = [];
      let hasMore = true;

      while (hasMore) {
        console.log(`Loading page ${startPage} for search...`);
        const response = await apiService.fetchAndStoreNotifications(startPage, PER_PAGE, true);
        
        if (response && response.data && Array.isArray(response.data)) {
          const pageData = response.data;
          if (pageData.length > 0) {
            allWords = [...allWords, ...pageData];
            console.log(`Loaded ${pageData.length} more words. Total: ${allWords.length}`);
          }
          
          // Check if we have more pages
          if (response.pagination) {
            hasMore = response.pagination.has_next_page || false;
          } else {
            hasMore = pageData.length >= PER_PAGE;
          }
          
          startPage++;
        } else {
          hasMore = false;
        }

        // Safety break to prevent infinite loops
        if (startPage > 100) {
          console.log('Safety break: Reached page 100, stopping search loading');
          break;
        }
      }

      // Deduplicate the word list based on notification_id
      const uniqueWords = allWords.filter((word, index, self) => 
        index === self.findIndex(w => w.notification_id === word.notification_id)
      );
      
      // Update the word list with deduplicated words
      setWordList(uniqueWords);
      setAllWordsLoaded(true);
      console.log(`Finished loading all words. Total: ${uniqueWords.length} unique words available for search (${allWords.length - uniqueWords.length} duplicates removed).`);
      
    } catch (error) {
      console.error('Error loading all words for search:', error);
      // Don't show error to user, just continue with current data
    } finally {
      setLoadingAllWords(false);
    }
  };
  const onRefresh = () => {
    setCurrentPage(1);
    setHasMoreData(true);
    setTotalItems(0);
    setAllWordsLoaded(false);
    // Clear search when refreshing to avoid conflicts
    setSearchQuery('');
    fetchWords(true, 1);
  };

  // Search words
  const searchWords = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // If query is empty, show all currently loaded words
      setFilteredWordList(wordList);
      return;
    }
    
    // If we haven't loaded all words yet and we have more data available, load them for comprehensive search
    if (!allWordsLoaded && hasMoreData && !loadingAllWords) {
      await loadAllWords();
    }
    
    const lowercasedQuery = query.toLowerCase();
    const filtered = wordList.filter(word => 
      word.daily_word.toLowerCase().includes(lowercasedQuery) ||
      word.content.toLowerCase().includes(lowercasedQuery)
    );
    
    setFilteredWordList(filtered);
    console.log(`Search for "${query}" found ${filtered.length} results out of ${wordList.length} total words`);
  };

  // Initial load
  useEffect(() => {
    fetchWords(false, 1);
  }, []);

  // Update filtered list when wordList changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWordList(wordList);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = wordList.filter(word => 
        word.daily_word.toLowerCase().includes(lowercasedQuery) ||
        word.content.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredWordList(filtered);
    }
  }, [wordList, searchQuery]);

  // Render loading footer for infinite scroll
  const renderLoadingFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingFooterText}>Loading more words...</Text>
      </View>
    );
  };

  // Render end reached footer
  const renderEndReachedFooter = () => {
    if (loadingMore || wordList.length === 0) return null;
    
    if (hasMoreData) {
      return (
        <View style={styles.endReachedFooter}>
          <Text style={styles.endReachedText}>
            Scroll down to load more words...
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.endReachedFooter}>
        <Text style={styles.endReachedText}>
          {totalItems > 0 ? `You've seen all ${totalItems} daily words!` : "You've reached the end!"}
        </Text>
      </View>
    );
  };

  // Render word item
  const renderWordItem = ({ item }: { item: DailyWord }) => (
    <TouchableOpacity 
      style={styles.wordItem}
      onPress={() => navigateToWordDetail(item)}
    >
      <View style={styles.wordItemContent}>
        <Text style={styles.wordText} numberOfLines={2}>
          {item.daily_word || 'Untitled Word'}
        </Text>
        <Text style={styles.wordDefinition} numberOfLines={3}>
          {item.content || 'No definition available'}
        </Text>
        <Text style={styles.wordDate}>
          {formatDate(item.date || item.sent_at || item.created_at || '')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading daily words...</Text>
      </View>
    );
  }

  if (error && wordList.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchWords(false, 1)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search daily words..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={searchWords}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {loadingAllWords && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoadingIcon} />
          )}
          {searchQuery.length > 0 && !loadingAllWords && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => searchWords('')}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        {loadingAllWords && (
          <Text style={styles.searchLoadingText}>Loading all words for better search results...</Text>
        )}
      </View>
      {filteredWordList.length > 0 ? (
        <FlatList
          data={filteredWordList}
          renderItem={renderWordItem}
          keyExtractor={(item) => item.notification_id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          onEndReached={searchQuery.trim() === '' ? loadMoreWords : undefined}
          onEndReachedThreshold={0.1}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          ListFooterComponent={() => (
            <>
              {searchQuery.trim() === '' && renderLoadingFooter()}
              {searchQuery.trim() === '' && renderEndReachedFooter()}
            </>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim() !== '' 
              ? `No results found for "${searchQuery}"` 
              : 'No daily words available'
            }
          </Text>
          {searchQuery.trim() === '' && (
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchWords(false, 1)}>
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#B565A7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  wordItem: {
    backgroundColor: '#E9F0FD',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  wordItemContent: {
    flex: 1,
  },
  wordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  wordDate: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  wordDefinition: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  loadingFooterText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  endReachedFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  endReachedText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchLoadingIcon: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchLoadingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  clearButton: {
    marginLeft: 10,
    padding: 2,
  },
});

export default DailyWordsScreen;
