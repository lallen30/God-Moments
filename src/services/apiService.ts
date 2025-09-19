import { storageService } from './storageService';
import { environment } from '../config/environment';

const BASE_URL = `${environment.serverProtocol}://${environment.server}`;

// Determine API endpoint based on backend type
let MOBILE_API = '';
// Use a type-safe approach with a switch statement
switch (environment.backendType as string) {
  case 'wordpress':
    MOBILE_API = `${BASE_URL}wp-json/mobileapi/v1/`;
    break;
  case 'laravel':
  default:
    // Laravel backend (default)
    MOBILE_API = `${BASE_URL}api/mobileapi/v1/`;
    break;
}

console.log('Using API endpoint:', MOBILE_API);

interface ApiResponse {
  status: string;
  errormsg: string;
  error_code: string;
  categories: Array<{
    category_id: number;
    category_name: string;
    posts: Array<{
      post_id: number;
      post_title: string;
      post_content: string;
      post_date: string;
      featured_image?: string;
      pdf_file?: string;
    }>;
  }>;
}

export interface SocialMediaData {
  facebook: string;
  donate_link: string;
  instagram: string;
  tiktok: string;
}

class ApiService {
  async getData(endpoint: string) {
    try {
      console.log('Fetching from:', MOBILE_API + endpoint);
      const response = await fetch(MOBILE_API + endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async sendData(endpoint: string, data: any) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const payload = {
      ...(typeof data === 'object' ? data : { value: data }),
      timezone,
    };

    try {
      const response = await fetch(MOBILE_API + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending data:', error);
      throw error;
    }
  }

  async fetchAndStorePosts() {
    try {
      const response = await this.getData('getPostsByCategories') as ApiResponse;
      console.log('API Response:', response);
      
      if (response?.status === 'ok' && response?.categories) {
        await storageService.set('posts', response.categories);
        return response.categories;
      }
      return null;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async fetchAndStoreNotifications(page = 1, perPage = 50, append = false) {
    try {
      const endpoint = `notifications?page=${page}&per_page=${perPage}`;
      const response = await this.getData(endpoint);
      console.log('Notifications API Response for page', page, ':', response);
      
      // Handle the actual API response format
      const notifications = response?.daily_words || response?.data || response;
      const pagination = response?.pagination || null;
      
      console.log('Extracted notifications:', notifications?.length || 0);
      console.log('Extracted pagination:', pagination);
      
      if (Array.isArray(notifications)) {
        if (append) {
          // For pagination, we only store the new items but return both existing and new
          const existingNotifications = await storageService.get('notifications') || [];
          const combinedNotifications = [...existingNotifications, ...notifications];
          await storageService.set('notifications', combinedNotifications);
          
          console.log(`API Service: Page ${page} - Returning ${notifications.length} new items, total in storage: ${combinedNotifications.length}`);
          
          return { 
            data: combinedNotifications, 
            pagination,
            newItems: notifications // Only the new items from this page
          };
        } else {
          // For refresh, replace all data
          await storageService.set('notifications', notifications);
          
          console.log(`API Service: Page ${page} (refresh) - Returning ${notifications.length} items`);
          
          return { 
            data: notifications, 
            pagination,
            newItems: notifications 
          };
        }
      }
      
      console.warn('Unexpected notifications response format:', response);
      return { data: [], pagination: null, newItems: [] };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async fetchAndStoreNotificationsLegacy() {
    const result = await this.fetchAndStoreNotifications(1, 1000, false);
    return result.data;
  }

  async fetchSocialMedia(): Promise<SocialMediaData> {
    try {
      const response = await this.getData('getSocialMedia');
      console.log('Social Media API Response:', response);
      
      if (response?.status && response?.data) {
        return response.data;
      }
      
      // Return default values if API fails
      return {
        facebook: 'https://www.facebook.com/profile.php?id=100087341866606',
        donate_link: 'https://www.paypal.com/donate/?hosted_button_id=FKJZX24327HPG',
        instagram: 'https://www.instagram.com/miin.ojibwe/',
        tiktok: 'https://www.tiktok.com/@miinojibwe'
      };
    } catch (error) {
      console.error('Error fetching social media data:', error);
      // Return default values if API fails
      return {
        facebook: 'https://www.facebook.com/profile.php?id=100087341866606',
        donate_link: 'https://www.paypal.com/donate/?hosted_button_id=FKJZX24327HPG',
        instagram: 'https://www.instagram.com/miin.ojibwe/',
        tiktok: 'https://www.tiktok.com/@miinojibwe'
      };
    }
  }
}

export const apiService = new ApiService();
