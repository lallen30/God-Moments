import React, { useState, useCallback, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Switch,
  Dimensions,
  ActivityIndicator
} from 'react-native';

// Import the VersionInfo interface from the hook instead of the service
import UpdateService from '../services/UpdateService';
import { compareVersions } from 'compare-versions';

const { width } = Dimensions.get('window');

interface UpdateModalProps {
  isVisible: boolean;
  versionInfo: {
    latestVersion: string;
    minimumVersion: string;
    releaseNotes?: string;
  } | null;
  onClose: () => void;
  onUpdate?: () => Promise<void>; // Optional prop for update handling
}

const UpdateModal: React.FC<UpdateModalProps> = ({ 
  isVisible, 
  versionInfo, 
  onClose,
  onUpdate 
}) => {
  const [skipVersion, setSkipVersion] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  // Get the current version when the component mounts
  React.useEffect(() => {
    const fetchCurrentVersion = async () => {
      try {
        const version = await UpdateService.getCurrentVersion();
        setCurrentVersion(version);
      } catch (error) {
        console.error('Error getting current version:', error);
      }
    };

    fetchCurrentVersion();
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      
      if (onUpdate) {
        // Use the provided update handler if available
        await onUpdate();
      } else {
        // Default behavior
        await UpdateService.openAppStore();
      }
      
      // Only close modal if update is not required
      if (!versionInfo || !currentVersion || !UpdateService.isUpdateRequired(currentVersion, versionInfo.minimumVersion)) {
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to open app store';
      setUpdateError(errorMessage);
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [versionInfo, onClose, onUpdate, currentVersion]);

  const handleSkip = useCallback(async () => {
    try {
      if (skipVersion && versionInfo) {
        // Skip this version
        await UpdateService.skipVersion(versionInfo.latestVersion);
      }
      
      // Only close modal if update is not required
      if (!versionInfo || !currentVersion || !UpdateService.isUpdateRequired(currentVersion, versionInfo.minimumVersion)) {
        onClose();
      }
    } catch (error) {
      console.error('Error skipping version:', error);
    }
  }, [versionInfo, skipVersion, onClose, currentVersion]);

  // Determine the message to display based on version comparison
  const getUpdateMessage = () => {
    if (!versionInfo || !currentVersion) return '';
    
    const { latestVersion, minimumVersion } = versionInfo;
    
    // Check if update is required
    const isRequired = UpdateService.isUpdateRequired(currentVersion, minimumVersion);
    
    if (isRequired) {
      return 'This update is required to continue using the app.';
    } else if (compareVersions(currentVersion, latestVersion) < 0) {
      return 'A new version of the app is available. Would you like to update now?';
    } else {
      return 'Your app is up to date.';
    }
  };

  if (!versionInfo) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        if (!versionInfo || !currentVersion || !UpdateService.isUpdateRequired(currentVersion, versionInfo.minimumVersion)) {
          onClose();
        }
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {versionInfo && currentVersion && UpdateService.isUpdateRequired(currentVersion, versionInfo.minimumVersion) ? 'Required Update' : 'Update Available'}
          </Text>
          
          <Text style={styles.modalText}>
            {getUpdateMessage()}
          </Text>

          {versionInfo.releaseNotes && (
            <Text style={styles.releaseNotes}>
              {versionInfo.releaseNotes}
            </Text>
          )}

          {updateError && (
            <Text style={styles.errorText}>
              {updateError}
            </Text>
          )}

          {versionInfo && currentVersion && UpdateService.isUpdateRequired(currentVersion, versionInfo.minimumVersion) ? (
            <Text style={styles.warningText}>
              This update includes critical changes and is required to continue using the app.
            </Text>
          ) : (
            <View style={styles.skipContainer}>
              <Switch
                value={skipVersion}
                onValueChange={setSkipVersion}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={skipVersion ? '#f5dd4b' : '#f4f3f4'}
              />
              <Text style={styles.skipText}>Skip this version</Text>
            </View>
          )}

          <View style={styles.buttonsContainer}>
            {(!versionInfo || !currentVersion || !UpdateService.isUpdateRequired(currentVersion, versionInfo.minimumVersion)) && (
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={handleSkip}
                disabled={isUpdating}
              >
                <Text style={styles.buttonText}>Later</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.buttonUpdate]}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={[styles.buttonText, styles.updateButtonText]}>Update Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  releaseNotes: {
    marginBottom: 15,
    textAlign: 'left',
    fontSize: 14,
    lineHeight: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    width: '100%',
  },
  warningText: {
    color: '#d9534f',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  errorText: {
    color: '#d9534f',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: '#ffeeee',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  skipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  skipText: {
    marginLeft: 10,
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    minWidth: 100,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  buttonUpdate: {
    backgroundColor: '#007bff',
    flex: 1,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UpdateModal;
