import { AppDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';
import { Availability, DayOfWeek } from '@/lib/entities/Availability';
import { BlockedSlot } from '@/lib/entities/BlockedSlot';

export interface AvailabilityData {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  defaultDuration?: number;
}

export interface BlockedSlotData {
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
}

export class AvailabilityService {
  private get availabilityRepository() {
    return AppDataSource.getRepository(Availability);
  }

  private get blockedSlotRepository() {
    return AppDataSource.getRepository(BlockedSlot);
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

  async bulkUpdateAvailability(
    dietitianId: string,
    days: DayOfWeek[],
    startTime: string,
    endTime: string,
    defaultDuration: number = 60
  ): Promise<Availability[]> {
    const newAvailabilities: Availability[] = [];

    for (const day of days) {
      const availability = new Availability();
      availability.dietitian = { id: dietitianId } as User;
      availability.dayOfWeek = day;
      availability.startTime = startTime;
      availability.endTime = endTime;
      availability.isAvailable = true;
      availability.defaultDuration = defaultDuration;

      newAvailabilities.push(await this.availabilityRepository.save(availability));
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

  async addBlockedSlot(
    dietitianId: string,
    data: BlockedSlotData
  ): Promise<BlockedSlot> {
    const blockedSlot = new BlockedSlot();
    blockedSlot.dietitianId = dietitianId;
    blockedSlot.date = data.date;
    blockedSlot.startTime = data.startTime;
    blockedSlot.endTime = data.endTime;
    blockedSlot.reason = data.reason;

    return await this.blockedSlotRepository.save(blockedSlot);
  }

  async getBlockedSlots(
    dietitianId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BlockedSlot[]> {
    const queryBuilder = this.blockedSlotRepository
      .createQueryBuilder('blockedSlot')
      .where('blockedSlot.dietitian_id = :dietitianId', { dietitianId });

    if (startDate) {
      queryBuilder.andWhere('blockedSlot.date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('blockedSlot.date <= :endDate', { endDate });
    }

    queryBuilder.orderBy('blockedSlot.date', 'ASC').addOrderBy('blockedSlot.startTime', 'ASC');

    return await queryBuilder.getMany();
  }

  async deleteBlockedSlot(blockedSlotId: string): Promise<boolean> {
    const blockedSlot = await this.blockedSlotRepository.findOne({
      where: { id: blockedSlotId },
    });

    if (!blockedSlot) {
      return false;
    }

    await this.blockedSlotRepository.remove(blockedSlot);
    return true;
  }

  async isSlotBlocked(
    dietitianId: string,
    date: Date,
    time: string
  ): Promise<boolean> {
    const dateStr = date.toISOString().split('T')[0];
    
    const blockedSlot = await this.blockedSlotRepository
      .createQueryBuilder('blockedSlot')
      .where('blockedSlot.dietitian_id = :dietitianId', { dietitianId })
      .andWhere('blockedSlot.date = :date', { date: dateStr })
      .andWhere('blockedSlot.start_time <= :time', { time })
      .andWhere('blockedSlot.end_time > :time', { time })
      .getOne();

    return !!blockedSlot;
  }

  async getBlockedSlotsForDate(dietitianId: string, date: Date): Promise<BlockedSlot[]> {
    const dateStr = date.toISOString().split('T')[0];
    
    return await this.blockedSlotRepository.find({
      where: {
        dietitianId,
        date: dateStr as any,
      },
      order: { startTime: 'ASC' },
    });
  }
}
