import { LogoHeader } from "@/components/auth/shared/LogoHeader";
import { SignupForm } from "@/components/auth/signup/SignupForm";
import { AuthModel } from "@/lib/models/auth";

export default function SignUpPage() {
  const config = AuthModel.signup;

  return (
    <>
      <LogoHeader
        heading={config.heading}
        subheading={config.subheading}
        logo={config.logo}
      />
      <SignupForm
        signupText={config.signupText}
        googleText={config.googleText}
        loginText={config.loginText}
        loginUrl={config.loginUrl}
      />
    </>
  );
}
