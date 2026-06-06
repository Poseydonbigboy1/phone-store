export interface ManagerUser {
  id: string;
  name: string | null;
  login: string;
  password: string;
  roles: number;
}

export const ROLE_LABELS: Record<number, string> = {
  0: 'CUSTOMER',
  1: 'MANAGER',
};
