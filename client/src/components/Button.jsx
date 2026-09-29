export default function Button({ variant = 'primary', size = '', icon: Icon, children, className = '', type = 'button', ...props }) {
  return <button type={type} className={`button button-${variant}${size ? ` button-${size}` : ''} ${className}`.trim()} {...props}>{Icon && <Icon size={17} aria-hidden="true" />}{children}</button>;
}
