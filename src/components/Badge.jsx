// src/components/Badge.jsx
const Badge = ({ children }) => {
  return (
    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
      {children}
    </span>
  );
};

export default Badge;