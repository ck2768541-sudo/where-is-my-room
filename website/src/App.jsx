import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";
import stayrentLogo from "./assets/stayrent-logo.jpeg";

const SUPPORT_EMAIL =
  "stayrentofficial@gmail.com";

const SUPPORT_PHONE =
  "+916202969445";

const EFFECTIVE_DATE =
  "7 September 2026";

function Layout({ children }) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="nav-container">
          <NavLink
            to="/"
            className="brand"
          >
        <img
  src={stayrentLogo}
  alt="StayRent"
  className="brand-logo"
/>

            <span className="brand-name">
              StayRent
            </span>
          </NavLink>

          <nav className="main-nav">
            <NavLink to="/">
              Home
            </NavLink>

            <NavLink to="/about">
              About
            </NavLink>

            <NavLink to="/contact">
              Contact
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="site-main">
        {children}
      </main>

      <footer className="site-footer">
        <div className="footer-container">
          <div>
            <h3>StayRent</h3>

            <p>
              Find rooms, PGs, flats,
              hotels and rental properties
              more easily.
            </p>
          </div>

          <div className="footer-links">
            <NavLink to="/privacy-policy">
              Privacy Policy
            </NavLink>

            <NavLink to="/terms-of-use">
              Terms of Use
            </NavLink>

            <NavLink to="/account-deletion">
              Account Deletion
            </NavLink>

            <NavLink to="/contact">
              Contact Us
            </NavLink>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} StayRent.
          All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function HomePage() {
  return (
    <Layout>
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            Rental discovery made simple
          </div>

          <h1>
            Find your next place with
            <span> StayRent</span>
          </h1>

          <p>
            Discover rooms, PGs, flats,
            hotels and other supported
            rental properties from property
            owners on StayRent.
          </p>

          <div className="hero-actions">
            <a
              href="#how-it-works"
              className="primary-button"
            >
              Explore StayRent
            </a>

            <NavLink
              to="/about"
              className="secondary-button"
            >
              Learn More
            </NavLink>
          </div>
        </div>
      </section>

      <section
        className="content-section"
        id="how-it-works"
      >
        <div className="section-heading">
          <span>HOW IT WORKS</span>

          <h2>
            Simple for seekers and owners
          </h2>

          <p>
            StayRent helps property seekers
            discover listings while giving
            property owners a simple way to
            showcase available places.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-number">
              01
            </div>

            <h3>Search Properties</h3>

            <p>
              Browse available rental
              properties and find options
              matching your needs.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-number">
              02
            </div>

            <h3>View Details</h3>

            <p>
              Check property information,
              photos, location and owner
              contact details.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-number">
              03
            </div>

            <h3>Connect Directly</h3>

            <p>
              Contact the property owner and
              continue your rental discussion.
            </p>
          </article>
        </div>
      </section>

      <section className="trust-section">
        <div>
          <span>STAYRENT</span>

          <h2>
            Built to make rental discovery
            easier
          </h2>

          <p>
            StayRent is a property discovery
            platform. Users should independently
            verify property details, ownership,
            pricing, identity and rental
            agreements before making any
            payment or commitment.
          </p>
        </div>
      </section>
    </Layout>
  );
}

function AboutPage() {
  return (
    <Layout>
      <PageContainer
        eyebrow="ABOUT STAYRENT"
        title="Helping people discover rental properties"
      >
        <p>
          StayRent is a rental property
          discovery platform designed to
          connect people looking for a place
          to stay with property owners who
          want to list available properties.
        </p>

        <p>
          The platform may include rooms,
          PGs, flats, hotels and other
          supported accommodation types.
        </p>

        <p>
          StayRent focuses on making property
          discovery, listing information and
          owner-seeker communication simple.
        </p>

        <p>
          StayRent does not itself own the
          properties displayed on the
          platform unless explicitly stated.
        </p>
      </PageContainer>
    </Layout>
  );
}

