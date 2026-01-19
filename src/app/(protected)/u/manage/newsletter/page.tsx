/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import NewsletterDataTable from '@/components/DataTable/NewsletterDataTable';
import EmptyState from '@/components/EmptyState/EmptyState';
import SidebarPageHeading from '@/components/ui/SidebarPageHeading';
import { getAllNewslettersEverCreated } from '@/lib/FetchNewsletterData';
import { fetchAllUsers } from '@/lib/FetchDataFromUserService';
import { NewsletterInterface } from '@/types/newsletter';
import { GetUser } from '@/types/User';

const ManageNewsletters: React.FC = () => {
  // 🔹 Toutes les newsletters
  const [newsletters, setNewsletters] = useState<NewsletterInterface[]>([]);

  // 🔹 Newsletters filtrées (affichées)
  const [filteredNewsletters, setFilteredNewsletters] = useState<
    NewsletterInterface[]
  >([]);

  // 🔹 Map des utilisateurs (clé = userId)
  const [users, setUsers] = useState<{ [key: string]: GetUser }>({});

  const [loading, setLoading] = useState(true);

  // =====================================================
  //  STATES DES FILTRES
  // =====================================================

  // Recherche texte (titre + description)
  const [searchText, setSearchText] = useState('');

  // Filtre par statut
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filtre par auteur
  const [authorFilter, setAuthorFilter] = useState('ALL');

  // =====================================================
  //  FETCH DES DONNÉES
  // ====================================================
  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        // 🔹 Données en dur POUR TEST (NE PAS SUPPRIMER)
        const exampleNewsletters: NewsletterInterface[] = [
          {
            id: 'n1',
            title: 'Weekly Tech Update',
            description: 'Latest trends in web development',
            status: 'DRAFT',
            createdAt: '2025-12-15T10:30:00Z',
            authorId: 'u1',
          },
          {
            id: 'n2',
            title: 'Health Newsletter',
            description: 'Tips for a healthy lifestyle',
            status: 'VERIFIED',
            createdAt: '2025-12-14T08:15:00Z',
            authorId: 'u2',
          },
          {
            id: 'n3',
            title: 'Travel Insights',
            description: 'Top destinations for 2026',
            status: 'PUBLISHED',
            createdAt: '2025-12-12T14:00:00Z',
            authorId: 'u3',
          },
        ];

        // 🔹 Récupération backend
        const allNewsletters = await getAllNewslettersEverCreated();

        // 🔹 Fusion données backend + données de test
        const combined = [...exampleNewsletters, ...allNewsletters];

        setNewsletters(combined);
        setFilteredNewsletters(combined);

        // 🔹 Récupération des auteurs
        const newslettersWithAuthor = combined.filter(
          (n): n is NewsletterInterface & { authorId: string } =>
            typeof n.authorId === 'string'
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

  // =====================================================
  // LOGIQUE DES FILTRES (AUTOMATIQUE)
  // =====================================================
  useEffect(() => {
    let result = [...newsletters];

    // 🔍 FILTRE TEXTE (titre + description)
    if (searchText.trim() !== '') {
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(searchText.toLowerCase()) ||
          n.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    //  FILTRE STATUT
    if (statusFilter !== 'ALL') {
      result = result.filter((n) => n.status === statusFilter);
    }

    //  FILTRE AUTEUR
    if (authorFilter !== 'ALL') {
      result = result.filter((n) => n.authorId === authorFilter);
    }

    setFilteredNewsletters(result);
  }, [searchText, statusFilter, authorFilter, newsletters]);

  // =====================================================
  //  LISTE UNIQUE DES AUTEURS (TYPE SAFE)
  // =====================================================
  const authorsList = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        newsletters
          .map((n) => n.authorId)
          .filter((id): id is string => typeof id === 'string')
      )
    );
  }, [newsletters]);

  if (loading) return <div>Loading newsletters...</div>;

  return (
    <div className="flex flex-col gap-6">
      <SidebarPageHeading
        title="Manage Newsletters"
        subtitle="Verify, publish and manage newsletters"
      />

      {/* =====================================================
          BARRE DE FILTRES
      ===================================================== */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-md border">

        {/* 🔍 Recherche texte */}
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border px-3 py-2 rounded-md w-64"
        />

        {/* 📌 Filtre statut */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="VERIFIED">Verified</option>
          <option value="PUBLISHED">Published</option>
        </select>

        {/* 👤 Filtre auteur */}
        <select
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="border px-3 py-2 rounded-md"
        >
          <option value="ALL">All Authors</option>
          {authorsList.map((authorId) => (
            <option key={authorId} value={authorId}>
              {users[authorId]
                ? `${users[authorId].firstName} ${users[authorId].lastName}`
                : authorId}
            </option>
          ))}
        </select>
      </div>

      {/* =====================================================
          TABLE DES NEWSLETTERS
      ===================================================== */}
      {filteredNewsletters.length === 0 ? (
        <EmptyState />
      ) : (
        <NewsletterDataTable
          data={filteredNewsletters}
          users={users}
        />
      )}
    </div>
  );
};

export default ManageNewsletters;
