// src/components/CartItem.jsx
import Button from './Button';

const CartItem = ({ item, onRemove }) => {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
      <div>
        <h4 className="font-bold text-sm">{item.name}</h4>
        <p className="text-indigo-600 font-bold">{item.price} €</p>
      </div>
      <div className="w-24">
        <Button variant="danger" onClick={() => onRemove(item.id)}>
          Retirer
        </Button>
      </div>
    </div>
  );
};

export default CartItem;