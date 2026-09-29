import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ light = false }) {
  return <Link className={`brand${light ? ' brand-light' : ''}`} to="/" aria-label="FoodSentry home"><span className="brand-mark"><Leaf size={19} strokeWidth={2.2} /></span><span>food<span className="brand-strong">sentry</span></span></Link>;
}
