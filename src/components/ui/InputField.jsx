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
        bg-zinc-950
        border
        border-zinc-800
        outline-none
        text-white
        placeholder:text-zinc-500
        font-medium
        text-sm
        focus:border-orange-500
        focus:ring-2
        focus:ring-orange-500/10
        transition-all
        duration-300
        ${className}
      `}
    />
  );
}