function PrivacyPolicyPage() {
  return (
    <Layout>
      <PageContainer
        eyebrow="LEGAL"
        title="Privacy Policy"
      >
        <p>
          <strong>
            Effective date:
          </strong>{" "}
          {EFFECTIVE_DATE}
        </p>

        <p>
          This Privacy Policy explains how
          StayRent collects, uses, stores and
          protects information when you use
          the StayRent website, mobile
          application and related services.
        </p>

        <h2>
          1. Information we collect
        </h2>

        <p>
          We may collect information that you
          provide directly to us, including
          your name, email address, phone
          number, account type, profile photo,
          property listing information,
          property images, support messages
          and other information you submit
          through StayRent.
        </p>

        <p>
          If you use location-based features,
          StayRent may process location
          information when you choose to
          provide location permission or
          location details.
        </p>

        <p>
          We may also receive technical
          information such as device,
          browser, IP address, request logs
          and service-usage information from
          our hosting, security and
          infrastructure providers.
        </p>

        <h2>
          2. Passwords and authentication
        </h2>

        <p>
          Passwords are not intended to be
          stored in readable plain text.
          Authentication credentials are
          processed using security measures
          such as password hashing and
          authentication tokens.
        </p>

        <p>
          Password-reset verification codes
          are temporary and are used only to
          help verify password-reset requests.
        </p>

        <h2>
          3. How we use information
        </h2>

        <p>
          We may use information to create
          and manage accounts, provide
          property discovery features,
          display property listings, enable
          communication and support, improve
          StayRent, prevent abuse, protect
          users, maintain security and comply
          with legal obligations.
        </p>

        <h2>
          4. Property listings
        </h2>

        <p>
          Information submitted by property
          owners for a listing may be shown
          to StayRent users. This may include
          property photos, location details,
          rental information and contact
          information required for users to
          connect with the property owner.
        </p>

        <p>
          Owners should not upload
          unnecessary sensitive personal
          information in public property
          listings.
        </p>

        <h2>
          5. Service providers
        </h2>

        <p>
          StayRent may use third-party
          infrastructure and service
          providers for functions such as
          database hosting, application
          hosting, image storage, deployment,
          email delivery and security.
        </p>

        <p>
          These providers may process
          information only as necessary to
          provide their services to StayRent
          and subject to their applicable
          terms and privacy practices.
        </p>

        <h2>
          6. Sharing of information
        </h2>

        <p>
          StayRent does not sell users'
          personal information to
          advertisers.
        </p>

        <p>
          Information may be shared with
          service providers, when required by
          law, to protect StayRent or its
          users, to investigate fraud or
          misuse, or when necessary to
          operate a feature requested by the
          user.
        </p>

        <h2>
          7. Data security
        </h2>

        <p>
          StayRent uses reasonable technical
          and organizational measures to
          protect information, including
          authentication controls, access
          restrictions and encrypted
          connections where supported.
        </p>

        <p>
          No internet-based service can
          guarantee absolute security.
          Users should protect their login
          credentials and immediately report
          suspected unauthorized access.
        </p>

        <h2>
          8. Data retention
        </h2>

        <p>
          We retain information for as long
          as reasonably necessary to provide
          StayRent, maintain security,
          resolve disputes, comply with legal
          requirements and enforce our
          agreements.
        </p>

        <p>
          Some information may remain in
          backups or records for a limited
          period even after an account
          deletion request is processed.
        </p>

        <h2>
          9. Your choices and rights
        </h2>

        <p>
          Subject to applicable law, users
          may request access, correction or
          deletion of eligible personal
          information associated with their
          StayRent account.
        </p>

        <p>
          Account deletion instructions are
          available on the{" "}
          <NavLink to="/account-deletion">
            Account Deletion
          </NavLink>{" "}
          page.
        </p>

        <h2>
          10. Children's privacy
        </h2>

        <p>
          StayRent is not intended to
          knowingly collect personal
          information from children who are
          not legally permitted to use the
          service independently. Where
          required, a parent or legal
          guardian should be involved.
        </p>

        <h2>
          11. Changes to this policy
        </h2>

        <p>
          We may update this Privacy Policy
          when StayRent changes or when legal
          or operational requirements change.
          The updated effective date will be
          shown on this page.
        </p>

        <h2>
          12. Contact us
        </h2>

        <p>
          For privacy, data or account
          questions, contact:
        </p>

        <p>
          Email:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
        </p>

        <p>
          Phone:{" "}
          <a
            href={`tel:${SUPPORT_PHONE}`}
          >
            {SUPPORT_PHONE}
          </a>
        </p>
      </PageContainer>
    </Layout>
  );
}

