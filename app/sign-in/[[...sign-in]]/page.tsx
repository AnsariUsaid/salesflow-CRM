import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn 
        appearance={{
          elements: {
            footer: "hidden",
          }
        }}
        signUpUrl={undefined}
      />
    </div>
  );
}
