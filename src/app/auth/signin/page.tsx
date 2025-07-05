import { LogoHeader } from "@/components/auth/shared/LogoHeader";
import LoginForm from "@/components/auth/login/LoginForm";
import { AuthModel } from "@/lib/models/auth";

export default function SignInPage() {
  const config = AuthModel.signin;

  return (
    <>
      <LogoHeader
        heading={config.heading}
        subheading={config.subheading}
        logo={config.logo}
      />
      <LoginForm
        loginText={config.loginText}
        googleText={config.googleText}
        signupText={config.signupText}
        signupUrl={config.signupUrl}
      />
    </>
  );
}
