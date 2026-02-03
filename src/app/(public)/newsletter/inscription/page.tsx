'use client';

import React, { useEffect, useState } from 'react';
import HeaderWrapper from '@/components/Header/HeaderWrapper';
import Footer from '@/components/Footer';
import SidebarPageHeading from '@/components/ui/SidebarPageHeading';
import { Button } from '@/components/ui/button';
import NewsletterSubscribeDialog from '@/components/SubscribeCards/NewsletterSubscribeDialog';

const NewsletterInscriptionPage = () => {
  const [dialogOpen, setDialogOpen] = useState(true);

  useEffect(() => {
    setDialogOpen(true);
  }, []);

  return (
    <div className="w-full flex flex-col justify-between min-h-screen">
      <HeaderWrapper />
      <div className="container py-8 flex-1">
        <SidebarPageHeading
          title="Inscription newsletter"
          subtitle="Cree ton compte lecteur pour recevoir les newsletters."
        />

        <div className="mt-6 max-w-xl rounded-xl border border-grey-100 bg-white p-6 shadow-sm">
          <p className="paragraph-medium-normal text-black-300">
            Le formulaire s&apos;ouvre automatiquement. Si tu l&apos;as ferme,
            tu peux le rouvrir.
          </p>
          <div className="mt-4">
            <Button onClick={() => setDialogOpen(true)}>
              Ouvrir le formulaire
            </Button>
          </div>
        </div>
      </div>
      <Footer />

      <NewsletterSubscribeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default NewsletterInscriptionPage;
