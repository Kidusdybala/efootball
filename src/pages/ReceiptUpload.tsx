import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload } from 'lucide-react';

export default function ReceiptUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a receipt image to upload.",
        variant: "destructive",
      });
      return;
    }

    // Mock upload
    toast({
      title: "Receipt Uploaded",
      description: "Your payment receipt has been submitted for verification.",
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground">Upload Receipt</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto glass-card p-6">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
            Upload Payment Receipt
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="receipt" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Receipt Image
              </Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-muted border-border"
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <Button type="submit" variant="glow" size="lg" className="w-full">
              Submit Receipt
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Please upload a clear image of your payment receipt. We will verify it and process your order.
          </p>
        </div>
      </div>
    </div>
  );
}