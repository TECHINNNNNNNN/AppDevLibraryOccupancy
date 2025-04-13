# Microsoft Authentication Setup for Chulalongkorn University

This guide explains how to set up Microsoft authentication for Chulalongkorn University student accounts (`@student.chula.ac.th`) in your application.

## Prerequisites

1. An Azure account with access to Azure Active Directory
2. Access to modify application environment variables

## Step 1: Register an Azure AD Application

1. Sign in to the [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App Registrations**
3. Click **New Registration**
4. Enter a name for your application (e.g., "CU Library Tracker")
5. Under **Supported account types**, select **Accounts in any organizational directory (Any Azure AD directory - Multitenant)**
6. For **Redirect URI**:
   - Select **Web** as the platform
   - Enter your application's redirect URI (e.g., `http://localhost:5173` for local development)
7. Click **Register**

## Step 2: Configure Authentication

1. In your newly created app, navigate to **Authentication**
2. Under **Implicit grant and hybrid flows**, check:
   - **Access tokens**
   - **ID tokens**
3. Under **Advanced settings**, set **Allow public client flows** to **Yes**
4. Click **Save**

## Step 3: Configure API Permissions

1. Navigate to **API Permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add the following permissions:
   - `User.Read`
   - `email`
   - `profile`
   - `openid`
6. Click **Add permissions**
7. Click **Grant admin consent** if you have admin rights

## Step 4: Configure Your Application

1. Create or update the `.env` file in your client directory:

```
VITE_MICROSOFT_CLIENT_ID=YOUR_APPLICATION_ID
```

Replace `YOUR_APPLICATION_ID` with the Application (client) ID from your registered app's Overview page.

## Step 5: Domain Verification (Optional)

For additional security, you can verify that emails end with `@student.chula.ac.th` after authentication as we do in the authentication code.

## Testing the Authentication

1. Start your application
2. Try signing in with a Chulalongkorn University Microsoft account
3. The authentication flow should verify that the email ends with `@student.chula.ac.th`

## Troubleshooting

- **Client ID Error**: Ensure the `VITE_MICROSOFT_CLIENT_ID` environment variable is correctly set
- **Redirect URI Error**: Make sure the redirect URI in your Azure app matches your application's URL
- **Permission Issues**: Check that you have granted all required API permissions
- **Domain Verification**: Ensure the email domain verification logic is working correctly

## References

- [Microsoft Identity Platform Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [MSAL.js Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications)
- [Chulalongkorn University Email Documentation](https://www.it.chula.ac.th/en/service/en-email-nisit/) 