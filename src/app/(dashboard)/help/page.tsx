import { HelpCircle } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function HelpPage() {
  return (
    <ModulePlaceholder
      title="Help Center"
      description="Documentation, tutorials, and support resources for your CRM platform."
      icon={HelpCircle}
    />
  );
}
