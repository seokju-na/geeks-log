import { UserAuth } from '@geeks-log/next-server';
import { NextPage } from 'next';
import React from 'react';

interface Props {
  userAuth?: UserAuth;
}

const Ho: NextPage<Props> = ({ userAuth }) => {
  return <span>{userAuth ? `Hello ${userAuth.name}` : 'Who are you?'}</span>;
};

Ho.getInitialProps = async ({ req }) => {
  const userAuth = req !== undefined ? (req as any).userAuth : null;
  return { userAuth };
};

export default Ho;
