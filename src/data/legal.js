import { brand } from '../config/brand'

export const privacyPolicy = {
  title: 'Privacy policy',
  intro: `This policy explains what ${brand.name} collects, why, and what you can ask us to do with it. It is written to meet the Personal Data Protection Act, 2022 of Tanzania.`,
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [`${brand.name} is operated by ${brand.legalName}, ${brand.address}. You can reach the person responsible for data protection at ${brand.contactEmail}.`],
    },
    {
      heading: 'What we collect from business owners',
      list: [
        'Business name, TIN and business licence number, to check that the business is registered.',
        'Your NIDA number, only to confirm that you own the business. We check it and then delete it. We keep a record that the check passed, not the number.',
        'Photos of ledger pages and screenshots of mobile money statements that you upload, to build your report.',
        'The report we generate from those records.',
      ],
    },
    {
      heading: 'What we collect from investors',
      list: [
        'A display name, your experience level and your learning goal.',
        'The practice investments you make with demo money.',
      ],
      paragraphs: ['We do not ask investors for ID numbers, bank details or payment cards, because no real money moves.'],
    },
    {
      heading: 'What we do not collect',
      paragraphs: ['We do not use advertising trackers, analytics cookies or third-party embeds. We do not read your contacts, location or photos beyond the files you choose to upload.'],
    },
    {
      heading: 'Who can see your information',
      paragraphs: ['Only you, until you press Share. When you share a report with a lender, they see the report and the checks that passed. They do not see your NIDA number or your original photos unless you send them separately. We never sell personal data.'],
    },
    {
      heading: 'How long we keep it',
      list: [
        'Uploaded photos: deleted 30 days after your report is created.',
        'Reports and verification results: kept while your account is open, then deleted within 90 days of closing it.',
        'Demo investor accounts: deleted after 12 months without a sign-in.',
      ],
    },
    {
      heading: 'How we protect it',
      paragraphs: ['Data travels over HTTPS and is stored encrypted. Staff access is limited to people who need it and is logged. Uploaded files are checked, renamed and stored away from the public website.'],
    },
    {
      heading: 'Your rights',
      paragraphs: [`You can ask to see, correct or delete your data, or withdraw consent, by writing to ${brand.contactEmail}. We reply within 30 days. You can also complain to the Personal Data Protection Commission of Tanzania.`],
    },
  ],
}

export const termsOfUse = {
  title: 'Terms and conditions',
  intro: `These terms apply when you use ${brand.name}. By creating an account you agree to them.`,
  sections: [
    {
      heading: 'What the service is',
      paragraphs: [`${brand.name} turns business records into a report with a score, an indicative loan level and savings advice. It also offers investment practice with demo money. It is an information and training service.`],
    },
    {
      heading: 'What the service is not',
      list: [
        'It is not a lender. We do not approve or refuse loans.',
        'The score is not a credit reference bureau report.',
        'The loan level is an estimate. A lender will make its own assessment.',
        'Investor practice is not an investment product and is not financial advice.',
      ],
    },
    {
      heading: 'Your responsibilities',
      list: [
        'Upload only records that belong to your business and are true.',
        'Keep your sign-in details private.',
        'Use the service only if you are 18 or older.',
      ],
    },
    {
      heading: 'Demo money',
      paragraphs: ['The investor wallet holds demo money with no cash value. It cannot be withdrawn, transferred or exchanged. Results shown after a simulation are examples, not predictions.'],
    },
    {
      heading: 'Payments and refunds',
      paragraphs: [`${brand.name} does not charge fees during the pilot, so there is nothing to refund. If paid features are added, we will publish a refund policy and ask for your agreement first.`],
    },
    {
      heading: 'Accuracy',
      paragraphs: ['Our AI reads photos and screenshots, and it can make mistakes. You confirm every figure before it enters your report. We are not responsible for decisions based on records you did not check.'],
    },
    {
      heading: 'Ending your account',
      paragraphs: [`You can close your account at any time by writing to ${brand.contactEmail}. We may suspend accounts that upload records belonging to someone else.`],
    },
    {
      heading: 'Law',
      paragraphs: ['These terms are governed by the laws of the United Republic of Tanzania.'],
    },
  ],
}

export const cookiePolicy = {
  title: 'Cookie policy',
  intro: `${brand.name} uses as few cookies as possible.`,
  sections: [
    {
      heading: 'Cookies we use',
      list: [
        'A session cookie that keeps you signed in. It is marked Secure, HttpOnly and SameSite=Strict, and it ends when you sign out.',
        'A security token cookie that protects forms from cross-site request forgery.',
      ],
      paragraphs: ['Both are strictly necessary, so the site cannot work without them. They do not track you across other websites.'],
    },
    {
      heading: 'Cookies we do not use',
      paragraphs: ['No analytics, advertising or social media cookies. No third-party scripts that set their own cookies.'],
    },
    {
      heading: 'Fonts',
      paragraphs: ['Our typefaces load from Google Fonts. Your browser sends your IP address to Google to fetch them. Google Fonts does not set cookies.'],
    },
    {
      heading: 'Changing your choice',
      paragraphs: ['You can block cookies in your browser settings. If you block the necessary ones, you will not be able to sign in.'],
    },
  ],
}
