import {InterventionActivityTimeframe, GenericObject} from '@unicef-polymer/etools-types';

export type ActivityTime = {
  start: Date;
  end: Date;
  year: number;
  frameDisplay: string;
  name: string;
  id: number;
};

export type GroupedActivityTime = [string, ActivityTime[]];

// @ts-ignore
const dayjs = window.dayjs;
export function serializeTimeFrameData(data: InterventionActivityTimeframe[]): ActivityTime[] {
  return (data || []).map((frame: InterventionActivityTimeframe) => {
    const start = dayjs(frame.start);
    const end = dayjs(frame.end);
    return {
      start: start.toDate(),
      end: end.toDate(),
      year: start.year(),
      frameDisplay: `${start.format('DD MMM')} - ${end.format('DD MMM')}`,
      name: frame.name,
      id: frame.id
    };
  });
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
