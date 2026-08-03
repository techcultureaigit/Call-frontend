"use client";

import {
  SurveyScheduleFields,
  type ScheduleFormValues,
} from "../survey-schedule-fields";

interface ScheduleTabProps {
  values: ScheduleFormValues;
  onChange: (values: ScheduleFormValues) => void;
  mode?: "create" | "edit";
  readOnly?: boolean;
}

/** Dedicated Create Survey step for schedule — Contact stays upload/view only */
export function ScheduleTab({
  values,
  onChange,
  mode = "create",
  readOnly = false,
}: ScheduleTabProps) {
  return (
    <SurveyScheduleFields
      values={values}
      onChange={onChange}
      mode={mode}
      readOnly={readOnly}
    />
  );
}
