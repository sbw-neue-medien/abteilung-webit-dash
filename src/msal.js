import { PublicClientApplication } from '@azure/msal-browser'

const clientId = import.meta.env.VITE_MSAL_CLIENT_ID
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID

export const msalConfigured = Boolean(clientId && tenantId)

let msalInstance = null

export async function getMsalInstance() {
  if (!msalConfigured) return null
  if (!msalInstance) {
    msalInstance = new PublicClientApplication({
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: `${window.location.origin}/auth-popup.html`,
      },
      cache: { cacheLocation: 'sessionStorage' },
    })
    await msalInstance.initialize()
  }
  return msalInstance
}

export async function loginWithMicrosoftPopup() {
  const msal = await getMsalInstance()
  if (!msal) throw new Error('Microsoft-Login ist nicht konfiguriert')
  const result = await msal.loginPopup({ scopes: ['User.Read'] })
  return result.accessToken
}
