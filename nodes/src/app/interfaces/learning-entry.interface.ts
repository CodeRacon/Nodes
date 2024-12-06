import { FieldValue } from 'firebase/firestore';

export interface LearningEntry {
  id: string;
  title: string;
  description: string;
  mainTopic: string;
  subTopic: string;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
}
