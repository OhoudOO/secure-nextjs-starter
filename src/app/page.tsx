import { auth, signIn } from "@/auth";
import ContactForm from "./ContactForm";

export default async function Home() {
  const session = await auth();
  return (
    <main>
      <h1>Secure Next.js starter</h1>
      {session ? (
        <a href="/dashboard">Go to dashboard</a>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit">Sign in with GitHub</button>
        </form>
      )}
      <ContactForm />
    </main>
  );
}
