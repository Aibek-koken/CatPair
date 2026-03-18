const variants = {
  primary: 'bg-accent text-white hover:bg-[#0b6665] shadow-soft',
  secondary: 'bg-accent2 text-white hover:bg-[#e3574c] shadow-soft',
  outline: 'border border-accent text-accent hover:bg-accent/10',
  ghost: 'text-ink hover:bg-black/5',
};

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
