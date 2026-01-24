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
            <h2 className="text-xl font-serif font-medium mb-3">4. User-Generated Content (UGC) Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of content you create. By publishing content, 
              you grant us a non-exclusive, worldwide, royalty-free license to display, 
              distribute, and promote it within the service.
            </p>
            
            <h3 className="text-lg font-medium mt-6 mb-3">4.1 Prohibited Content</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">You may not publish content that:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Is illegal or promotes illegal activities</li>
              <li>Is sexually explicit, pornographic, or obscene</li>
              <li>Is violent, threatening, or promotes violence against others</li>
              <li>Is hateful, discriminatory, or promotes discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or nationality</li>
              <li>Harasses, bullies, or intimidates other users</li>
              <li>Contains false or misleading information</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains spam, unauthorized advertising, or solicitations</li>
              <li>Contains malware, viruses, or malicious code</li>
              <li>Violates the privacy of others</li>
            </ul>

            <h3 className="text-lg font-medium mt-6 mb-3">4.2 Content Moderation</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We reserve the right to review, edit, or remove any content at our sole discretion. 
              Users can report content they believe violates these guidelines through the in-app 
              reporting feature. We will review reported content and take appropriate action, which may include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Removal of the offending content</li>
              <li>Warning the user</li>
              <li>Temporary suspension of account</li>
              <li>Permanent ban from the service</li>
            </ul>

            <h3 className="text-lg font-medium mt-6 mb-3">4.3 Blocking Users</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can block other users to prevent them from interacting with you. 
              Blocked users will not be able to see your content or send you messages.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-3">4.4 Responsibility</h3>
            <p className="text-muted-foreground leading-relaxed">
              You are solely responsible for all content you post. We do not endorse user-generated 
              content and are not liable for any claims arising from content posted by users.
            </p>
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
