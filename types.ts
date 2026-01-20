
export interface Profile {
  id: string;
  business_name: string;
  google_review_url: string;
  terms_url?: string;
  privacy_url?: string;
  refund_url?: string;
  paddle_sub_status: string;
  created_at: string;
}

export interface FeedbackRequest {
  id: string;
  user_id: string;
  customer_name: string;
  status: 'pending' | 'clicked' | 'rated' | 'expired';
  rating: number | null;
  feedback_text: string | null;
  created_at: string;
}

export interface FeedbackWithProfile extends FeedbackRequest {
  profiles: {
    business_name: string;
    google_review_url: string;
    terms_url?: string;
    privacy_url?: string;
    refund_url?: string;
  };
}