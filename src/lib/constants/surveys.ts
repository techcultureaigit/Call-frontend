import type { QuestionType } from "@/types/survey";
import {
  AlignLeft,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Hash,
  List,
  Star,
  ToggleLeft,
} from "lucide-react";

export const QUESTION_TYPE_OPTIONS: {
  type: QuestionType;
  label: string;
  description: string;
  icon: typeof AlignLeft;
  color: string;
}[] = [
  {
    type: "text",
    label: "Text",
    description: "Short or long text answer",
    icon: AlignLeft,
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    type: "number",
    label: "Number",
    description: "Numeric input only",
    icon: Hash,
    color: "text-violet-600 bg-violet-500/10",
  },
  {
    type: "rating",
    label: "Rating",
    description: "Star or scale rating",
    icon: Star,
    color: "text-amber-600 bg-amber-500/10",
  },
  {
    type: "yes_no",
    label: "Yes / No",
    description: "Binary choice",
    icon: ToggleLeft,
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Single selection from options",
    icon: CircleDot,
    color: "text-rose-600 bg-rose-500/10",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "Multiple selections allowed",
    icon: CheckSquare,
    color: "text-orange-600 bg-orange-500/10",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    description: "Select from a dropdown list",
    icon: ChevronDown,
    color: "text-cyan-600 bg-cyan-500/10",
  },
];

export const CONDITIONAL_OPERATORS = [
  { label: "Equals", value: "equals" },
  { label: "Not equals", value: "not_equals" },
  { label: "Contains", value: "contains" },
  { label: "Greater than", value: "greater_than" },
  { label: "Less than", value: "less_than" },
] as const;

export const CONDITIONAL_ACTIONS = [
  { label: "Show question", value: "show" },
  { label: "Hide question", value: "hide" },
] as const;

export function getQuestionTypeMeta(type: QuestionType) {
  return QUESTION_TYPE_OPTIONS.find((o) => o.type === type)!;
}

export function createDefaultQuestion(type: QuestionType, order: number) {
  const meta = getQuestionTypeMeta(type);
  const base = {
    id: `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    title: `New ${meta.label} Question`,
    required: false,
    order,
  };

  switch (type) {
    case "multiple_choice":
    case "checkbox":
    case "dropdown":
      return { ...base, options: ["Option 1", "Option 2", "Option 3"] };
    case "rating":
      return { ...base, ratingMax: 5 };
    case "text":
    case "number":
      return { ...base, placeholder: "Your answer..." };
    default:
      return base;
  }
}
