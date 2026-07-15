"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { usePageMeta, useSurveyDetail, useSurveyMutations } from "@/hooks";
import { createDefaultQuestion } from "@/lib/constants/surveys";
import type { QuestionType, SurveyQuestion } from "@/types/survey";
import { SurveyBuilderHeader } from "./survey-builder-header";
import { QuestionPalette } from "./question-palette";
import { QuestionCanvas } from "./question-canvas";
import { QuestionSettingsPanel } from "./question-settings-panel";
import { SurveyPreview } from "./survey-preview";
import { SurveyPicker } from "./survey-picker";
import { PaletteDragOverlay } from "./palette-drag-overlay";

export function SurveyBuilderView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("id");

  const { data: survey, isLoading } = useSurveyDetail(surveyId);
  const { saveSurvey, togglePublish, createSurvey } = useSurveyMutations();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeDragType, setActiveDragType] = useState<QuestionType | null>(null);

  const { applyMeta, resetPageMeta } = usePageMeta({
    title: "Survey Builder",
    breadcrumbs: [
      { label: "Surveys", href: "/surveys" },
      { label: "Builder" },
    ],
  });

  useEffect(() => {
    applyMeta();
    return () => resetPageMeta();
  }, [applyMeta, resetPageMeta]);

  useEffect(() => {
    if (survey) {
      setName(survey.name);
      setDescription(survey.description ?? "");
      setQuestions(survey.questions);
      setSelectedId(survey.questions[0]?.id ?? null);
      setDirty(false);
    }
  }, [survey?.id, survey?.updatedAt]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const markDirty = useCallback(() => setDirty(true), []);

  const updateQuestions = useCallback(
    (updater: (prev: SurveyQuestion[]) => SurveyQuestion[]) => {
      setQuestions(updater);
      markDirty();
    },
    [markDirty]
  );

  const addQuestion = useCallback(
    (type: QuestionType, index?: number) => {
      const q = createDefaultQuestion(type, questions.length);
      updateQuestions((prev) => {
        const next = [...prev];
        if (index !== undefined) next.splice(index, 0, q);
        else next.push(q);
        return next.map((item, i) => ({ ...item, order: i }));
      });
      setSelectedId(q.id);
    },
    [questions.length, updateQuestions]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type as QuestionType | undefined;
    if (type) setActiveDragType(type);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;

    if (active.data.current?.fromPalette && over?.id === "question-canvas") {
      addQuestion(active.data.current.type as QuestionType);
      return;
    }

    if (active.id !== over?.id && over) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        updateQuestions((prev) => arrayMove(prev, oldIndex, newIndex).map((q, i) => ({ ...q, order: i })));
      }
    }
  };

  const handleSave = async () => {
    if (!surveyId) return;
    await saveSurvey.mutateAsync({
      id: surveyId,
      payload: { name, description, questions, status: survey?.status },
    });
    setDirty(false);
  };

  const handlePublishToggle = async (published: boolean) => {
    if (!surveyId) return;
    if (dirty) await handleSave();
    await togglePublish.mutateAsync({ id: surveyId, published });
  };

  const handleSelectSurvey = (id: string) => {
    router.push(`/surveys/builder?id=${id}`);
  };

  const handleCreateSurvey = async () => {
    const created = await createSurvey.mutateAsync({
      name: "Untitled Survey",
      description: "",
    });
    router.push(`/surveys/builder?id=${created.id}`);
  };

  const selectedQuestion = questions.find((q) => q.id === selectedId) ?? null;

  if (!surveyId) {
    return (
      <SurveyPicker
        onSelect={handleSelectSurvey}
        onCreate={handleCreateSurvey}
        isCreating={createSurvey.isPending}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
        <SurveyBuilderHeader
          name={name}
          onNameChange={(v) => { setName(v); markDirty(); }}
          published={survey?.status === "active"}
          onPublishToggle={handlePublishToggle}
          onPreview={() => setPreviewOpen(true)}
          onSave={handleSave}
          isSaving={saveSurvey.isPending}
          isPublishing={togglePublish.isPending}
          dirty={dirty}
          questionCount={questions.length}
        />

        <div className="flex flex-1 overflow-hidden">
          <QuestionPalette onAdd={addQuestion} />

          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <QuestionCanvas
              questions={questions}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAdd={addQuestion}
              onUpdate={(id, patch) => {
                updateQuestions((prev) =>
                  prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
                );
              }}
              onDelete={(id) => {
                updateQuestions((prev) => {
                  const next = prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, order: i }));
                  if (selectedId === id) setSelectedId(next[0]?.id ?? null);
                  return next;
                });
              }}
              onDuplicate={(id) => {
                const source = questions.find((q) => q.id === id);
                if (!source) return;
                const copy: SurveyQuestion = {
                  ...structuredClone(source),
                  id: `q_${Date.now().toString(36)}`,
                  title: `${source.title} (copy)`,
                  order: questions.length,
                };
                updateQuestions((prev) => [...prev, copy].map((q, i) => ({ ...q, order: i })));
                setSelectedId(copy.id);
              }}
            />
          </SortableContext>

          <QuestionSettingsPanel
            question={selectedQuestion}
            allQuestions={questions}
            onUpdate={(patch) => {
              if (!selectedId) return;
              updateQuestions((prev) =>
                prev.map((q) => (q.id === selectedId ? { ...q, ...patch } : q))
              );
            }}
            onClose={() => setSelectedId(null)}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragType ? <PaletteDragOverlay type={activeDragType} /> : null}
      </DragOverlay>

      <SurveyPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        name={name}
        description={description}
        questions={questions}
      />
    </DndContext>
  );
}
