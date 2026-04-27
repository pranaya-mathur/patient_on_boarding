import { IntakeSessionClient } from "@/components/patient/intake/IntakeSessionClient";
import { ChatWidget } from "@/components/chat/ChatWidget";

type IntakeLandingProps = { params: Promise<{ token: string }> };

export default async function IntakeLandingPage({ params }: IntakeLandingProps) {
  const { token } = await params;

  return (
    <>
      <IntakeSessionClient token={token} />
      <ChatWidget intakeToken={token} />
    </>
  );
}
