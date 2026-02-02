'use client';

import React, { useEffect, useState } from 'react';
import HeaderWrapper from '@/components/Header/HeaderWrapper';
import Footer from '@/components/Footer';
import NavTabsNewsLetter from '@/components/Navigation/NavTabsNewsLetter';
import SidebarPageHeading from '@/components/ui/SidebarPageHeading';
import EmptyState from '@/components/EmptyState/EmptyState';
import NewsletterDataTable from '@/components/DataTable/NewsletterDataTable';
import { useAuth } from '@/context/AuthContext';
import {
  fetchNewslettersByRedacteur,
  submitRedacteurRequest,
} from '@/lib/FetchNewsletterData';
import type { NewsletterResponse } from '@/types/newsletter';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { GlobalNotifier } from '@/components/ui/GlobalNotifier';
import { useRedacteurAccess } from '@/hooks/use-redacteur-access';

const NewsletterDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const {
    hasAccess,
    loading: accessLoading,
    requestStatus,
    storeRequestId,
    refreshStatus,
  } = useRedacteurAccess();
  const [newsletters, setNewsletters] = useState<NewsletterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [statusRefreshing, setStatusRefreshing] = useState(false);
  const [formValues, setFormValues] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (!user) return;
    setFormValues((prev) => ({
      email: prev.email || user.sub || '',
      firstName: prev.firstName || user.firstName || '',
      lastName: prev.lastName || user.lastName || '',
    }));
  }, [user]);

  const loadNewsletters = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchNewslettersByRedacteur(user.id);
    setNewsletters(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    if (user?.id) {
      loadNewsletters();
    }
  }, [hasAccess, user?.id]);

  const handleSubmitRequest = async () => {
    if (!formValues.email || !formValues.firstName || !formValues.lastName) {
      GlobalNotifier('Completes tous les champs.', 'warning');
      return;
    }

    setRequestSubmitting(true);
    const result = await submitRedacteurRequest({
      email: formValues.email,
      nom: formValues.lastName,
      prenom: formValues.firstName,
    });
    setRequestSubmitting(false);

    if (!result?.id) {
      GlobalNotifier('Demande impossible.', 'error');
      return;
    }

    storeRequestId(result.id);
    await refreshStatus(result.id);
    GlobalNotifier('Demande envoyee.', 'success');
  };

  const handleRefreshStatus = async () => {
    setStatusRefreshing(true);
    const updated = await refreshStatus();
    setStatusRefreshing(false);

    if (updated?.status === 'APPROVED') {
      GlobalNotifier('Demande approuvee.', 'success');
    } else if (updated?.status === 'REJECTED') {
      GlobalNotifier('Demande rejetee.', 'warning');
    }
  };

  return (
    <div className="w-full flex flex-col justify-between min-h-screen">
      <HeaderWrapper />
      {hasAccess && <NavTabsNewsLetter />}
      <div className="container py-6 flex-1">
        {accessLoading ? (
          <p className="paragraph-medium-normal text-black-300 mt-6">
            Verification de l&apos;acces...
          </p>
        ) : !hasAccess ? (
          <div className="max-w-2xl">
            <SidebarPageHeading
              title="Devenir redacteur"
              subtitle="Complete tes informations pour acceder au tableau des newsletters."
            />

            {requestStatus?.status === 'PENDING' && (
              <div className="mt-6 rounded-xl border border-primaryPurple-200 bg-primaryPurple-50 p-4">
                <p className="paragraph-medium-medium text-primaryPurple-700">
                  Demande en cours de validation.
                </p>
                <p className="paragraph-small-normal text-black-300 mt-2">
                  Tu peux rafraichir le statut ou revenir plus tard.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleRefreshStatus}
                  disabled={statusRefreshing}
                >
                  {statusRefreshing ? 'Verification...' : 'Rafraichir le statut'}
                </Button>
              </div>
            )}

            {requestStatus?.status === 'REJECTED' && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="paragraph-medium-medium text-red-600">
                  Demande rejetee.
                </p>
                {requestStatus.rejectionReason && (
                  <p className="paragraph-small-normal text-black-300 mt-2">
                    Motif: {requestStatus.rejectionReason}
                  </p>
                )}
              </div>
            )}

            {(!requestStatus || requestStatus.status === 'REJECTED') && (
              <div className="mt-6 rounded-xl border border-grey-200 bg-white p-6 space-y-4">
                <div>
                  <label htmlFor="redacteur-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="redacteur-email"
                    type="email"
                    className="custom-input"
                    value={formValues.email}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="redacteur-firstname" className="form-label">
                      Prenom
                    </label>
                    <input
                      id="redacteur-firstname"
                      type="text"
                      className="custom-input"
                      value={formValues.firstName}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          firstName: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="redacteur-lastname" className="form-label">
                      Nom
                    </label>
                    <input
                      id="redacteur-lastname"
                      type="text"
                      className="custom-input"
                      value={formValues.lastName}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          lastName: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleSubmitRequest}
                    disabled={requestSubmitting}
                  >
                    {requestSubmitting ? 'Envoi...' : 'Envoyer la demande'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/u/feed/blog')}
                  >
                    Retour
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <SidebarPageHeading
                title="Newsletters"
                subtitle="Gere et soumets tes newsletters."
              />
              <Button onClick={() => router.push('/newsletter/create')}>
                Create Newsletter
              </Button>
            </div>

            {loading ? (
              <p className="paragraph-medium-normal text-black-300 mt-6">
                Chargement...
              </p>
            ) : newsletters.length === 0 ? (
              <div className="mt-8">
                <EmptyState />
              </div>
            ) : (
              <div className="mt-8">
                <NewsletterDataTable
                  data={newsletters}
                  variant="redacteur"
                  redacteurId={user?.id}
                  onRefresh={loadNewsletters}
                  onEdit={(id) => router.push(`/newsletter/update?id=${id}`)}
                />
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NewsletterDashboard;
