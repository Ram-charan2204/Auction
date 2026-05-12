export default function GlassCard({

  children,

  className = ""

}) {

  return (

    <div

      className={`

      bg-white/10

      backdrop-blur-2xl

      border
      border-white/10

      rounded-[32px]

      shadow-2xl

      ${className}
    `}

    >

      {children}

    </div>
  );
}