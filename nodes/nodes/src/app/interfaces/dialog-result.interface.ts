export interface DialogResult {
  status: 'updated' | 'created' | 'deleted';
  path?: {
    mainTopic: string;
    subTopic: string;
    title: string;
  };
  kiContent?: string;
}
