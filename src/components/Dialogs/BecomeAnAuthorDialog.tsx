/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React from 'react';
import { Button } from '../ui/button';
import CustomButton from '../ui/customButton';
import { UserServiceRoutes } from '@/lib/api';
import { AppRoles } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';
import { GlobalNotifier } from '../ui/GlobalNotifier';

interface AuthorProps {
  showDialog: boolean;
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
}
const BecomeAnAuthorDialog: React.FC<AuthorProps> = ({
  showDialog,
  setShowDialog,
}) => {
  const { user, roleUpgrade } = useAuth();

  const handleBecomeAnAuthor = async () => {
    if (!user) return;

    const url = new URL(`${UserServiceRoutes.role}/assign`);
    url.searchParams.set('userId', user.id);
    url.searchParams.set('roleName', AppRoles.AUTHOR);

    try {
      const response = await fetch(url.toString(), { method: 'POST' });

      if (!response.ok) {
        throw new Error(`Failed to assign role: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.data) {
        GlobalNotifier(
          'Congratulations! You have successfully become an author',
          'success'
        );
        roleUpgrade(data.data.token);
      }
    } catch (err) {
      console.error('An error occurred', err);
      GlobalNotifier('Something went wrong. Please try again.', 'error');
    } finally {
      setShowDialog(false); // Ensure dialog closes in all cases
    }
  };

  return (
    <>
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] z-50">
          <div className="flex flex-col gap-6 bg-white w-[90%] max-w-md rounded-lg shadow-lg p-6">
            {/* Dialog Header */}
            <div className="flex flex-col gap-1">
              <h2 className="paragraph-large-medium font-semibold">
                Become an Author
              </h2>
              <p className="text-small-paragraph text-black-300">
                By clicking below, you will be assigned the &quot;Author&quot;
                role and gain access to content creation.
              </p>
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end gap-2">
              <Button
                variant={'secondary'}
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>

              <Button variant={'gradientOrange'} onClick={handleBecomeAnAuthor}>
                Yes, Become an Author
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BecomeAnAuthorDialog;
