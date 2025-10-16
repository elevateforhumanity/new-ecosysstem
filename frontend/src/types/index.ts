export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  avatarUrl?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  thumbnailUrl?: string;
  published: boolean;
  instructorId: string;
  instructor: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    lessons: number;
    reviews: number;
  };
  avgRating?: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  duration?: number;
  videoUrl?: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  progress: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  lesson: Lesson;
  completed: boolean;
  timeSpent: number;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  userId: string;
  courseId: string;
  course: Course;
  issuedAt: string;
  pdfUrl?: string;
}

export interface Review {
  id: string;
  userId: string;
  user: User;
  courseId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  stripePaymentIntentId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
