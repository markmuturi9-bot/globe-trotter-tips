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
              <li><strong>Service providers:</strong> Who help us run the service (hosting, authentication)</li>
              <li><strong>Legal requirements:</strong> If required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">7. Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored on secure servers within the EU/EEA. We use encryption and 
              other technical measures to protect your data. We retain your data 
              as long as you have an account with us or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> You can request a copy of your data</li>
              <li><strong>Correction:</strong> You can correct inaccurate data</li>
              <li><strong>Deletion:</strong> You can request that we delete your data</li>
              <li><strong>Restriction:</strong> You can limit how we use your data</li>
              <li><strong>Data portability:</strong> You can export your data</li>
              <li><strong>Objection:</strong> You can object to certain processing</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can exercise these rights via your profile settings or by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">9. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies for the service to function correctly. See our cookie banner 
              for more information and to manage your preferences. Necessary cookies 
              are required for authentication and cannot be turned off.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">10. Changes to Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy when needed. For significant changes, we will notify 
              you via email or in the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">11. Complaints</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are dissatisfied with how we handle your personal data, you have the right to 
              file a complaint with a data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">12. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about this privacy policy or how we process your data, 
              contact us via the service's contact function.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
