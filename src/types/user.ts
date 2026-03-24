export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string; 
  photoUrl?: string;
  createdAt?: string;
}
