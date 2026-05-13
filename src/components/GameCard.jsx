// src/components/GameCard.jsx
import Button from './Button';
import Badge from './Badge';

const GameCard = ({ game, onAdd }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow">
      <img 
        src={game.image} 
        alt={game.name} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{game.name}</h3>
          <Badge>{game.category}</Badge>
        </div>
        
        <p className="text-2xl font-black text-indigo-600 mb-4">
          {game.price} €
        </p>

        <Button onClick={() => onAdd(game)}>
          Ajouter au panier
        </Button>
      </div>
    </div>
  );
};

export default GameCard;