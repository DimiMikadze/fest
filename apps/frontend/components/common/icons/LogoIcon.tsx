import React from 'react';
import { Link } from '../';

interface LogoIconProps {
  color?: 'black' | 'white';
}

const LogoIcon = ({ color = 'white' }: LogoIconProps) => {
  return <Link href="/">Fest</Link>;
};

export default LogoIcon;
