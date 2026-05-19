export default function Badge({
  children,
  className = ""
}) {
  return (
    <div
      className={`
        inline-flex
        items-center
        justify-center
        px-4
        py-1
        rounded-full
        text-sm
        font-black
        uppercase
        tracking-wider
        italic
        bg-orange-600
        text-white
        border
        border-orange-500/20
        shadow-sm
        shadow-orange-950/40
        transition-all
        duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}