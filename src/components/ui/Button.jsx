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

      font-semibold

      transition-all
      duration-300

      bg-blue-500

      hover:bg-blue-600

      hover:scale-105

      active:scale-95

      shadow-lg

      ${className}
    `}

    >

      {children}

    </button>
  );
}