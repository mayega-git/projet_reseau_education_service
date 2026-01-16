'use client';
import React, { useState } from 'react';
import CustomButton from '../ui/customButton';

const SubscribeCardLandingPage = () => {
  const [email, setEmail] = useState('');
  return (
    <div className="mt-4 w-[500px] flex paragraph-medium-normal rounded-full bg-inherit border border-grey-500">
      <input
        type="email"
        name="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        id="email"
        placeholder="Email Address"
        className="px-[16px] py-[8px] outline-none bg-inherit w-full paragraph-medium-normal"
      />
      <CustomButton variant="secondary" round>
        Subscribe
      </CustomButton>
    </div>
  );
};

export default SubscribeCardLandingPage;
