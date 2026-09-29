import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { expiryLabel } from '../utils/expiry';
import StatusBadge from './StatusBadge';

export default function PantryItemCard({ item, onEdit, onDelete, interactive = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <article className={`pantry-card${item.expiryStatus === 'EXPIRED' ? ' pantry-card-expired' : ''}`}>
    <div className="pantry-card-top"><span className="food-initial">{item.name.slice(0, 1).toUpperCase()}</span><div className="pantry-card-title"><h3>{item.name}</h3><span>{item.category}</span></div>{interactive && (onEdit || onDelete) && <div className="item-menu-wrap"><button className="icon-button" aria-label={`Actions for ${item.name}`} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={19} /></button>{menuOpen && <div className="item-menu">{onEdit && <button onClick={() => { setMenuOpen(false); onEdit(item); }}><Pencil size={14} /> Edit</button>}{onDelete && <button onClick={() => { setMenuOpen(false); onDelete(item); }}><Trash2 size={14} /> Delete</button>}</div>}</div>}</div>
    <div className="pantry-card-bottom"><span>{item.quantity} {item.unit}</span><span className="item-expiry"><CalendarDays size={14} />{expiryLabel(item.expiryDate)}</span></div>
    <StatusBadge status={item.expiryStatus} />
    {item.expiryStatus === 'EXPIRED' && <p className="safety-note">Expired — do not use.</p>}
  </article>;
}
