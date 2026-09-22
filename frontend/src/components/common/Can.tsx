import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';

interface CanProps {
  permission: string | string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  permission,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { hasPermission } = useAuthStore();

  const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
  
  if (permissionsToCheck.length === 0) {
    return <>{children}</>;
  }

  const isAllowed = requireAll
    ? permissionsToCheck.every(p => hasPermission(p))
    : permissionsToCheck.some(p => hasPermission(p));

  if (isAllowed) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default Can;
