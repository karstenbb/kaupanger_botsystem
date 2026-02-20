import { useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import type { BirthdayPlayer } from '../api/auth';
import { IconX } from './Icons';

export default function BirthdayBanner() {
  const [birthdays, setBirthdays] = useState<BirthdayPlayer[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed today
    const dismissedDate = localStorage.getItem('birthday_dismissed');
    const today = new Date().toISOString().split('T')[0];
    if (dismissedDate === today) {
      setDismissed(true);
      return;
    }

    authApi.getBirthdaysToday().then((data) => {
      setBirthdays(data);
    }).catch(() => {
      // ignore errors
    });
  }, []);

  const dismiss = () => {
    setDismissed(true);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('birthday_dismissed', today);
  };

  if (dismissed || birthdays.length === 0) return null;

  return (
    <div className="birthday-banner">
      <div className="birthday-banner-content">
        <span className="birthday-banner-emoji">🎂</span>
        <div className="birthday-banner-text">
          <strong>Gratulerer med dagen!</strong>
          <span>
            {birthdays.map((p, i) => (
              <span key={p.id}>
                {i > 0 && (i === birthdays.length - 1 ? ' og ' : ', ')}
                <strong>{p.name}</strong> fyller {p.age} år
              </span>
            ))}
            {' '}i dag! 🎉
          </span>
        </div>
      </div>
      <button className="birthday-banner-close" onClick={dismiss} title="Lukk">
        <IconX />
      </button>
    </div>
  );
}
