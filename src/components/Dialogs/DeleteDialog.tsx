/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { Button } from '../ui/button';
import { EducationServiceRoutes, ReviewServiceRoutes } from '@/lib/api';
import { GlobalNotifier } from '../ui/GlobalNotifier';
import { deleteData } from '@/lib/helperAPIMethods';

interface DeleteDialogProps {
  type: string;
  id: string;
  title: string;
  description: string;
  action: 'delete' | 'edit';
  showDialog: boolean;
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  type,
  id,
  title,
  description,
  action,
  showDialog,
  setShowDialog,
}) => {
  const handleDelete = async (id: string) => {
    let url = '';
    let itemType = '';

    switch (type) {
      case 'tag':
        url = `${EducationServiceRoutes.tags}/${id}`;
        itemType = 'Tag';
        break;
      case 'category':
        url = `${EducationServiceRoutes.category}/${id}`;
        itemType = 'Category';
        break;
      case 'comment':
        url = `${ReviewServiceRoutes.comments}/${id}`;
        itemType = 'Comment';
        break;
      case 'blog':
        url = `${EducationServiceRoutes.blogs}/${id}`;
        itemType = 'Blog';
        break;
      case 'podcast':
        url = `${EducationServiceRoutes.podcasts}/${id}`;
        itemType = 'podcast';
        break;
      default:
        console.error('Invalid type:', type);
        return;
    }

    const isDeleted = await deleteData(url);

    if (isDeleted) {
      GlobalNotifier(`${itemType} deleted successfully`, 'success');
      setShowDialog(false);
      window.location.reload();
    } else {
      console.error(`Error deleting ${itemType}`);
    }

    setShowDialog(false);
  };

  return (
    <>
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] z-50">
          <div className="flex flex-col gap-6 bg-white w-[90%] max-w-md rounded-lg shadow-lg p-6">
            {/* Dialog Header */}
            <div className="flex flex-col gap-1">
              <h2 className="paragraph-large-medium font-semibold">{title}</h2>
              <p className="text-small-paragraph text-black-300">
                {description}
              </p>
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end gap-2">
              <Button
                variant={'secondary'}
                className="order rounded-md text-gray-700"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              {action === 'delete' && (
                <Button
                  className=" bg-red-600 hover:bg-red-700 text-white rounded-md"
                  onClick={() => handleDelete(id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteDialog;
