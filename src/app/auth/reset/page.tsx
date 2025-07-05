import { LogoHeader } from "@/components/auth/shared/LogoHeader";
import ResetForm from "@/components/auth/reset/ResetForm";
import { AuthModel } from "@/lib/models/auth";

export default function ResetPage() {
  const config = AuthModel.reset;

  return (
    <>
      <LogoHeader
        heading={config.heading}
        subheading={config.subheading}
        logo={config.logo}
      />
      <ResetForm resetText={config.resetText} />
    </>
  );
}
