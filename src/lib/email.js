import { site } from "@/data/site";
import { toast } from "./toast";
import { track } from "./analytics";

export async function copyEmail(source) {
  try {
    await navigator.clipboard.writeText(site.email);
    toast("Copied ✓");
    track("email-copy", { source });
    return true;
  } catch {
    toast(`Couldn’t copy. The address is ${site.email}`, { duration: 4000 });
    return false;
  }
}
