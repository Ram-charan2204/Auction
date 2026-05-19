export default function Button({
  children,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      className={`
        px-6
        py-3
        rounded-2xl
        font-black
        uppercase
        tracking-wider
        italic
        text-white
        transition-all
        duration-300
        bg-gradient-to-b 
        from-orange-500 
        to-orange-700 
        hover:from-orange-400 
        hover:to-orange-600
        hover:scale-105
        active:scale-95
        shadow-lg
        shadow-orange-950/40
        border
        border-orange-500/10
        disabled:opacity-50
        disabled:pointer-events-none
        cursor-pointer
        ${className}
      `}
    >
      {children}
    </button>
  );
}