import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  type: 'coin' | 'account';
  item?: any;
}

export function AddListingModal({ isOpen, onClose, onAdd, type, item }: AddListingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    images: [] as File[],
    amount: '',
    level: '',
    rating: '',
    coins: '',
    players: '',
    discount: false,
    discountPercentage: '',
    discountDays: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        images: [],
        amount: item.amount?.toString() || '',
        level: item.level?.toString() || '',
        rating: item.rating?.toString() || '',
        coins: item.coins?.toString() || '',
        players: item.players?.toString() || '',
        discount: item.discount || false,
        discountPercentage: item.discountPercentage?.toString() || '',
        discountDays: item.discountDays?.toString() || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        images: [],
        amount: '',
        level: '',
        rating: '',
        coins: '',
        players: '',
        discount: false,
        discountPercentage: '',
        discountDays: '',
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('type', type);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('discount', formData.discount.toString());
    if (formData.discount) {
      formDataToSend.append('discountPercentage', formData.discountPercentage);
      formDataToSend.append('discountDays', formData.discountDays);
    }
    if (type === 'coin') {
      formDataToSend.append('amount', formData.amount);
    } else {
      formDataToSend.append('level', formData.level);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('coins', formData.coins);
      formDataToSend.append('players', formData.players);
    }

    // Append existing images as JSON if editing
    if (item && item.images) {
      formDataToSend.append('images', JSON.stringify(item.images));
    }

    // Append new images
    formData.images.forEach((file, index) => {
      formDataToSend.append('images', file);
    });

    onAdd(formDataToSend);
    onClose();
    setFormData({
      title: '',
      description: '',
      price: '',
      images: [],
      amount: '',
      level: '',
      rating: '',
      coins: '',
      players: '',
      discount: false,
      discountPercentage: '',
      discountDays: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background p-4 rounded-lg w-full max-w-sm max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold">{item ? 'Edit' : 'Add New'} {type === 'coin' ? 'Coin Package' : 'Account'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title" className="text-sm">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="h-8"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price" className="text-sm">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="h-8"
              />
            </div>
            {type === 'coin' && (
              <div>
                <Label htmlFor="amount" className="text-sm">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="h-8"
                />
              </div>
            )}
          </div>
          {type === 'account' && (
            <div>
              <Label htmlFor="images" className="text-sm">Images (first will be main)</Label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData({ ...formData, images: files });
                }}
                required={!item}
                className="mt-1 text-xs w-full"
              />
              {formData.images.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {formData.images.length} image(s)
                </p>
              )}
            </div>
          )}

          {type === 'coin' && (
            <>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Add Discount</span>
                </label>
              </div>
              {formData.discount && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="discountPercentage" className="text-sm">Discount %</Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                      required
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountDays" className="text-sm">Days Left</Label>
                    <Input
                      id="discountDays"
                      type="number"
                      min="1"
                      value={formData.discountDays}
                      onChange={(e) => setFormData({ ...formData, discountDays: e.target.value })}
                      required
                      className="h-8"
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {type === 'account' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="level" className="text-sm">Level</Label>
                  <Input
                    id="level"
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="rating" className="text-sm">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    required
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="coins" className="text-sm">Coins</Label>
                  <Input
                    id="coins"
                    type="number"
                    value={formData.coins}
                    onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
                    required
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="players" className="text-sm">Players</Label>
                  <Input
                    id="players"
                    type="number"
                    value={formData.players}
                    onChange={(e) => setFormData({ ...formData, players: e.target.value })}
                    required
                    className="h-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="images" className="text-sm">Image</Label>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, images: [file] });
                    }
                  }}
                  required
                  className="mt-1 text-xs w-full"
                />
                {formData.images.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {formData.images[0].name}
                  </p>
                )}
              </div>
            </>
          )}
          <div className="flex gap-2 pt-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-8 text-sm">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-8 text-sm">
              {item ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}