interface Props {
  label?: string;
  className?: string;
}

export function ImagePlaceholder({ label, className }: Props) {
  return (
    <div className={className ? `imgph ${className}` : 'imgph'} role="img" aria-label={label ?? 'photo placeholder'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2"></rect>
        <circle cx="9" cy="10" r="2"></circle>
        <path d="M21 16l-5.5-5.5a2 2 0 0 0-2.8 0L4 19"></path>
      </svg>
    </div>
  );
}