function TermsOfUsePage() {
  return (
    <Layout>
      <PageContainer
        eyebrow="LEGAL"
        title="Terms of Use"
      >
        <p>
          <strong>
            Effective date:
          </strong>{" "}
          {EFFECTIVE_DATE}
        </p>

        <p>
          These Terms of Use govern your
          access to and use of StayRent,
          including its website, mobile
          application and related services.
        </p>

        <p>
          By creating an account or using
          StayRent, you agree to these Terms
          of Use.
        </p>

        <h2>
          1. StayRent's role
        </h2>

        <p>
          StayRent is a property discovery
          and listing platform that helps
          seekers connect with property
          owners.
        </p>

        <p>
          Unless explicitly stated,
          StayRent does not own, manage or
          control properties listed by users
          and is not automatically a party to
          a rental, tenancy, booking or other
          agreement between users.
        </p>

        <h2>
          2. User accounts
        </h2>

        <p>
          Users must provide accurate account
          information and keep login
          credentials confidential.
        </p>

        <p>
          You are responsible for activity
          performed through your account
          unless unauthorized use has been
          reported to StayRent.
        </p>

        <h2>
          3. Property owner responsibilities
        </h2>

        <p>
          Property owners must have the
          authority to publish the property
          listing and must provide accurate,
          lawful and non-misleading
          information.
        </p>

        <p>
          Owners must not upload fake
          listings, misleading prices,
          unauthorized photographs,
          fraudulent contact information or
          content that violates applicable
          law or another person's rights.
        </p>

        <h2>
          4. Property seeker responsibilities
        </h2>

        <p>
          Seekers are responsible for
          independently verifying the
          property, owner identity, rent,
          deposit, availability, documents,
          location and agreement terms before
          making a payment or commitment.
        </p>

        <h2>
          5. Payments and agreements
        </h2>

        <p>
          Unless StayRent specifically
          introduces and clearly identifies a
          payment or booking service,
          payments and rental agreements
          arranged directly between users are
          outside StayRent's control.
        </p>

        <p>
          Users should avoid sending money
          before reasonably verifying the
          property and the person requesting
          payment.
        </p>

        <h2>
          6. Prohibited use
        </h2>

        <p>
          You must not use StayRent for
          fraud, impersonation, harassment,
          illegal activity, unauthorized
          access, spam, malicious software,
          fake listings, manipulation of the
          platform or infringement of another
          person's rights.
        </p>

        <h2>
          7. Content submitted by users
        </h2>

        <p>
          Users remain responsible for the
          content they submit to StayRent.
        </p>

        <p>
          By uploading listing information
          or images, you confirm that you
          have the necessary rights to use
          that content and allow StayRent to
          display and process it for the
          operation of the platform.
        </p>

        <h2>
          8. Listing moderation
        </h2>

        <p>
          StayRent may review, restrict,
          deactivate or remove accounts or
          listings that appear fraudulent,
          unlawful, misleading, unsafe or in
          violation of these Terms.
        </p>

        <h2>
          9. No guarantee of listings
        </h2>

        <p>
          StayRent does not guarantee that
          every listing, owner, seeker,
          price, location, photograph,
          availability statement or property
          description is accurate.
        </p>

        <p>
          Users should perform appropriate
          verification before relying on
          information provided by another
          user.
        </p>

        <h2>
          10. Availability of StayRent
        </h2>

        <p>
          We may modify, suspend or
          discontinue features for
          maintenance, security, technical,
          legal or business reasons.
        </p>

        <h2>
          11. Limitation of responsibility
        </h2>

        <p>
          To the extent permitted by
          applicable law, StayRent is not
          responsible for losses arising
          solely from agreements, payments,
          disputes, misrepresentations or
          conduct between users that occur
          outside StayRent's direct control.
        </p>

        <h2>
          12. Account suspension
        </h2>

        <p>
          StayRent may suspend or deactivate
          access when reasonably necessary
          for security, suspected fraud,
          violations of these Terms or legal
          compliance.
        </p>

        <h2>
          13. Privacy
        </h2>

        <p>
          Use of personal information is
          described in our{" "}
          <NavLink to="/privacy-policy">
            Privacy Policy
          </NavLink>
          .
        </p>

        <h2>
          14. Changes to these terms
        </h2>

        <p>
          StayRent may update these Terms as
          the platform changes. Continued use
          after updated Terms become
          effective may constitute acceptance
          where permitted by law.
        </p>

        <h2>
          15. Applicable law
        </h2>

        <p>
          These Terms are intended to operate
          subject to applicable laws of
          India. Any mandatory rights
          available to users under applicable
          law are not excluded by these
          Terms.
        </p>

        <h2>
          16. Contact
        </h2>

        <p>
          Questions about these Terms can be
          sent to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </PageContainer>
    </Layout>
  );
}

