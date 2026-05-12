export default function Badge({

  children,

  className = ""

}) {

  return (

    <div

      className={`

      inline-flex
      items-center

      px-4
      py-1

      rounded-full

      text-sm
      font-semibold

      bg-blue-500

      ${className}
    `}

    >

      {children}

    </div>
  );
}