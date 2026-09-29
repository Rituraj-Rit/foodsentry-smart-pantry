import { motion } from 'motion/react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return <motion.div className="empty-state" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}><span className="empty-icon"><PackageOpen size={24} /></span><h3>{title}</h3>{description && <p>{description}</p>}{action}</motion.div>;
}
