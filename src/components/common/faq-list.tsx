import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface FaqListItem {
  value: string;
  question: string;
  answer: string;
}

interface FaqListProps {
  items: readonly FaqListItem[];
  className?: string;
}

export function FaqList({ items, className }: FaqListProps) {
  return (
    <Accordion className={cn(className)}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {item.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
