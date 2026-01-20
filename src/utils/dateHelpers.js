import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, addDays, subDays, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { nl } from 'date-fns/locale/nl';

// Formatteer datum
export const formatDate = (date, formatStr = 'dd MMMM yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: nl });
  } catch (error) {
    console.error('Fout bij formatteren datum:', error);
    return '';
  }
};

// Formatteer tijd
export const formatTime = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'HH:mm', { locale: nl });
  } catch (error) {
    console.error('Fout bij formatteren tijd:', error);
    return '';
  }
};

// Get datum string voor opslag (YYYY-MM-DD)
export const getDateString = (date = new Date()) => {
  return format(date, 'yyyy-MM-dd');
};

// Check of datum vandaag is
export const isDateToday = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
};

// Check of twee datums dezelfde dag zijn
export const areSameDay = (date1, date2) => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
};

// Get dagen van de week
export const getDaysOfWeek = (date = new Date()) => {
  const start = startOfWeek(date, { locale: nl, weekStartsOn: 1 }); // Week start op maandag
  const end = endOfWeek(date, { locale: nl, weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

// Get dagen van de maand
export const getDaysOfMonth = (date = new Date()) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

// Get week nummer
export const getWeekNumber = (date = new Date()) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
  const pastDaysOfYear = (dateObj - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Check of datum in de toekomst is
export const isFuture = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj > new Date();
};

// Check of datum in het verleden is
export const isPast = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj < today;
};

// Bereken dagen tussen twee datums
export const daysBetween = (date1, date2) => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get relatieve datum text (bijv. "vandaag", "morgen", "3 dagen geleden")
export const getRelativeDateText = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dateObj);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Vandaag';
  if (diffDays === 1) return 'Morgen';
  if (diffDays === -1) return 'Gisteren';
  if (diffDays > 1 && diffDays < 7) return `Over ${diffDays} dagen`;
  if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} dagen geleden`;

  return formatDate(dateObj);
};

// Bereken streak
export const calculateStreak = (logs, habitId) => {
  const today = new Date();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Start vanaf vandaag en ga terug in de tijd
  let checkDate = new Date(today);

  while (true) {
    const dateStr = getDateString(checkDate);
    const log = logs[dateStr]?.[habitId];

    if (log?.completed) {
      tempStreak++;
      if (currentStreak === tempStreak - 1 || currentStreak === 0) {
        currentStreak = tempStreak;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      if (getDateString(checkDate) === getDateString(today)) {
        // Vandaag nog niet gedaan is ok voor huidige streak
      } else {
        tempStreak = 0;
      }
    }

    // Stop na 365 dagen
    if (daysBetween(checkDate, today) > 365) break;

    checkDate = subDays(checkDate, 1);
  }

  return { currentStreak, longestStreak };
};
