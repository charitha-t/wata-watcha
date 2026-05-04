// Custom hook — real-time listener for user's registered device document in Firestore
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useDevice(uid) {
  const [device, setDevice] = useState(null);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [deviceError, setDeviceError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setDeviceLoading(false);
      return;
    }

    const docRef = doc(db, `users/${uid}/device/main`);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setDevice({ id: snapshot.id, ...snapshot.data() });
        } else {
          setDevice(null);
        }
        setDeviceLoading(false);
        setDeviceError(null);
      },
      () => {
        setDeviceError('Unable to load device information.');
        setDeviceLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { device, deviceLoading, deviceError };
}
