/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const GLOBAL_DATE_RANGES: Record<string, { start: string; end: string }> = {
  last7_days: {
    start: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
  last30_days: {
    start: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
  last365_days: {
    start: dayjs().subtract(365, 'days').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
  this_month: {
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().endOf('month').format('YYYY-MM-DD'),
  },
  last_month: {
    start: dayjs().startOf('month').subtract(1, 'month').format('YYYY-MM-DD'),
    end: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
  },
  this_quarter: {
    start: dayjs().startOf('quarter').format('YYYY-MM-DD'),
    end: dayjs().endOf('quarter').format('YYYY-MM-DD'),
  },
  last_quarter: {
    start: dayjs()
      .subtract(1, 'quarter')
      .startOf('quarter')
      .format('YYYY-MM-DD'),
    end: dayjs().subtract(1, 'quarter').endOf('quarter').format('YYYY-MM-DD'),
  },
  this_year: {
    start: dayjs().startOf('year').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
  last_year: {
    start: dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
    end: dayjs().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
  },
};

export function generateMonthDateRange(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  const dates = [];

  let currentDate = start.clone();

  if (
    !start.isSame(start.startOf('month'), 'day') &&
    !start.isSame(start.endOf('month'), 'day')
  ) {
    dates.push(start.toDate());
  }

  while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
    if (
      currentDate.isSame(start.startOf('month'), 'day') &&
      !currentDate.isSame(start.endOf('month'), 'day')
    ) {
      dates.push(start.toDate());
    }

    const endOfMonth = currentDate.endOf('month');

    if (endOfMonth.isSame(end, 'day') || endOfMonth.isBefore(end, 'day')) {
      dates.push(endOfMonth.toDate());
    }

    currentDate = currentDate.add(1, 'month');
  }

  if (!end.isSame(end.endOf('month'), 'day')) {
    dates.push(end.toDate());
  }

  return dates;
}

export function ensureUniqueDates(dates: Date[], end: dayjs.Dayjs): Date[] {
  let currentDates = dates;

  const lengthOfDates = currentDates.length;

  if (dayjs.utc(currentDates[lengthOfDates - 1]).isAfter(end)) {
    currentDates[lengthOfDates - 1] = end.toDate();
  }

  currentDates = currentDates.reduce((uniqueDates, currentDate) => {
    const currentDateString = dayjs.utc(currentDate).format('YYYY-MM-DD');

    if (
      !uniqueDates.some(
        (date: Date) =>
          dayjs.utc(date).format('YYYY-MM-DD') === currentDateString
      )
    ) {
      uniqueDates.push(currentDate);
    }

    return uniqueDates;
  }, [] as Date[]);

  return currentDates;
}
