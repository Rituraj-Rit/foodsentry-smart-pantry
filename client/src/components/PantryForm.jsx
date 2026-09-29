import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const categories = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'Snacks', 'Spices', 'Beverages', 'Other'];
const units = ['kg', 'g', 'litre', 'ml', 'pieces', 'packets', 'bottles', 'cans'];
const blank = { name: '', category: 'Vegetables', quantity: '1', unit: 'pieces', purchaseDate: new Date().toISOString().slice(0, 10), expiryDate: '', notes: '' };

export default function PantryForm({ item, onClose, onSave, saving }) {
  const [values, setValues] = useState(blank);
  useEffect(() => {
    if (!item) return;
    setValues({ name: item.name, category: item.category, quantity: String(item.quantity), unit: item.unit, purchaseDate: new Date(item.purchaseDate).toISOString().slice(0, 10), expiryDate: new Date(item.expiryDate).toISOString().slice(0, 10), notes: item.notes || '' });
  }, [item]);
  function update(event) { setValues((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function submit(event) {
    event.preventDefault();
    onSave({ ...values, quantity: Number(values.quantity) });
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="pantry-modal-title">
    <div className="modal-heading"><div><span className="eyebrow">YOUR KITCHEN, IN SYNC</span><h2 id="pantry-modal-title">{item ? 'Edit ingredient' : 'Add to pantry'}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
    <form className="pantry-form" onSubmit={submit}>
      <label className="field field-wide">Ingredient name<input name="name" value={values.name} onChange={update} required maxLength="100" placeholder="e.g. Cherry tomatoes" autoFocus /></label>
      <label className="field">Category<select name="category" value={values.category} onChange={update}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <div className="field"><label htmlFor="quantity">Quantity</label><div className="quantity-row"><input id="quantity" name="quantity" type="number" min="0.01" step="any" value={values.quantity} onChange={update} required /><select aria-label="Unit" name="unit" value={values.unit} onChange={update}>{units.map((unit) => <option key={unit}>{unit}</option>)}</select></div></div>
      <label className="field">Purchase date<input name="purchaseDate" type="date" value={values.purchaseDate} onChange={update} /></label>
      <label className="field">Expiry date<input name="expiryDate" type="date" value={values.expiryDate} onChange={update} required /></label>
      <label className="field field-wide">Notes <span className="optional-label">Optional</span><textarea name="notes" value={values.notes} onChange={update} maxLength="500" rows="3" placeholder="Storage details, opened date, or anything useful" /></label>
      <div className="modal-actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving…' : item ? 'Save changes' : 'Add ingredient'}</Button></div>
    </form>
  </section></div>;
}
