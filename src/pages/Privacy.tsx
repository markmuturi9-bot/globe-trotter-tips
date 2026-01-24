import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-serif font-medium mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              We value your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and protect your information 
              in accordance with the EU General Data Protection Regulation (GDPR) and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">2. Data Controller</h2>
            <p className="text-muted-foreground leading-relaxed">
              The data controller for the processing of your personal data is the service owner. 
              You can contact us via email for questions about data protection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">3. What Data We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Account information:</strong> Email address, username</li>
              <li><strong>Content you create:</strong> Travel tips, locations, images you upload</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information</li>
              <li><strong>Usage data:</strong> How you interact with the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">4. Legal Basis for Processing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We process your personal data based on:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Contract:</strong> To provide the service you registered for</li>
              <li><strong>Consent:</strong> When you accept cookies or certain data processing</li>
              <li><strong>Legitimate interest:</strong> To improve and secure the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">5. How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and improve the service</li>
              <li>Manage your user account</li>
              <li>Enable social features (friends, sharing)</li>
              <li>Send important messages about the service</li>
              <li>Analyze usage to improve the experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">6. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We never sell your personal data. We may share data with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>Service providers:</strong> Who help us run the service (cloud hosting, authentication, map services)</li>
              <li><strong>Map services:</strong> We use Mapbox for map functionality. When you use the map, your approximate location may be shared to display relevant content</li>
              <li><strong>Legal requirements:</strong> If required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">7. User-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Content you create (tips, images, messages) is stored on our servers and may be visible to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Public content:</strong> Travel tips are publicly visible to all users</li>
              <li><strong>Private messages:</strong> Only visible to you and the recipient</li>
              <li><strong>Profile information:</strong> Visibility depends on your privacy settings</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We implement moderation features to ensure community safety. Users can report 
              inappropriate content and block other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">8. Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored on secure servers within the EU/EEA. We use encryption and 
              other technical measures to protect your data, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>HTTPS encryption for all data in transit</li>
              <li>Encrypted storage for sensitive data at rest</li>
              <li>Row-level security policies to ensure data isolation</li>
              <li>Regular security audits and updates</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We retain your data as long as you have an account with us or as required by law.
              When you delete your account, your data is permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">9. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> You can request a copy of your data</li>
              <li><strong>Correction:</strong> You can correct inaccurate data via your profile</li>
              <li><strong>Deletion:</strong> You can delete your account and all associated data via profile settings</li>
              <li><strong>Restriction:</strong> You can limit how we use your data</li>
              <li><strong>Data portability:</strong> You can export your data as JSON via profile settings</li>
              <li><strong>Objection:</strong> You can object to certain processing by contacting us</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>How to exercise your rights:</strong> Go to Profile → Settings to access data export, 
              privacy controls, and account deletion. For other requests, contact us via the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">10. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies for the service to function correctly. See our cookie banner 
              for more information and to manage your preferences. Necessary cookies 
              are required for authentication and cannot be turned off.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">11. Changes to Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy when needed. For significant changes, we will notify 
              you via email or in the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">12. Complaints</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are dissatisfied with how we handle your personal data, you have the right to 
              file a complaint with a data protection authority. In Sweden, this is 
              Integritetsskyddsmyndigheten (IMY).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about this privacy policy or how we process your data, 
              contact us at{' '}
              <a href="mailto:privacy@tipit.app" className="text-primary hover:underline">
                privacy@tipit.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
