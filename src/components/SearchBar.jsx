// src/components/SearchBar.jsx
const SearchBar = ({ value, onChange }) => {
  return (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Rechercher un jeu (ex: Elden Ring...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none transition-all shadow-sm"
      />
    </div>
  );
};

export default SearchBar;