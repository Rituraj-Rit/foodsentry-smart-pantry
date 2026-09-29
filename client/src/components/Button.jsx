import { motion } from 'motion/react';

export default function Button({ variant = 'primary', size = '', icon: Icon, children, className = '', type = 'button', ...props }) {
  return <motion.button type={type} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className={`button button-${variant}${size ? ` button-${size}` : ''} ${className}`.trim()} {...props}>{Icon && <Icon size={17} aria-hidden="true" />}{children}</motion.button>;
}
