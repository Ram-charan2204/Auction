export default function Card({
  children,
  className = ""
}) {
  return (
    <div
      className={`
        bg-zinc-900/60
        border
        border-orange-500/10
        backdrop-blur-xl
        rounded-3xl
        shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        transition-all
        duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}