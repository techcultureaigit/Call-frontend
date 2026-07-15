import { getQuestionTypeMeta } from "@/lib/constants/surveys";
import type { QuestionType } from "@/types/survey";

export function PaletteDragOverlay({ type }: { type: QuestionType }) {
  const meta = getQuestionTypeMeta(type);
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-card px-4 py-3 shadow-elevated">
      <div className={`flex size-9 items-center justify-center rounded-lg ${meta.color}`}>
        <Icon className="size-4" />
      </div>
      <span className="text-sm font-medium">{meta.label}</span>
    </div>
  );
}
