export const ROOT_PLATFORM_ADMIN_EMAIL = 'norvingarcia220@gmail.com';

export function isRootPlatformAdmin(user: any) {
  return String(user?.email || '').trim().toLowerCase() === ROOT_PLATFORM_ADMIN_EMAIL;
}
