export type TenantRole = 'owner' | 'admin' | 'valuer' | 'agent' | 'viewer';
export type TenantStatus = 'active' | 'suspended' | 'expired';

export type TenantBranding = {
  organizationName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  footerText?: string;
  watermark?: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  branding?: TenantBranding;
  license?: {
    status: TenantStatus;
    plan?: string;
    startsAt?: unknown;
    expiresAt?: unknown;
    limits?: { users?: number; monthlyAvaluos?: number };
    features?: { terrenos?: boolean; casas?: boolean; advancedPdf?: boolean };
  };
};

export type TenantMembership = {
  tenantId: string;
  uid: string;
  role: TenantRole;
  status: 'active' | 'invited' | 'disabled';
  permissions?: string[];
};
