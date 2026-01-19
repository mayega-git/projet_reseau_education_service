/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { NewsletterInterface } from '@/types/newsletter';
import { CheckCircle, XCircle, MoreHorizontal, Eye } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '../ui/button';
import { truncateText } from '@/helper/TruncateText';
import StatusTag from '../ui/StatusTag';
import { GetUser } from '@/types/User';
import { useRouter } from 'next/navigation';
import { EducationServiceRoutes } from '@/lib/api';
import { GlobalNotifier } from '../ui/GlobalNotifier';
import RefuseDialog from '../Dialogs/RefuseDialog';
import DeleteDialog from '../Dialogs/DeleteDialog';

interface NewsletterDataTableProps {
  data: NewsletterInterface[];
  users: { [key: string]: GetUser };
}

const NewsletterDataTable: React.FC<NewsletterDataTableProps> = ({
  data,
  users,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const router = useRouter();

  // 👁️ Preview newsletter
  const handlePreview = (id: string) => {
    router.push(`/preview/newsletter/${id}`);
  };

  // 🚀 Publish newsletter
  const publishNewsletter = async (id: string) => {
    try {
      const response = await fetch(
        `${EducationServiceRoutes.newsletters}/${id}/publish`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish newsletter');
      }

      GlobalNotifier('Newsletter published successfully', 'success');

      // 🔄 Rafraîchissement simple après publication
      window.location.reload();
    } catch (err) {
      console.error('Error publishing newsletter:', err);
    }
  };

  // ❌ Refuse newsletter
  const handleRejection = (id: string) => {
    setShowRefuseDialog(true);
    setCurrentId(id);
    setDescription(
      'Please provide a reason for rejecting this newsletter publication'
    );
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-start">Title</th>
              <th className="px-4 py-2 border-b text-start">Description</th>
              <th className="px-4 py-2 border-b text-start">Posted By</th>
              <th className="px-4 py-2 border-b text-start">Status</th>
              <th className="px-4 py-2 border-b text-start">Created At</th>
              <th className="px-4 py-2 border-b text-start">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                {/* 📰 Titre */}
                <td className="px-4 py-2 border-b">
                  {truncateText(row.title)}
                </td>

                {/* 📝 Description */}
                <td className="px-4 py-2 border-b">
                  {truncateText(row.description)}
                </td>

                {/* 👤 Auteur (CORRIGÉ : authorId au lieu de row.id) */}
                <td className="px-4 py-2 border-b">
                  {row.authorId && users[row.authorId]
                    ? `${users[row.authorId].firstName} ${users[row.authorId].lastName}`
                    : 'Unknown'}
                </td>

                {/* 📌 Statut */}
                <td className="px-4 py-2 border-b">
                  <StatusTag status={row.status} />
                </td>

                {/* 🕒 Date de création */}
                <td className="px-4 py-2 border-b">
                  {new Intl.DateTimeFormat('en-GB', {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                  }).format(new Date(row.createdAt))}
                </td>

                {/* ⚙️ Actions */}
                <td className="px-4 py-2 border-b">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      {/* 👁️ Preview */}
                      <DropdownMenuItem onClick={() => handlePreview(row.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>

                      {/* ✅ Publish */}
                      <DropdownMenuItem
                        onClick={() => publishNewsletter(row.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Publish
                      </DropdownMenuItem>

                      {/* ❌ Decline */}
                      <DropdownMenuItem
                        className="text-redTheme"
                        onClick={() => handleRejection(row.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Decline publication
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🗑️ Delete dialog */}
      <DeleteDialog
        id={currentId}
        title={title}
        type="newsletter"
        description={description}
        action="delete"
        setShowDialog={setShowDialog}
        showDialog={showDialog}
      />

      {/* ❌ Refuse dialog */}
      <RefuseDialog
        setShowDialog={setShowRefuseDialog}
        showDialog={showRefuseDialog}
        description={description}
        id={currentId}
        type="newsletter"
      />
    </>
  );
};

export default NewsletterDataTable;
