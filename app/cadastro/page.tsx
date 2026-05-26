import { Suspense } from "react";
import { SignupWizard } from "@/components/agenda/SignupWizard";

export default function CadastroPage() {
  return (
    <Suspense>
      <SignupWizard />
    </Suspense>
  );
}
