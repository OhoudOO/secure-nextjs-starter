import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

// The proxy already redirects signed-out users; this check stays as defence in depth.
export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/");
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Signed in as {session.user.name}</p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
