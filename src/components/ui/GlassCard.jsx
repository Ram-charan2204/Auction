export default function GlassCard({
  children,
  className = ""
}) {
  return (
    <div
      className={`
        bg-zinc-950/40
        backdrop-blur-2xl
        border
        border-orange-500/10
        rounded-[32px]
        shadow-[0_25px_60px_rgba(0,0,0,0.6)]
        transition-all
        duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}