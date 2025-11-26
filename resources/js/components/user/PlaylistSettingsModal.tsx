import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PlaylistSettingsSection from './PlaylistSettingsSection';

interface PlaylistSettingsModalProps {
  isOpen: boolean;
  platform: string;
  playlistId: string;
  playlistName: string;
  onClose: () => void;
  onSettingsUpdated?: () => void;
}

const PlaylistSettingsModal: React.FC<PlaylistSettingsModalProps> = ({
  isOpen,
  platform,
  playlistId,
  playlistName,
  onClose,
  onSettingsUpdated
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset success state when modal is closed
      setShowSuccess(false);
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleSettingsUpdated = () => {
    // Show success message
    setShowSuccess(true);
    setSuccessMessage('Playlist settings updated successfully');
    
    // Call parent callback if provided
    if (onSettingsUpdated) {
      onSettingsUpdated();
    }
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-black">
            Settings for "{playlistName}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="p-4 bg-green-50 border-b border-green-200">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Modal content */}
        <div className="p-6">
          <PlaylistSettingsSection
            platform={platform}
            playlistId={playlistId}
            onSettingsUpdated={handleSettingsUpdated}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaylistSettingsModal;