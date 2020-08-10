import {InterventionActivityTimeframe} from '../common/models/intervention.types';
import {GenericObject} from '../common/models/globals.types';

export type ActivityTime = {
  start: Date;
  end: Date;
  year: number;
  frameDisplay: string;
  name: string;
  enabled: boolean;
};

export type GroupedActivityTime = [string, ActivityTime[]];

// @ts-ignore
const moment = window.moment;

export function serializeTimeFrameData(data: InterventionActivityTimeframe[]): ActivityTime[] {
  return (data || []).map((frame: InterventionActivityTimeframe) => {
    const start: Date = new Date(frame.start);
    const end: Date = new Date(frame.end);
    return {
      start,
      end,
      year: start.getFullYear(),
      frameDisplay: `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM')}`,
      name: frame.name,
      enabled: Boolean(frame.enabled)
    };
  });
}

export function convertActivityTimeToData(time: ActivityTime[]): InterventionActivityTimeframe[] {
  return time.map((timeData: ActivityTime) => ({
    start: moment(timeData.start).format('YYYY-MM-DD'),
    end: moment(timeData.end).format('YYYY-MM-DD'),
    enabled: timeData.enabled,
    name: timeData.name
  }));
}

export function groupByYear(times: ActivityTime[]): [string, ActivityTime[]][] {
  return Object.entries(
    times.reduce((byYear: GenericObject<ActivityTime[]>, frame: ActivityTime) => {
      if (!byYear[frame.year]) {
        byYear[frame.year] = [];
      }
      byYear[frame.year].push(frame);
      return byYear;
    }, {})
  );
}
