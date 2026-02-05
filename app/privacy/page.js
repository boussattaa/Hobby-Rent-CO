'use client';

export default function PrivacyPage() {
    return (
        <div className="container" style={{ padding: '8rem 2rem 4rem' }}>
            <h1>Privacy Policy</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Last Revised: {new Date().toLocaleDateString()}</p>

            <div className="content" style={{ maxWidth: '800px', lineHeight: '1.6' }}>
                <p>At HobbyRent, we care about your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use the HobbyRent website, mobile application, and associated services (collectively, the “Services”).</p>

                <h3>Personal Information We Collect</h3>
                <p>We collect three categories of personal information: personal information you give us; personal information automatically collected from your use of the Services; and personal information from third-party sources.</p>

                <h4>1. Personal Information You Give Us</h4>
                <ul>
                    <li><strong>Account Data:</strong> When you register for an account with us, we require certain personal information to open your account, such as your name, email address, and password.</li>
                    <li><strong>Profile Data:</strong> We may also ask you to provide additional profile information to use certain features of the Services which may include street addresses, phone numbers, driver’s license numbers, date of issuance and issuing country/state, profile photos, employer, city, biography, and date of birth. Certain parts of your profile (like your profile photo, first name, and biography) are part of your public profile page and will be publicly visible to others.</li>
                    <li><strong>Listing & Equipment Data:</strong> We collect information you provide in relation to an item you list (e.g., dirt bike, boat, trailer, or tool), such as the VIN/Serial Number, location, availability dates, make/model, reviews, and uploaded photos.</li>
                    <li><strong>Payment Data:</strong> We collect your digital payment details, bank account or payment card numbers, and transaction information in connection with a potential or actual transaction. Note: Payment processing services are provided by Stripe; HobbyRent does not store your full raw credit card numbers on our servers.</li>
                    <li><strong>Identity Verification Data:</strong> In some instances, we may collect identity verification information such as a photograph or scanned copy of a driver’s license, passport, or national ID card, the last four digits of your Social Security number, social media account information, and insurance information. Where we request that you withhold certain information (such as obscuring specific numbers), please do so.</li>
                    <li><strong>Biometric Data:</strong> In some instances and with your consent, we or our third-party provider (such as Stripe Identity) may collect biometric information, such as facial recognition data derived from selfies and identification documents you submit, to verify that you are the genuine holder of the ID.</li>
                    <li><strong>Communications:</strong> When you communicate with HobbyRent, including via phone, email, or chat, or use the Services to communicate with other users (Owners or Renters), we collect information about your communication and any information you choose to provide.</li>
                </ul>

                <h4>2. Personal Information We Automatically Collect</h4>
                <ul>
                    <li><strong>Usage Data:</strong> We collect information about your interactions with the Services, such as the pages or content you view, your log-in history, your searches, bookings you have made, time spent on a page, and navigation paths between pages.</li>
                    <li><strong>Location Data:</strong> When you use certain features of the Services, we may collect information about your approximate location (e.g., city/town associated with your IP address). If you opt-in to location sharing on a mobile device, we may collect precise location data.</li>
                    <li><strong>Device Data:</strong> We collect information about your computer or mobile device, such as its operating system, browser type, screen resolution, IP address, and unique device identifiers.</li>
                    <li><strong>Rental & Transaction Data:</strong> We collect transactional information related to the rentals you take or host through the Services, including dates, times, amounts charged, and other related details.</li>
                    <li><strong>Cookies and Similar Technology:</strong> We (including companies we work with) may place small data files on your computer or other device (Cookies, pixel tags, etc.) to help us recognize you, customize your experience, and analyze usage.</li>
                </ul>

                <h4>3. Personal Information We Collect from Third-Party Sources</h4>
                <ul>
                    <li><strong>Third-Party Services:</strong> If you choose to log in to our Services through a third-party site (e.g., Google), that service may send us information such as your registration and profile information.</li>
                    <li><strong>GPS & Telematics Data:</strong> If a vehicle or item you book through the Services includes an onboard GPS device, telematics system, or aftermarket tracker (such as an AirTag or GPS dongle) installed by the Host or manufacturer, the Host or service provider may record information about the item’s use. This may include location, speed, battery/fuel levels, and harsh braking events. Renters acknowledge that Owners may use these devices to track their assets.</li>
                    <li><strong>Background Check Services:</strong> To the extent permitted by applicable laws, HobbyRent may collect background information about you from public records or background check providers, including credit reports, driving records (MVR), and criminal convictions.</li>
                    <li><strong>Other Sources:</strong> We may receive additional information about you, such as fraud detection information or demographic data from third-party data providers.</li>
                </ul>

                <h3>How We Use Your Personal Information</h3>
                <p>We use, store, and process your personal information to provide and improve the Services and for security and safety purposes. For example, we may use your information:</p>

                <h5>To Provide the Services:</h5>
                <ul>
                    <li>Facilitate your login and account management.</li>
                    <li>Process payments and payouts via Stripe.</li>
                    <li>Enable communication between Owners and Renters.</li>
                    <li>Send you service messages, booking confirmations, and security alerts.</li>
                    <li>Provide customer support.</li>
                </ul>

                <h5>For Security and Safety:</h5>
                <ul>
                    <li>Verify your identity and authenticate your government ID.</li>
                    <li>Check your driver’s license validity and driving history (where applicable for vehicles).</li>
                    <li>Detect, prevent, and remediate fraud, abuse, or insurance risks.</li>
                    <li>Resolve disputes and collect fees.</li>
                    <li>Detect unsafe behavior (e.g., using telematics data to identify speeding or off-limits usage).</li>
                </ul>

                <h5>For Research and Marketing:</h5>
                <ul>
                    <li>Analyze user demographics to improve our platform.</li>
                    <li>Send you marketing communications (which you can opt out of).</li>
                    <li>Show you interest-based advertising based on your activity.</li>
                </ul>

                <h5>To Comply with Law:</h5>
                <ul>
                    <li>Respond to legal requests, subpoenas, or government authorities.</li>
                </ul>

                <h3>How We Disclose Your Personal Information</h3>

                <h4>1. Profiles and Listings</h4>
                <p>Your public listing page or profile will always include basic information, such as your user name, public profile photo, city, listing description, and reviews.</p>

                <h4>2. Sharing Between Hosts and Renters</h4>
                <p>If you agree to a booking, we provide necessary information to the other party to facilitate the transaction.</p>
                <ul>
                    <li><strong>For Renters:</strong> We share your name, photo, and license status with the Owner.</li>
                    <li><strong>For Owners:</strong> We share the pickup address of the item and your contact info with the verified Renter.</li>
                    <li>We may share phone numbers to facilitate coordination.</li>
                </ul>

                <h4>3. Service Providers</h4>
                <p>We share information with vendors who support our business, including:</p>
                <ul>
                    <li><strong>Payment Processors:</strong> (e.g., Stripe) for processing charges and payouts.</li>
                    <li><strong>Identity Verification:</strong> Services that check IDs and selfies.</li>
                    <li><strong>Insurance & Claims:</strong> If a claim is filed, data is shared with claims adjusters or insurance carriers.</li>
                    <li><strong>Analytics & Hosting:</strong> Providers who help us run the website.</li>
                </ul>

                <h4>4. Legal & Safety</h4>
                <p>We may disclose your personal information to courts, law enforcement, or governmental authorities if required by law or if we believe it is reasonably necessary to respond to claims, protect the safety of our users, or prevent illegal activity (such as theft of a rented item).</p>

                <h3>Your Preferences and Choices</h3>
                <ul>
                    <li><strong>Communication:</strong> You can control notification preferences within your account settings.</li>
                    <li><strong>Marketing Opt-Out:</strong> You may opt out of marketing emails by clicking the "unsubscribe" link in the email.</li>
                    <li><strong>Correction:</strong> You can update your profile information by logging into your account.</li>
                    <li><strong>Account Closure:</strong> If you wish to close your account, please contact support@hobbyrent.com.</li>
                </ul>

                <h3>Security</h3>
                <p>We employ technical, physical, and organizational measures designed to protect your information. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.</p>

                <h3>Other Important Information</h3>
                <ul>
                    <li><strong>Cross-Border Transfer:</strong> The Services are controlled and operated from the United States. Your information may be processed in countries where we engage service providers.</li>
                    <li><strong>Sensitive Information:</strong> We ask that you not send us sensitive information (e.g., racial origin, political opinions, health data) unless specifically requested for a transaction or verification.</li>
                    <li><strong>Minors:</strong> The Services are not intended for anyone under the age of 18. We do not knowingly collect personal information from users under 18.</li>
                    <li><strong>Third-Party Practices:</strong> This policy only addresses HobbyRent. We are not responsible for the privacy practices of third parties (including Google, Facebook, or Apple) that you may use to log in or interact with.</li>
                </ul>

                <h3>U.S. State Privacy Rights (California & Others)</h3>
                <p>If you are a resident of California, Colorado, Connecticut, Virginia, or Utah, local laws may provide you with additional rights regarding your personal information, including:</p>
                <ul>
                    <li><strong>Right to Know:</strong> You can request information about the categories of personal information we collect and share.</li>
                    <li><strong>Right to Delete:</strong> You can request that we delete your personal information (subject to certain legal exceptions like tax records or fraud prevention).</li>
                    <li><strong>Right to Correct:</strong> You can request that we fix inaccurate information.</li>
                    <li><strong>Right to Opt-Out:</strong> You may have the right to opt out of the "sale" or "sharing" of personal information for targeted advertising.</li>
                </ul>
                <p>To exercise these rights, please contact us at privacy@hobbyrent.com. We do not sell your personal information to third parties for money.</p>

                <h3>Contact Us</h3>
                <p>If you have questions about this Privacy Policy, please contact us at:</p>
                <p><a href="mailto:privacy@hobbyrent.com">privacy@hobbyrent.com</a></p>
            </div>

            <style jsx>{`
                h3 { margin-top: 2.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
                h4 { margin-top: 1.5rem; color: #334155; }
                h5 { margin-top: 1rem; color: #475569; font-weight: 600; }
                p, li { color: #475569; }
                ul { margin-bottom: 1rem; padding-left: 1.5rem; }
                li { margin-bottom: 0.5rem; }
            `}</style>
        </div>
    );
}
