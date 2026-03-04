import api from './api';

interface CompanyRegisterData {
  company: {
    name: string;
    legalName?: string;
    email: string;
    phone?: string;
    website?: string;
    domain?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    taxId?: string;
    registrationNumber?: string;
    panNumber?: string;
    gstNumber?: string;
  };
  admin: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'COMPANY_ADMIN';
  };
}

export const CompanyService = {
  register: (data: CompanyRegisterData) =>
    api.post<{ company: any; user: any; token: string }>(
      '/company/register',
      data,
    ),
};
