export interface AuthFormProps {
   /** Heading shown above the fields. */
   heading: string;

   /**
    * Short line under the heading explaining what the form does.
    */
   description?: string;

   /** Label for the submit button. */
   submitLabel: string;

   /**
    * Disables the form and shows a working state while a request is in flight.
    *
    * @default false
    */
   pending?: boolean;

   /**
    * Error text to show above the button. `null` hides the block entirely.
    *
    * @default null
    */
   errorMessage?: string | null;

   /**
    * Minimum password length enforced by the browser. Matches the Supabase
    * project's own minimum, which is 6 by default.
    *
    * @default 6
    */
   minPasswordLength?: number;

   /**
    * Hint passed to password managers so they offer to save a new password on
    * signup rather than autofilling the existing one.
    *
    * @default 'current-password'
    */
   passwordAutocomplete?: "current-password" | "new-password";
}

export interface AuthFormSubmitPayload {
   email: string;
   password: string;
}
