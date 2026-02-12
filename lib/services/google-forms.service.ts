import { AppDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';

export interface IntakeFormData {
  patientId: string;
  formId: string;
  submittedAt: Date;
  responses: FormResponse[];
  dietaryGoals: string[];
  allergies: string[];
  medicalConditions: string[];
  preferredSessionType: string;
  availabilityPreferences: string;
  additionalNotes: string;
}

export interface FormResponse {
  questionId: string;
  question: string;
  answer: string | string[];
}

export interface GoogleFormConfig {
  formId: string;
  formUrl: string;
  spreadsheetId?: string;
  webhookUrl?: string;
  fields: FormFieldMapping[];
}

export interface FormFieldMapping {
  formField: string;
  systemField: 'dietaryGoals' | 'allergies' | 'medicalConditions' | 'preferredSessionType' | 'availabilityPreferences' | 'additionalNotes';
  transform?: (value: string | string[]) => unknown;
}

const DEFAULT_FIELD_MAPPINGS: FormFieldMapping[] = [
  { formField: 'dietary_goals', systemField: 'dietaryGoals', transform: (v) => typeof v === 'string' ? v.split(',').map(s => s.trim()) : v },
  { formField: 'allergies', systemField: 'allergies', transform: (v) => typeof v === 'string' ? v.split(',').map(s => s.trim()) : v },
  { formField: 'medical_conditions', systemField: 'medicalConditions', transform: (v) => typeof v === 'string' ? v.split(',').map(s => s.trim()) : v },
  { formField: 'session_type', systemField: 'preferredSessionType' },
  { formField: 'availability', systemField: 'availabilityPreferences' },
  { formField: 'additional_notes', systemField: 'additionalNotes' },
];

export class GoogleFormsService {
  private userRepository = AppDataSource.getRepository(User);
  private appointmentRepository = AppDataSource.getRepository(Appointment);

  async processFormSubmission(formData: {
    formId: string;
    respondentEmail: string;
    responses: Record<string, string | string[]>;
  }): Promise<IntakeFormData | null> {
    const user = await this.userRepository.findOne({
      where: { email: formData.respondentEmail },
    });

    if (!user) {
      console.error('User not found for form submission:', formData.respondentEmail);
      return null;
    }

    const mappedData = this.mapResponsesToFields(formData.responses);

    return {
      patientId: user.id,
      formId: formData.formId,
      submittedAt: new Date(),
      responses: this.extractResponses(formData.responses),
      dietaryGoals: mappedData.dietaryGoals,
      allergies: mappedData.allergies,
      medicalConditions: mappedData.medicalConditions,
      preferredSessionType: mappedData.preferredSessionType,
      availabilityPreferences: mappedData.availabilityPreferences,
      additionalNotes: mappedData.additionalNotes,
    };
  }

  private mapResponsesToFields(responses: Record<string, string | string[]>): Omit<IntakeFormData, 'patientId' | 'formId' | 'submittedAt' | 'responses'> {
    const result: Record<string, string | string[]> = {
      dietaryGoals: '',
      allergies: '',
      medicalConditions: '',
      preferredSessionType: 'initial_consultation',
      availabilityPreferences: '',
      additionalNotes: '',
    };

    for (const mapping of DEFAULT_FIELD_MAPPINGS) {
      const formValue = responses[mapping.formField];
      if (formValue !== undefined) {
        if (mapping.transform) {
          result[mapping.systemField] = mapping.transform(formValue) as string | string[];
        } else {
          result[mapping.systemField] = formValue;
        }
      }
    }

    return {
      dietaryGoals: result.dietaryGoals as string[],
      allergies: result.allergies as string[],
      medicalConditions: result.medicalConditions as string[],
      preferredSessionType: result.preferredSessionType as string,
      availabilityPreferences: result.availabilityPreferences as string,
      additionalNotes: result.additionalNotes as string,
    };
  }

  private extractResponses(responses: Record<string, string | string[]>): FormResponse[] {
    return Object.entries(responses).map(([questionId, answer]) => ({
      questionId,
      question: this.getQuestionLabel(questionId),
      answer,
    }));
  }

  private getQuestionLabel(fieldId: string): string {
    const labels: Record<string, string> = {
      diet_goals: 'What are your dietary goals?',
      allergies: 'Do you have any allergies?',
      medical_conditions: 'Do you have any medical conditions?',
      session_type: 'What type of session do you prefer?',
      availability: 'What is your preferred availability?',
      additional_notes: 'Additional notes or concerns',
    };
    return labels[fieldId] || fieldId;
  }

  async createFormUrl(doctorId: string, patientId: string): Promise<string> {
    const baseFormUrl = process.env.GOOGLE_FORM_BASE_URL || 'https://docs.google.com/forms/d/e/FORM_ID/viewform';
    const formId = process.env.PATIENT_INTAKE_FORM_ID || 'default_form';

    const params = new URLSearchParams({
      usp: 'pp_url',
      entry_doctor_id: doctorId,
      entry_patient_id: patientId,
    });

    return baseFormUrl.replace('FORM_ID', formId) + '?' + params.toString();
  }

  async getFormAnalytics(formId: string): Promise<{
    totalSubmissions: number;
    completedSubmissions: number;
    averageCompletionTime: number;
    dropOffRate: number;
    fieldCompletionRates: Record<string, number>;
  }> {
    return {
      totalSubmissions: 0,
      completedSubmissions: 0,
      averageCompletionTime: 0,
      dropOffRate: 0,
      fieldCompletionRates: {},
    };
  }

  async scheduleFollowUp(formData: IntakeFormData, doctorId: string): Promise<Appointment | null> {
    try {
      const patient = await this.userRepository.findOne({
        where: { id: formData.patientId },
      });

      const doctor = await this.userRepository.findOne({
        where: { id: doctorId },
      });

      if (!patient || !doctor) {
        return null;
      }

      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 3);
      appointmentDate.setHours(10, 0, 0, 0);

      const appointment = new Appointment();
      appointment.patient = patient;
      appointment.doctor = doctor;
      appointment.startTime = appointmentDate;
      appointment.duration = 60;
      appointment.status = AppointmentStatus.SCHEDULED;
      appointment.notes = `Follow-up from intake form submitted on ${formData.submittedAt.toISOString()}\n\nGoals: ${formData.dietaryGoals.join(', ')}\nAllergies: ${formData.allergies.join(', ')}`;
      appointment.isRecurring = false;
      appointment.recurrencePosition = 1;
      appointment.meetingPhase = 'pre_session';
      appointment.wasCancelledFromSession = false;

      return await this.appointmentRepository.save(appointment);
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      return null;
    }
  }

  async triggerWorkflow(formData: IntakeFormData): Promise<{
    workflowType: string;
    triggered: boolean;
    workflowId?: string;
  }> {
    let workflowType = 'standard_intake';

    if (formData.medicalConditions.length > 0) {
      workflowType = 'medical_review_required';
    }

    if (formData.allergies.length > 5) {
      workflowType = 'allergy_specialist_referral';
    }

    return {
      workflowType,
      triggered: true,
      workflowId: `wf_${Date.now()}_${formData.patientId}`,
    };
  }
}

export const googleFormsService = new GoogleFormsService();
