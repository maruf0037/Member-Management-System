import { Timestamp } from 'firebase/firestore';

export type MemberType = 'Life' | 'General' | 'Associate';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Member {
  id?: string;
  memberId?: string; // Foundation specific ID
  memberType: MemberType;
  name: string;
  fathersName?: string;
  mothersName?: string;
  mobileNo: string;
  emailAddress: string;
  bloodGroup: BloodGroup;
  gender: Gender;
  designation?: string;
  committee?: string;
  occupation: string;
  installationDate: string;
  isDeceased: boolean;
  deceasedDate?: string;
  presentAddress: string;
  permanentAddress: string;
  businessAddress: string;
  photoUrl?: string;
  monthlyFee: number;
  joinDate: string;
  createdBy: string;
  createdDate: Timestamp | Date;
  updatedBy?: string;
  updatedDate?: Timestamp | Date;
}

export interface Subscription {
  id?: string;
  memberId: string;
  memberName: string;
  month: number; // 1-12
  year: number;
  amount: number;
  paymentDate: string;
  status: 'Paid' | 'Due';
  transactionId?: string;
  recordedBy: string;
  recordedAt: Timestamp | Date;
}

export interface FinancialRecord {
  id?: string;
  type: 'Income' | 'Expense';
  category: string; // e.g., 'Subscription', 'Donation', 'Social Work', 'Admin'
  amount: number;
  date: string;
  description: string;
  referenceId?: string; // e.g., subscriptionId or activityId
  recordedBy: string;
  recordedAt: Timestamp | Date;
}

export interface Activity {
  id?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  images: string[];
  cost: number;
  status: 'Planned' | 'Completed';
  createdAt: Timestamp | Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
}

export interface AppSettings {
  id?: string;
  openingBalance: number;
  updatedBy: string;
  updatedAt: Timestamp | Date;
}
