// Custom hook — subscribes to unresolved leak alerts for the authenticated user
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';

export function useLeakAlerts(uid) {
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setAlertsLoading(false);
      return;
    }

    const colRef = collection(db, `users/${uid}/leak_alerts`);
    const q = query(
      colRef,
      where('resolved', '==', false),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAlerts(data);
        setAlertsLoading(false);
      },
      () => {
        setAlertsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { alerts, alertsLoading };
}
