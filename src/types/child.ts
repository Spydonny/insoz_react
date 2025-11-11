export interface Child {
  uuid: string;
  doctor_id?: string;
  name: string;
  age: number;
  diagnosis: string[];
  picture_id?: string;
  picture?: File;
}
