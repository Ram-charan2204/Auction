export default function Card({

  children,

  className = ""

}) {

  return (

    <div

      className={`

      bg-white/10

      border
      border-white/10

      backdrop-blur-xl

      rounded-3xl

      shadow-2xl

      ${className}
    `}

    >

      {children}

    </div>
  );
}