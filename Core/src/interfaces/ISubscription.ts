export interface CreateSubscription {
  name: string;
  topicId: string;
  endpointUrl: string;
  messageRetentionDuration?: number;
}

export interface UpdateSubscription {
  subscriptionId: string;
  name?: string;
  endpointUrl?: string;
  messageRetentionDuration?: number;
}
