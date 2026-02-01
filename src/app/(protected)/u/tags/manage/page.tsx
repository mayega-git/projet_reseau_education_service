/* eslint-disable @typescript-eslint/no-unused-vars */
import { Suspense } from 'react';
import EmptyState from '@/components/EmptyState/EmptyState';
import { EducationRoutes } from '@/lib/server/services';
import { TagInterface } from '@/types/tag';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable/DataTable';
import CreateTagDialogWrapper from '@/components/Tags/CreateDialogWrapper';
import SidebarPageHeading from '@/components/ui/SidebarPageHeading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { revalidateTag } from 'next/cache';

async function fetchAllTags(): Promise<TagInterface[]> {
  try {
    const response = await fetch(`${EducationRoutes.tags}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { tags: ['tags'] }, // Caches for 60 seconds for better performance
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }

    return response.json();
  } catch (err) {
    console.error('Error fetching tags:', err);
    return []; // Return an empty array to avoid blocking
  }
}

export default async function ManageTags() {
  // Server Action
  async function create() {
    'use server';
    revalidateTag('tags');
    // Mutate data
  }
  const tags = await fetchAllTags();
  // console.log(tags);

  return tags.length > 0 ? (
    <div className="flex flex-col">
      <div className="flex flex-col gap-8">
        <SidebarPageHeading
          title="Manage Tags"
          subtitle="Create, update and delete tags"
        />
        <div className="flex justify-end">
          <CreateTagDialogWrapper />
        </div>
        <DataTable data={tags} type="tag" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-8 items-center">
      <EmptyState />
      <CreateTagDialogWrapper />
    </div>
  );
}
