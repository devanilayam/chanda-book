export interface AuthFormProps {
   /** Heading shown above the button. */
   heading: string;

   /**
    * Short line under the heading explaining what signing in gets you.
    */
   description?: string;

   /**
    * Disables the button and dims the card while the handoff to Google is in
    * flight.
    *
    * @default false
    */
   pending?: boolean;

   /**
    * Error text to show under the button. `null` hides the block entirely.
    *
    * @default null
    */
   errorMessage?: string | null;

   /**
    * Label for the Google button. Google's branding guidelines expect one of
    * their own phrases, and "Continue with" covers both first-time and
    * returning users — which is the same click here.
    *
    * @default 'Continue with Google'
    */
   googleLabel?: string;
}
