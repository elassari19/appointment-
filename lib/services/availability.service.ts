import { AppDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';
import { Availability, DayOfWeek } from '@/lib/entities/Availability';

export interface AvailabilityData {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  defaultDuration?: number;
}

export interface BlockedSlot {
  id?: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
}

export class AvailabilityService {
  private get availabilityRepository() {
    return AppDataSource.getRepository(Availability);
  }

  async getDietitianAvailability(dietitianId: string): Promise<Availability[]> {
    return await this.availabilityRepository.find({
      where: { dietitian: { id: dietitianId } },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async updateDietitianAvailability(
    dietitianId: string,
    availabilityData: AvailabilityData[]
  ): Promise<Availability[]> {
    const existing = await this.availabilityRepository.find({
      where: { dietitian: { id: dietitianId } },
    });

    for (const avail of existing) {
      await this.availabilityRepository.remove(avail);
    }

    const newAvailabilities: Availability[] = [];

    for (const data of availabilityData) {
      if (data.isAvailable) {
        const availability = new Availability();
        availability.dietitian = { id: dietitianId } as User;
        availability.dayOfWeek = data.dayOfWeek;
        availability.startTime = data.startTime;
        availability.endTime = data.endTime;
        availability.isAvailable = true;
        availability.defaultDuration = data.defaultDuration || 60;

        newAvailabilities.push(await this.availabilityRepository.save(availability));
      }
    }

    return newAvailabilities;
  }

  async addAvailabilitySlot(
    dietitianId: string,
    data: AvailabilityData
  ): Promise<Availability> {
    const availability = new Availability();
    availability.dietitian = { id: dietitianId } as User;
    availability.dayOfWeek = data.dayOfWeek;
    availability.startTime = data.startTime;
    availability.endTime = data.endTime;
    availability.isAvailable = data.isAvailable;
    availability.defaultDuration = data.defaultDuration || 60;

    return await this.availabilityRepository.save(availability);
  }

  async deleteAvailabilitySlot(slotId: string): Promise<boolean> {
    const slot = await this.availabilityRepository.findOne({
      where: { id: slotId },
    });

    if (!slot) {
      return false;
    }

    await this.availabilityRepository.remove(slot);
    return true;
  }

  async getWeeklySchedule(dietitianId: string): Promise<{
    [key: string]: { start: string; end: string; isAvailable: boolean }[];
  }> {
    const availability = await this.getDietitianAvailability(dietitianId);
    const schedule: {
      [key: string]: { start: string; end: string; isAvailable: boolean }[];
    } = {};

    const days: DayOfWeek[] = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY,
    ];

    for (const day of days) {
      schedule[day] = availability
        .filter((a) => a.dayOfWeek === day && a.isAvailable)
        .map((a) => ({
          start: a.startTime,
          end: a.endTime,
          isAvailable: a.isAvailable,
        }));
    }

    return schedule;
  }
}
