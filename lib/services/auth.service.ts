import { AppDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';
import { Session } from '@/lib/entities/Session';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UserRole } from '@/lib/entities/User';

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  dateOfBirth?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  session: Session;
}

export class AuthService {
  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  private get sessionRepository() {
    return AppDataSource.getRepository(Session);
  }

  async register(userData: RegisterUserData): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create new user
    const user = new User();
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.email = userData.email;
    user.password = hashedPassword;
    user.role = userData.role || UserRole.PATIENT;
    user.phone = userData.phone;
    user.dateOfBirth = userData.dateOfBirth;
    user.isActive = true;
    user.isVerified = false; // Will be verified later

    const savedUser = await this.userRepository.save(user);

    // Create a session for the newly registered user
    const session = await this.createSession(savedUser.id);

    return { user: savedUser, session };
  }

  async login(credentials: LoginCredentials): Promise<AuthResult | null> {
    // Find user by email - explicitly select password since it's excluded by default
    const user = await this.userRepository.findOne({
      where: { email: credentials.email, isActive: true },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'role', 'isActive'],
    });

    console.log('Login attempt for:', credentials.email);
    console.log('User found:', user ? 'yes' : 'no');
    console.log('User active:', user?.isActive);
    console.log('User has password:', !!user?.password);

    if (!user) {
      return null;
    }

    if (!user.password) {
      console.log('No password hash found for user');
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      return null;
    }

    // Create a new session
    const session = await this.createSession(user.id);

    return { user, session };
  }

  async logout(sessionToken: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { token: sessionToken, isActive: true },
    });

    if (!session) {
      return false;
    }

    session.isActive = false;
    await this.sessionRepository.save(session);

    return true;
  }

  async getUserBySessionToken(token: string): Promise<User | null> {
    const session = await this.sessionRepository.findOne({
      where: { token, isActive: true },
    });

    if (!session) {
      return null;
    }

    return await this.userRepository.findOne({
      where: { id: session.userId, isActive: true },
    });
  }

  private async createSession(userId: string): Promise<Session> {
    // First, invalidate any existing sessions for this user
    await this.sessionRepository.update(
      { userId, isActive: true },
      { isActive: false }
    );

    // Create a new session
    const session = new Session();
    session.token = crypto.randomBytes(32).toString('hex'); // Generate random token
    session.userId = userId;
    
    // Set expiration (e.g., 7 days)
    const now = new Date();
    session.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return await this.sessionRepository.save(session);
  }

  async validateUserRole(
    sessionToken: string,
    requiredRoles: UserRole[]
  ): Promise<{ isValid: boolean; user?: User }> {
    const user = await this.getUserBySessionToken(sessionToken);

    if (!user || !requiredRoles.includes(user.role)) {
      return { isValid: false };
    }

    return { isValid: true, user };
  }

  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      return null;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = expiresAt;

    await this.userRepository.save(user);

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        isActive: true,
      },
    });

    if (!user) {
      return false;
    }

    if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
      return false;
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await this.userRepository.save(user);

    await this.sessionRepository.update(
      { userId: user.id, isActive: true },
      { isActive: false }
    );

    return true;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      select: ['id', 'password'],
    });

    if (!user || !user.password) {
      return false;
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return false;
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.save(user);

    await this.sessionRepository.update(
      { userId: user.id, isActive: true },
      { isActive: false }
    );

    return true;
  }

  async generateVerificationToken(email: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      return null;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = expiresAt;

    await this.userRepository.save(user);

    return verificationToken;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        verificationToken: token,
        isActive: true,
      },
    });

    if (!user) {
      return false;
    }

    if (!user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
      return false;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await this.userRepository.save(user);

    return true;
  }

  async resendVerificationEmail(email: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      return null;
    }

    if (user.isVerified) {
      return null;
    }

    return this.generateVerificationToken(email);
  }
}