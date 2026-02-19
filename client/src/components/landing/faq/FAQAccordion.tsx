import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQS } from "@/lib/constants/landing";

interface FAQAccordionProps {
  openFaq: number | null;
  setOpenFaq: (index: number | null) => void;
}

export function FAQAccordion({ openFaq, setOpenFaq }: FAQAccordionProps) {
  return (
    <section
      style={{ 
        backgroundColor: "var(--c-bacSec)", 
        borderTop: "1px solid var(--c-borPri)", 
        borderBottom: "1px solid var(--c-borPri)" 
      }}
      className="py-24"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center mb-14">
          <h2
            style={{ color: "var(--c-texPri)" }}
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          >
            Frequently asked questions
          </h2>
          <p style={{ color: "var(--c-texSec)" }} className="text-base">
            Everything you need to know. Can't find an answer?{" "}
            <Button variant="link" className="p-0 h-auto" style={{ color: "var(--c-bluTexAccPri)" }}>
              Chat with us.
            </Button>
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`}
                style={{ borderColor: "var(--c-borPri)" }}
              >
                <AccordionTrigger 
                  style={{ color: "var(--c-texPri)" }}
                  className="text-sm font-semibold hover:no-underline py-4"
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent style={{ color: "var(--c-texSec)" }} className="text-sm">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}