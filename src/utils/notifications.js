// Vraag notificatie permissie
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Deze browser ondersteunt geen notificaties');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Stuur notificatie
export const sendNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    return null;
  }

  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icon.png',
      badge: '/badge.png',
      ...options,
    });
  }

  return null;
};

// Check voor aankomende events (moet regelmatig aangeroepen worden)
export const checkUpcomingEvents = (events, notifiedEvents = new Set()) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);

    // Check of event morgen is
    if (eventDate >= tomorrow && eventDate <= tomorrowEnd) {
      // Check of notificatie al verzonden is
      if (!notifiedEvents.has(event.id)) {
        return true;
      }
    }

    return false;
  });

  upcomingEvents.forEach(event => {
    const eventDate = new Date(event.date);
    let body = `Datum: ${eventDate.toLocaleDateString('nl-NL')}`;

    if (event.startTime) {
      body += ` om ${event.startTime}`;
    }

    if (event.location) {
      body += `\nLocatie: ${event.location}`;
    }

    const notification = sendNotification(event.title, {
      body,
      tag: event.id,
      requireInteraction: false,
    });

    if (notification) {
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      notifiedEvents.add(event.id);
    }
  });

  return notifiedEvents;
};

// Start notificatie service (roep aan bij app start)
export const startNotificationService = (getEvents, settings) => {
  if (!settings.notificationsEnabled) {
    return null;
  }

  const notifiedEvents = new Set();

  // Check direct bij start
  const events = getEvents();
  checkUpcomingEvents(events, notifiedEvents);

  // Check elke 5 minuten
  const interval = setInterval(() => {
    const events = getEvents();
    checkUpcomingEvents(events, notifiedEvents);
  }, 5 * 60 * 1000); // 5 minuten

  return () => clearInterval(interval);
};

// Test notificatie
export const sendTestNotification = () => {
  sendNotification('Test Notificatie', {
    body: 'Als je dit ziet, werken notificaties correct!',
    icon: '/icon.png',
  });
};