function ContactPage() {
  return (
    <Layout>
      <PageContainer
        eyebrow="SUPPORT"
        title="Contact StayRent"
      >
        <p>
          For account, property, technical,
          privacy or general support, contact
          StayRent using the details below.
        </p>

        <div className="contact-card">
          <div>
            <span>Email</span>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div>
            <span>Phone</span>

            <a
              href={`tel:${SUPPORT_PHONE}`}
            >
              {SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </PageContainer>
    </Layout>
  );
}

function AccountDeletionPage() {
  return (
    <Layout>
      <PageContainer
        eyebrow="ACCOUNT & DATA"
        title="Account Deletion"
      >
        <p>
          StayRent users may request deletion
          of their account and eligible
          personal data.
        </p>

        <h2>
          How to request deletion
        </h2>

        <p>
          Send an email from your registered
          email address to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          with the subject:
        </p>

        <div className="request-example">
          StayRent Account Deletion Request
        </div>

        <p>
          Include your registered email
          address and, if available, your
          registered phone number so we can
          verify the account.
        </p>

        <h2>
          Verification
        </h2>

        <p>
          StayRent may request reasonable
          verification before processing a
          deletion request to prevent
          unauthorized deletion of another
          person's account.
        </p>

        <h2>
          What may be deleted
        </h2>

        <p>
          Eligible account information,
          profile information and other
          personal information associated
          with the account may be deleted or
          anonymized as appropriate.
        </p>

        <h2>
          Information that may be retained
        </h2>

        <p>
          Certain information may be retained
          where reasonably necessary for
          legal obligations, fraud
          prevention, security, dispute
          resolution, backups or legitimate
          record-keeping requirements.
        </p>

        <h2>
          Need help?
        </h2>

        <p>
          Contact{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          if you have questions about
          account or data deletion.
        </p>
      </PageContainer>
    </Layout>
  );
}

function NotFoundPage() {
  return (
    <Layout>
      <PageContainer
        eyebrow="404"
        title="Page not found"
      >
        <p>
          The page you are looking for does
          not exist.
        </p>

        <NavLink
          to="/"
          className="primary-button inline-button"
        >
          Go to Home
        </NavLink>
      </PageContainer>
    </Layout>
  );
}

function PageContainer({
  eyebrow,
  title,
  children,
}) {
  return (
    <section className="page-section">
      <div className="page-container">
        <span className="page-eyebrow">
          {eyebrow}
        </span>

        <h1>{title}</h1>

        <div className="page-content">
          {children}
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/about"
          element={<AboutPage />}
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicyPage />}
        />

        <Route
          path="/terms-of-use"
          element={<TermsOfUsePage />}
        />

        <Route
          path="/contact"
          element={<ContactPage />}
        />

        <Route
          path="/account-deletion"
          element={<AccountDeletionPage />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;