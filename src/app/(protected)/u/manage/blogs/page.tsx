'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';
import NewsletterDataTable from '@/components/DataTable/NewsletterDataTable';
import EmptyState from '@/components/EmptyState/EmptyState';
import SidebarPageHeading from '@/components/ui/SidebarPageHeading';
import { getAllNewslettersEverCreated } from '@/lib/FetchNewsletterData';
import { fetchAllUsers } from '@/lib/FetchDataFromUserService';
import { NewsletterInterface } from '@/types/newsletter';
import { GetUser } from '@/types/User';

const ManageNewsletters: React.FC = () => {
  const [newsletters, setNewsletters] = useState<NewsletterInterface[]>([]);
  const [users, setUsers] = useState<{ [key: string]: GetUser }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        const allNewsletters = await getAllNewslettersEverCreated();
        setNewsletters(allNewsletters);

        // On filtre les newsletters avec authorId défini
        const newslettersWithAuthor = allNewsletters.filter(
          (n): n is NewsletterInterface & { authorId: string } => !!n.authorId
        );

        const usersMap = await fetchAllUsers(newslettersWithAuthor);
        setUsers(usersMap);
      } catch (err) {
        console.error('Error fetching newsletters or users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAsync();
  }, []);

  if (loading) return <div>Loading newsletters...</div>;

  if (!newsletters || newsletters.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <SidebarPageHeading
          title="Manage Newsletters"
          subtitle="Verify, publish and manage newsletters"
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <SidebarPageHeading
        title="Manage Newsletters"
        subtitle="Verify, publish and manage newsletters"
      />
      <NewsletterDataTable
        data={newsletters}
        users={users}
      />
    </div>
  );
};

export default ManageNewsletters;
