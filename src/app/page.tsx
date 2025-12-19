import { redirect } from "next/navigation";

import { defaultLocale } from "@/lib/config/site";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
