'use client';

export default function TermsPage() {
    return (
        <div className="container" style={{ padding: '8rem 2rem 4rem' }}>
            <h1>Terms of Service</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="content" style={{ maxWidth: '800px', lineHeight: '1.6' }}>
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using HobbyRent, you accept and agree to be bound by the terms and provision of this agreement.</p>

                <h3>2. Specific Terms for Renters (Guests)</h3>

                <h4>2.1 Renter Commitments</h4>
                <p>As a Renter, you commit that you are at least 18 years of age (or older if required by the specific listing) and possess a valid driver’s license or necessary certification to operate the equipment. You agree to:</p>
                <ul>
                    <li><strong>Safety Gear:</strong> Wear all legally required and recommended safety gear (e.g., DOT-approved helmets, life vests, goggles) at all times while operating the equipment.</li>
                    <li><strong>Competence:</strong> Only operate equipment you are experienced with and physically capable of using safely. You acknowledge that off-road vehicles, watercraft, and heavy machinery carry inherent risks.</li>
                    <li><strong>Return Condition:</strong> Return the item on time, with the same fuel level (if applicable), and in essentially the same condition as received, accounting for normal wear and tear.</li>
                </ul>

                <h4>2.2 Financial Responsibility for Damage</h4>
                <p>You (the Renter) are financially responsible for all physical damage to, theft of, or loss of the booked item that occurs during the rental period, regardless of fault.</p>
                <ul>
                    <li><strong>Full Liability:</strong> If you crash a dirt bike, sink a jet ski, or damage a trailer, you are liable for the full cost of repairs or the Fair Market Value (actual cash value) of the item if it is totaled.</li>
                    <li><strong>Loss of Use:</strong> You may also be liable for "loss of use" fees charged by the Owner while the item is being repaired and cannot be rented to others.</li>
                    <li><strong>Payment Authorization:</strong> You authorize HobbyRent to charge your payment method on file for any damages, deductibles, or fees reported by the Owner and verified by our support team.</li>
                </ul>

                <h4>2.3 Prohibited Uses</h4>
                <p>You strictly agree NOT to use any rented item for:</p>
                <ul>
                    <li><strong>Racing:</strong> Any organized racing, stunting, or professional competition.</li>
                    <li><strong>Commercial Use:</strong> Using the item for "ride-sharing," delivery, or subleasing to others.</li>
                    <li><strong>Illegal Areas:</strong> Operating off-road vehicles on public highways (unless street legal) or in prohibited wilderness areas.</li>
                    <li><strong>Towing:</strong> Towing anything with a rental vehicle unless expressly authorized by the Owner in writing.</li>
                    <li><strong>Under the Influence:</strong> Operating any equipment while under the influence of alcohol, drugs, or medication.</li>
                </ul>

                <h3>3. Specific Terms for Owners (Hosts)</h3>

                <h4>3.1 Owner Commitments</h4>
                <p>As an Owner, you represent and warrant that:</p>
                <ul>
                    <li><strong>Safe Condition:</strong> The equipment you list is in safe, mechanical working order and has no known defects that could compromise safety (e.g., bald tires, bad brakes, leaking fuel).</li>
                    <li><strong>Legal Authority:</strong> You own the item or have explicit legal authority to rent it out.</li>
                    <li><strong>Maintenance:</strong> You have performed all manufacturer-recommended maintenance.</li>
                    <li><strong>Instruction:</strong> You will provide the Renter with a walkthrough of the controls and safety features before handing over the equipment.</li>
                </ul>

                <h4>3.2 Insurance & Risk Acknowledgement (Crucial)</h4>
                <ul>
                    <li><strong>Personal Insurance Warning:</strong> You understand that your personal insurance policies (Auto, Homeowners, or Renter’s Insurance) may not cover commercial rental activity. It is your sole responsibility to verify your coverage with your insurance provider or purchase a commercial rental policy.</li>
                    <li><strong>HobbyRent is a Venue:</strong> HobbyRent does not provide automatic insurance coverage for your equipment unless you have explicitly opted into a Protection Plan (if available). If no Protection Plan is active, you assume the risk of renting your property to third parties.</li>
                </ul>

                <h4>3.3 Indemnification</h4>
                <p>You agree to defend, indemnify, and hold HobbyRent harmless from any claims or liability arising from your failure to maintain your equipment (e.g., if a wheel falls off due to your negligence and injures the Renter).</p>

                <h3>4. Payment Processing (Stripe Connected Account)</h3>
                <p>
                    Payment processing services for users on HobbyRent are provided by Stripe and are subject to the <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer">Stripe Connected Account Agreement</a>, which includes the Stripe Terms of Service (collectively, the “Stripe Services Agreement”).
                </p>
                <p>
                    By agreeing to these terms or continuing to operate as a account holder on HobbyRent, you agree to be bound by the Stripe Services Agreement, as the same may be modified by Stripe from time to time.
                </p>

                <h3>5. Liability & Disclaimers (The "Venue" Clause)</h3>

                <h4>5.1 HobbyRent is a Venue, Not a Rental Company</h4>
                <p>HobbyRent is an online marketplace that connects Owners with Renters. HobbyRent does not own, inspect, maintain, or insure the equipment listed on the Services. We are not a party to the rental agreement between Owner and Renter.</p>

                <h4>5.2 Assumption of Risk</h4>
                <p style={{ fontWeight: 'bold' }}>READ CAREFULLY: BY USING THE SERVICES TO RENT EQUIPMENT (INCLUDING BUT NOT LIMITED TO ATVS, DIRT BIKES, JET SKIS, AND HEAVY MACHINERY), YOU VOLUNTARILY ASSUME ALL RISKS OF ACCIDENT, INJURY, ILLNESS, DISABILITY, DEATH, OR PROPERTY DAMAGE. You understand that these activities are inherently dangerous. You assume full responsibility for your safety and the safety of your passengers.</p>

                <h4>5.3 Limitation of Liability</h4>
                <p>To the fullest extent permitted by law, HobbyRent (and its officers, employees, and agents) shall not be liable for any incidental, special, or consequential damages, including lost profits, loss of data, or cost of substitute goods, arising out of or in connection with these Terms or the use of the Platform. In no event will HobbyRent’s aggregate liability to you exceed the greater of (1) the amounts you have paid or earned via the platform in the 12 months prior to the claim, or (2) One Hundred U.S. Dollars (US$100).</p>

                <h4>5.4 Dispute Resolution</h4>
                <p>Any dispute arising from these Terms or your use of HobbyRent shall be resolved through binding arbitration in the state of Idaho, rather than in court. You waive your right to a jury trial or to participate in a class action lawsuit.</p>

                <h3>6. Termination</h3>
                <p>We reserve the right to terminate your access to the site at any time without notice for violation of these terms.</p>
            </div>

            <style jsx>{`
                h3 { margin-top: 2.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
                h4 { margin-top: 1.5rem; color: #334155; }
                p, li { color: #475569; }
                ul { margin-bottom: 1rem; padding-left: 1.5rem; }
                li { margin-bottom: 0.5rem; }
            `}</style>
        </div>
    );
}
