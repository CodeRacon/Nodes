export interface LearningEntry {
  id?: string;
  title: string;
  mainTopic: string;
  subTopic?: string;
  description: string;
  createdAt: Date;
  updatedAt?: Date;
}
