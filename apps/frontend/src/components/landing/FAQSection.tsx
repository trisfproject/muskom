'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQs = [
  {
    question: "Who can register as a participant?",
    answer: "Any active member of the organization is eligible to register as a participant. You will need to provide your organizational ID or relevant documentation during registration."
  },
  {
    question: "What is the difference between a Participant and a Candidate?",
    answer: "A Participant can attend, observe, and cast a vote during the Musyawarah. A Candidate is someone who is running for a leadership position and must submit their vision, mission, and work programs for review."
  },
  {
    question: "How do I know if my registration is approved?",
    answer: "You can check your registration status using the 'Check Status' portal on the top right by entering your Registration Code. You will also receive an email notification once your status changes."
  },
  {
    question: "Can I edit my registration after submitting?",
    answer: "No, once submitted, your registration is locked for review. If you made a mistake, please contact the administrative committee directly."
  },
  {
    question: "How is voting conducted?",
    answer: "Voting is conducted securely through this portal. Once the Voting phase begins, approved participants will be able to access their digital ballot using their registration credentials."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-600">Find answers to common questions about the Musyawarah process.</p>
        </div>

        <div className="space-y-4">
          {FAQs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={cn(
                  "border rounded-lg overflow-hidden transition-all duration-200",
                  isOpen ? "border-blue-200 bg-blue-50/30" : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <button
                  className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  <ChevronDown className={cn("h-5 w-5 text-slate-500 transition-transform duration-200", isOpen && "transform rotate-180")} />
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
