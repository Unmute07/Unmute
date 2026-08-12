import { Card, CardContent } from "@/components/ui/card";

type TestimonialCardProps = {
  name: string;
  role: string;
  quote: string;
};

export function TestimonialCard({ name, role, quote }: TestimonialCardProps) {
  return (
    <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <p className="text-base leading-7 text-foreground">“{quote}”</p>
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
}
