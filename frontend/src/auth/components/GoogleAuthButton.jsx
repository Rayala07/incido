export const GoogleAuthButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center justify-center w-full h-10',
        'bg-white dark:bg-[var(--bg-card)]',
        'border border-[var(--border-col)]',
        'rounded-none cursor-pointer',
        'text-[var(--text-primary)] font-mono text-[11px] uppercase tracking-widest font-medium',
        'transition-all duration-150',
        'hover:bg-black/[0.03] dark:hover:bg-white/[0.05]',
        'hover:border-accent',
        'focus:outline-2 focus:outline-accent focus:outline-offset-2',
        'active:translate-y-[1px]'
      ].join(' ')}
    >
      <div className="flex items-center justify-center w-full">
        {/* Absolute position the logo relative to the button center? 
            Or use gap? "Google G logo: 18px x 18px, left-aligned with 12px gap to text"
            We can just use a flex container with items-center justify-center. 
            To make it look perfectly centered as a block: */}
        <div className="flex items-center gap-[12px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </div>
      </div>
    </button>
  )
}
