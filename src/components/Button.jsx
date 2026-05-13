// src/components/Button.jsx
const Button = ({ children, onClick, variant = "primary" }) => {
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <button 
      onClick={onClick}
      className={`${styles[variant]} px-4 py-2 rounded-md font-medium transition-colors w-full`}
    >
      {children}
    </button>
  );
};

export default Button;