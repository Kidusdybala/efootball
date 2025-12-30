import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

interface TeamGalleryProps {
  images: string[];
  onProceed?: () => void;
  showProceedButton?: boolean;
  title?: string;
}

export function TeamGallery({ images, onProceed, showProceedButton = true, title = "Gallery" }: TeamGalleryProps) {
  return (
    <div className="text-center mb-6">
      <h3 className="font-display text-xl font-bold text-foreground mb-4">{title}</h3>
      <Carousel className="mb-6">
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index}>
              <img
                src={img}
                alt={`Team ${index + 1}`}
                className="w-full h-48 object-contain rounded-lg"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      {showProceedButton && onProceed && (
        <Button onClick={onProceed} variant="glow" size="lg" className="w-full">
          Proceed to Purchase
        </Button>
      )}
    </div>
  );
}