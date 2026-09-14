/**
 * UK Schedule & Timezone Helper for Instagram Reel Algorithmic Peak Reach
 * 
 * UK Peak Hours: 18:00 - 22:30 GMT/BST (6:00 PM - 10:30 PM UK Time)
 * Equivalent in Pakistan Time: 23:00 - 03:30 PKT (11:00 PM - 3:30 AM PKT)
 */

export interface UkTimeInfo {
  ukTimeString: string;
  pktTimeString: string;
  ukHour: number;
  ukMinute: number;
  isPeakUkTime: boolean;
  msUntilNextUkPeak: number;
  formattedCountdown: string;
}

export function getUkTimeInfo(): UkTimeInfo {
  const now = new Date();

  // Format in UK time (handles daylight saving GMT/BST automatically)
  const ukFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const pktFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const parts = ukFormatter.formatToParts(now);
  const hourPart = parts.find((p) => p.type === 'hour')?.value || '0';
  const minutePart = parts.find((p) => p.type === 'minute')?.value || '0';

  const ukHour = parseInt(hourPart, 10);
  const ukMinute = parseInt(minutePart, 10);

  // Peak UK window: 18:00 to 22:30 UK time
  const totalUkMinutes = ukHour * 60 + ukMinute;
  const peakStartMinutes = 18 * 60;       // 18:00 (6:00 PM)
  const peakEndMinutes = 22 * 60 + 30;    // 22:30 (10:30 PM)

  const isPeakUkTime = totalUkMinutes >= peakStartMinutes && totalUkMinutes <= peakEndMinutes;

  // Calculate time until next peak window (18:30 UK target)
  let minutesUntilPeak = 0;
  if (totalUkMinutes < peakStartMinutes) {
    minutesUntilPeak = peakStartMinutes - totalUkMinutes;
  } else if (totalUkMinutes > peakEndMinutes) {
    minutesUntilPeak = (24 * 60 - totalUkMinutes) + peakStartMinutes;
  } else {
    minutesUntilPeak = 0; // Already in peak
  }

  const msUntilNextUkPeak = minutesUntilPeak * 60 * 1000;
  const hoursLeft = Math.floor(minutesUntilPeak / 60);
  const minsLeft = minutesUntilPeak % 60;
  const formattedCountdown = isPeakUkTime 
    ? '🔥 CURRENTLY IN UK PEAK WINDOW!' 
    : `${hoursLeft}h ${minsLeft}m until UK Peak (6:00 PM UK / 11:00 PM PKT)`;

  return {
    ukTimeString: `${hourPart.padStart(2, '0')}:${minutePart.padStart(2, '0')} UK`,
    pktTimeString: pktFormatter.format(now) + ' PKT',
    ukHour,
    ukMinute,
    isPeakUkTime,
    msUntilNextUkPeak,
    formattedCountdown,
  };
}

/**
 * Top UK automotive and luxury location tags (Facebook Place IDs for Instagram Media Container)
 */
export const UK_LOCATION_TAGS = [
  { id: '106078429431815', name: 'London, United Kingdom' },
  { id: '108035039228514', name: 'Manchester, United Kingdom' },
  { id: '109605799059530', name: 'Mayfair, London' },
  { id: '111588698868841', name: 'Birmingham, United Kingdom' },
  { id: '107380962618844', name: 'Knightsbridge, London' },
];

export function getRandomUkLocation(): { id: string; name: string } {
  const index = Math.floor(Math.random() * UK_LOCATION_TAGS.length);
  return UK_LOCATION_TAGS[index];
}
