import { AppDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  bio?: string;
  profilePicture?: string;
}

export interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  dateOfBirth?: Date;
  profilePicture?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProfileService {
  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  async getProfile(userId: string): Promise<ProfileResponse | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      profilePicture: user.profilePicture,
      bio: user.bio,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, updateData: UpdateProfileData): Promise<ProfileResponse | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      return null;
    }

    if (updateData.firstName) {
      user.firstName = updateData.firstName;
    }
    if (updateData.lastName) {
      user.lastName = updateData.lastName;
    }
    if (updateData.phone !== undefined) {
      user.phone = updateData.phone;
    }
    if (updateData.dateOfBirth !== undefined) {
      user.dateOfBirth = updateData.dateOfBirth;
    }
    if (updateData.bio !== undefined) {
      user.bio = updateData.bio;
    }
    if (updateData.profilePicture !== undefined) {
      user.profilePicture = updateData.profilePicture;
    }

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role,
      phone: savedUser.phone,
      dateOfBirth: savedUser.dateOfBirth,
      profilePicture: savedUser.profilePicture,
      bio: savedUser.bio,
      isVerified: savedUser.isVerified,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }
}
