export interface DialogResult {
  status: 'deleted' | 'updated';
  path?: {
    mainTopic: string;
    subTopic: string;
    title: string;
  };
}
