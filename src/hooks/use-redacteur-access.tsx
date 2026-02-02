import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppRoles } from '@/constants/roles';
import { fetchRedacteurRequestStatus } from '@/lib/FetchNewsletterData';
import type { RedacteurRequestResponse } from '@/types/newsletter';

const STORAGE_KEY = 'newsletterRedacteurRequestId';

export const useRedacteurAccess = () => {
  const { role, user } = useAuth();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] =
    useState<RedacteurRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const hasRoleAccess = useMemo(
    () =>
      Boolean(
        role?.includes(AppRoles.SUPER_ADMIN) ||
          role?.includes(AppRoles.ADMIN) ||
          role?.includes(AppRoles.AUTHOR)
      ),
    [role]
  );

  const storeRequestId = useCallback((id: string) => {
    if (!id) return;
    localStorage.setItem(STORAGE_KEY, id);
    setRequestId(id);
  }, []);

  const refreshStatus = useCallback(
    async (id?: string | null) => {
      const resolvedId = id ?? requestId;
      if (!resolvedId) {
        return null;
      }
      const status = await fetchRedacteurRequestStatus(resolvedId);
      setRequestStatus(status);
      return status;
    },
    [requestId]
  );

  useEffect(() => {
    if (hasRoleAccess) {
      setLoading(false);
      return;
    }

    const storedId = localStorage.getItem(STORAGE_KEY);
    if (!storedId) {
      setLoading(false);
      return;
    }

    setRequestId(storedId);
    refreshStatus(storedId).finally(() => setLoading(false));
  }, [hasRoleAccess, refreshStatus, user?.sub]);

  const hasAccess = hasRoleAccess || requestStatus?.status === 'APPROVED';

  return {
    hasAccess,
    loading,
    requestStatus,
    requestId,
    storeRequestId,
    refreshStatus,
  };
};
