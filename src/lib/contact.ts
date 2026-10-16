/** The contact form is live only when an email provider is configured (see README). */
export const contactConfigured = () => !!(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
