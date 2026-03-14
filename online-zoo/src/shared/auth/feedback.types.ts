export interface IFeedback {
  id: number;
  city: string;
  month: string;
  year: number;
  text: string;
  name: string;
}

export interface IFeedbacksResponse {
  data: IFeedback[];
}
