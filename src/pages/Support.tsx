import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, HelpCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { APP_NAME } from '@/lib/constants';

const faqs = [
  {
    question: 'How do I create a new tip?',
    answer: 'Navigate to the Map view and click the "+" button. You can then add a title, description, category, and location for your tip. You can also add photos to make your tip more helpful.',
  },
  {
    question: 'How do I add friends?',
    answer: 'Go to the Friends section and use the search function to find other users by their username. Send them a friend request and once they accept, you\'ll be connected!',
  },
  {
    question: 'Can I edit or delete my tips?',
    answer: 'Yes! Click on any tip you\'ve created to open the detail view. You\'ll see edit and delete options available for your own tips.',
  },
  {
    question: 'How do I report inappropriate content?',
    answer: 'On any tip or in a chat, you can use the report function (flag icon) to report content that violates our community guidelines. Our moderation team will review the report.',
  },
  {
    question: 'How do I change my privacy settings?',
    answer: 'Visit your Profile page and look for the privacy settings. You can choose to make your profile visible to everyone, friends only, or keep it private.',
  },
  {
    question: 'How do I delete my account?',
    answer: 'You can delete your account from the Profile page under Settings. Please note that this action is permanent and will remove all your data.',
  },
];

export default function Support() {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.username || '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('support_requests').insert({
        user_id: user?.id || null,
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Your message has been sent!');
    } catch (error) {
      console.error('Failed to submit support request:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">{APP_NAME} Support</h1>
            <p className="text-muted-foreground">
              We're here to help! Check our FAQ or send us a message.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Form */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Send className="w-5 h-5" />
              Contact Us
            </h2>

            {submitted ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-lg font-medium">Message Sent!</h3>
                <p className="text-muted-foreground">
                  Thank you for reaching out. We'll review your message and get back to you as soon as possible.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: profile?.username || '', email: '', subject: '', message: '' });
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="For follow-up (optional)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="What can we help you with?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              By contacting support, you agree to our{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
