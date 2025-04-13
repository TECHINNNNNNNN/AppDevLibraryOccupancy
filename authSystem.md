To implement Chulalongkorn University email authentication in your web app, follow these technical guidelines and references:

## 1. **Email Domain Verification Setup**
Chulalongkorn University uses Microsoft 365 for student emails (`@student.chula.ac.th`)[3]. To authenticate users via their institutional email:

**Implementation Steps:**
- **Use OAuth2.0 with Microsoft Identity Platform**  
  Configure Microsoft as an identity provider in your authentication flow. Users will log in via their university Microsoft account, and you can validate the email domain post-authentication.

- **Firebase Authentication Example**  
  If using Firebase:
  ```javascript
  const provider = new firebase.auth.OAuthProvider('microsoft.com');
  provider.setCustomParameters({
    tenant: 'student.chula.ac.th' // Restrict to Chula domain
  });
  firebase.auth().signInWithPopup(provider);
  ```
  Validate the returned user object’s `email` field to ensure it ends with `@student.chula.ac.th`[5].

## 2. **Domain-Specific Validation**
Add logic to check the email domain after authentication:
```javascript
function validateChulaEmail(user) {
  if (!user.email.endsWith('@student.chula.ac.th')) {
    throw new Error('Only Chulalongkorn University emails are allowed.');
  }
}
```

## 3. **DNS and Security Considerations**
- The university’s email system already implements **SPF/DKIM/DMARC**[1][2], ensuring legitimate emails are sent from `student.chula.ac.th`.
- For added security, request **read-only Microsoft Graph API permissions** (e.g., `User.Read`) to access verified user details[5].

## Key References
1. **Chula Student Email Documentation**  
   Official details about email formats and access methods[3].

2. **Firebase Custom Domain Authentication**  
   Configuring sender domains for verification emails[5].

3. **OAuth2.0 for Microsoft Identity Platform**  
   [Microsoft Identity Platform Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

This approach ensures only valid Chula affiliates can authenticate while leveraging existing university infrastructure. For Cursor Agent integration, provide these references in a `cursor.md` file to guide code generation.

Citations:
[1] https://powerdmarc.com/implementing-mail-domain-authentication/
[2] https://postmansmtp.com/email-domain-authentication/
[3] https://www.it.chula.ac.th/en/service/en-email-nisit/
[4] https://security.stackexchange.com/questions/15437/verify-if-person-belongs-to-the-claimed-university-through-his-university-email
[5] https://firebase.google.com/docs/auth/email-custom-domain
[6] https://www.techtarget.com/searchsecurity/definition/authentication
[7] https://www.ftc.gov/business-guidance/small-businesses/cybersecurity/email-authentication
[8] https://fluentcrm.com/email-authentication/
[9] https://www.proofpoint.com/us/blog/email-and-cloud-threats/better-way-secure-and-authenticate-application-email
[10] https://bird.com/guides/introduction-to-email-authentication
[11] https://www.mailerlite.com/help/c/domain-authentication
[12] https://www.validity.com/email-authentication/
[13] https://sendgrid.com/en-us/blog/how-to-authenticate-your-email-in-5-steps
[14] https://www.brevo.com/blog/email-authentication/
[15] https://bird.com/en-us/guides/introduction-to-email-authentication
[16] https://auth0.com/docs/get-started/architecture-scenarios/sso-for-regular-web-apps/part-3
[17] https://www.eweek.com/enterprise-apps/how-to-implement-e-mail-sender-id-authentication-for-a-hosted-smb-web-site/
[18] https://www.ucdenver.edu
[19] https://mail.google.com/mail/
[20] https://www.qub.ac.uk/directorates/InformationServices/Services/EmailBasicAuthentication/
[21] https://www.concord.edu
[22] https://www.it.chula.ac.th/en/service/en-inspect/
[23] https://www.cuit.columbia.edu/cuit/manage-my-uni
[24] https://www.register.gradchula.com/login
[25] https://www.commonwealthu.edu/my-commonwealthu
[26] https://www.register.gradchula.com
[27] https://kcmh.chulalongkornhospital.go.th
[28] https://login.ucdenver.edu
[29] https://www.liquidweb.com/blog/authenticate-email-using-best-practices/
[30] https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/mkt-settings-authenticate-domains
[31] https://learn.microsoft.com/en-us/azure/communication-services/concepts/email/email-domain-and-sender-authentication
[32] https://mailchimp.com/developer/transactional/docs/authentication-delivery/
[33] https://www.proofpoint.com/us/threat-reference/email-authentication
[34] https://www.cardiff.ac.uk/new-students/when-you-arrive/connecting-to-the-university-it-network
[35] https://support.apple.com/en-us/102660
[36] https://help.uis.cam.ac.uk/service/accounts-passwords/set-multi-factor-authentication/set-your-email-apps
[37] https://firebase.google.com/docs/auth/web/google-signin
[38] https://support.mozilla.org/ga-IE/questions/1119302
[39] https://webapp.services.coventry.ac.uk

---
Answer from Perplexity: https://www.perplexity.ai/search/after-i-connect-relit-to-curso-DGr_AVm5RHOR9VXVRsavDw?utm_source=copy_output