import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Roy Lo',
  description: 'Privacy policy for Roy Lo\'s portfolio website'
}

export default function PrivacyPage() {
  return (
    <section className='pb-24 pt-30'>
      <div className='container max-w-3xl'>
        <div className='prose prose-sm dark:prose-invert max-w-none'>
        <h1 className='text-4xl font-bold mb-8'>Privacy Policy</h1>
        
        <p className='text-muted-foreground mb-6'>
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Introduction</h2>
          <p>
            This Privacy Policy describes how Roy Lo (&ldquo;I&rdquo;, &ldquo;me&rdquo;, or &ldquo;my&rdquo;) collects, uses, and protects your information when you visit my portfolio website at roylo.fun (the &ldquo;Service&rdquo;).
          </p>
          <p>
            By using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Information Collection</h2>
          
          <h3 className='text-xl font-medium mb-3'>Personal Information</h3>
          <p className='mb-4'>
            When you use the contact form on this website, I may collect the following personal information:
          </p>
          <ul className='list-disc pl-6 mb-4'>
            <li>Name</li>
            <li>Email address</li>
            <li>Message content</li>
          </ul>

          <h3 className='text-xl font-medium mb-3'>Automatically Collected Information</h3>
          <p className='mb-4'>
            When you visit this website, certain information is automatically collected:
          </p>
          <ul className='list-disc pl-6 mb-4'>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on each page</li>
            <li>Referring website</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>How I Use Your Information</h2>
          <p className='mb-4'>I use the collected information for the following purposes:</p>
          <ul className='list-disc pl-6 mb-4'>
            <li>To respond to your contact form submissions</li>
            <li>To improve the website and user experience</li>
            <li>To analyze website traffic and usage patterns</li>
            <li>To ensure the security and functionality of the website</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Information Sharing</h2>
          <p>
            I do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
          </p>
          <ul className='list-disc pl-6 mb-4'>
            <li>When required by law or to comply with legal processes</li>
            <li>To protect my rights, property, or safety</li>
            <li>With trusted service providers who assist in operating the website (such as email service providers)</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Data Security</h2>
          <p>
            I implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Cookies and Tracking</h2>
          <p className='mb-4'>
            This website may use cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser preferences.
          </p>
          <p>
            The website may also use analytics services that collect anonymous usage data to help improve the site.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Third-Party Services</h2>
          <p className='mb-4'>
            This website may use third-party services for:
          </p>
          <ul className='list-disc pl-6 mb-4'>
            <li>Email delivery (Resend)</li>
            <li>Website analytics</li>
            <li>Hosting and infrastructure</li>
          </ul>
          <p>
            These services have their own privacy policies, and I encourage you to review them.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Your Rights</h2>
          <p className='mb-4'>You have the right to:</p>
          <ul className='list-disc pl-6 mb-4'>
            <li>Access the personal information I hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Withdraw consent for data processing</li>
            <li>Object to the processing of your personal information</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Data Retention</h2>
          <p>
            I retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Children&apos;s Privacy</h2>
          <p>
            This website is not intended for children under 13 years of age. I do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Changes to This Privacy Policy</h2>
          <p>
            I may update this Privacy Policy from time to time. I will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Contact Information</h2>
          <p className='mb-4'>
            If you have any questions about this Privacy Policy or my data practices, please contact me:
          </p>
          <ul className='list-none pl-0 mb-4'>
            <li>Email: joeblack1986@gmail.com</li>
            <li>Website: roylo.fun</li>
          </ul>
        </section>

        <div className='mt-12 pt-8 border-t border-border'>
          <p className='text-sm text-muted-foreground'>
            This privacy policy is effective as of the date listed above and applies to all information collected through this website.
          </p>
        </div>
      </div>
    </div>
  </section>
  )
} 