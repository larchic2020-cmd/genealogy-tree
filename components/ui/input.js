export function Input({ value, onChange, placeholder = "" }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
  );
}