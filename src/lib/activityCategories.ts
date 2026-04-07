// Shared activity-based categories for Budget & Expense forms
export const ACTIVITY_CATEGORIES = [
  'Mid-Term Camp',
  'Easter Camp',
  'Summer Camp',
  'End Year Camp',
  'Day Camps',
  'Little Explorers',
  'Kenyan Experiences',
  'Homeschooling',
  'Archery',
  'Birthday Parties',
  'Corporate Events',
  'Kitty',
  'Others',
];

export const DEPARTMENT_LIST = [
  'Administration',
  'Programs',
  'Marketing',
  'Operations',
  'HR',
  'Others',
];

/**
 * Smart capitalize: first letter uppercase, rest lowercase.
 * Applied per word for natural input.
 */
export const smartCapitalize = (value: string): string => {
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
