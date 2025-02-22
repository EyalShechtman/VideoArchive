'use client';

import { useEffect, useState } from 'react';

interface GoogleDrivePickerProps {
  onFileSelect: (file: any) => void;
}

export default function GoogleDrivePicker({ onFileSelect }: GoogleDrivePickerProps) {
  const [pickerInited, setPickerInited] = useState(false);

  useEffect(() => {
    const loadGoogleDriveAPI = () => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('picker', () => {
          setPickerInited(true);
        });
      };
      document.body.appendChild(script);
    };

    loadGoogleDriveAPI();
  }, []);

  const showPicker = () => {
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS)
      .setOAuthToken(localStorage.getItem('google_access_token'))
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  };

  const pickerCallback = (data: any) => {
    if (data.action === google.picker.Action.PICKED) {
      const file = data.docs[0];
      onFileSelect(file);
    }
  };

  return (
    <button
      onClick={showPicker}
      disabled={!pickerInited}
      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
    >
      Select from Google Drive
    </button>
  );
} 