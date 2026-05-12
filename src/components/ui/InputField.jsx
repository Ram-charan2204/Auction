export default function InputField({

  className = "",

  ...props

}) {

  return (

    <input

      {...props}

      className={`

      w-full

      h-14

      px-5

      rounded-2xl

      bg-white/10

      border
      border-white/10

      outline-none

      text-white

      placeholder:text-slate-400

      focus:border-blue-400

      transition-all

      ${className}
    `}

    />

  );
}