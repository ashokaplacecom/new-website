import KeystaticApp from "./keystatic";
import KeystaticFloatingControl from "./floating-control";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout() {
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <>
      <KeystaticApp />
      <KeystaticFloatingControl />
    </>
  );
}
