import {InterventionActivityTimeframe} from '../common/models/intervention.types';
import {GenericObject} from '../common/models/globals.types';

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
const moment = window.moment;

export function serializeTimeFrameData(data: InterventionActivityTimeframe[]): ActivityTime[] {
  return (data || []).map((frame: InterventionActivityTimeframe) => {
    const start = moment(frame.start);
    const end = moment(frame.end);
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
