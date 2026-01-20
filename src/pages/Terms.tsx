import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-serif font-medium mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using this service, you agree to these terms of service. 
              If you do not accept the terms, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">2. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              The service is a platform for sharing and discovering travel tips. 
              Users can create, share, and save travel tips as well as interact with other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">3. User Account</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must be at least 16 years old to use the service</li>
              <li>You are responsible for keeping your login credentials secure</li>
              <li>You are responsible for all activity on your account</li>
              <li>You must provide accurate information when registering</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">4. User Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of content you create. By publishing content, 
              you grant us a license to display and distribute it within the service.
            </p>
            <p className="text-muted-foreground leading-relaxed">You may not publish content that:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Violates laws or others' rights</li>
              <li>Is offensive, threatening, or discriminatory</li>
              <li>Contains misleading information</li>
              <li>Is spam or unauthorized advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">5. Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are expected to treat other users with respect. We reserve the right 
              to remove content or suspend accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The service's design, code, and trademarks belong to us. You may not copy, 
              modify, or distribute these without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The service is provided "as is". We do not guarantee that the service 
              will always be available or error-free. We are not liable for damages arising 
              from use of the service, to the extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">8. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can terminate your account at any time via profile settings. 
              We may also terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms. Significant changes will be announced 
              via email or in the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">10. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of Sweden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these terms, please contact us at{' '}
              <a href="mailto:support@tipit.app" className="text-primary hover:underline">
                support@tipit.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
