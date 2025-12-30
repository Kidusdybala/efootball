import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
}

interface ListingsGridProps {
  listings: Listing[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNew: () => void;
  onEdit: (item: Listing) => void;
  onDelete: (item: Listing) => void;
}

export function ListingsGrid({ listings, searchQuery, onSearchChange, onAddNew, onEdit, onDelete }: ListingsGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">Listings</h2>
        <Button variant="glow" onClick={onAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <div className="relative max-w-md">
        <Input
          placeholder="Search listings..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-muted border-border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {listings.map(item => (
          <div key={item._id} className="glass-card p-4">
            <div className="flex gap-4">
              <img
                src={item.images[0] || '/placeholder.svg'}
                alt={item.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <p className="font-bold text-primary mt-1">{item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(item)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(item)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}