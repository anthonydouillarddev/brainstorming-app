"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Project, Todo } from "@/lib/types";
import { TAG_PRESETS, countTags, mergeTagSuggestions, uniqueTags } from "@/lib/tags";
import TagFilter from "@/app/components/tag-filter";
import TodoList from "@/app/components/todolist";
import { useDeepLinkScroll } from "./_shared/useDeepLinkScroll";

export default function TasksTab({
  userId,
  project,
  tasks,
  ideas,
  onTasksChange,
  onIdeasChange,
}: {
  userId: string;
  project: Project;
  tasks: Todo[];
  ideas: Todo[];
  onTasksChange: (todos: Todo[]) => void;
  onIdeasChange: (todos: Todo[]) => void;
}) {
  const allTodos = useMemo(() => [...tasks, ...ideas], [tasks, ideas]);
  const knownTags = useMemo(() => uniqueTags(allTodos), [allTodos]);
  const tagSuggestions = useMemo(
    () => mergeTagSuggestions(TAG_PRESETS, knownTags),
    [knownTags]
  );
  const tagCounts = useMemo(() => countTags(allTodos), [allTodos]);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const searchParams = useSearchParams();
  useDeepLinkScroll(searchParams?.get("id") ?? null, "todo-id");

  return (
    <div className="space-y-8">
      <TagFilter
        knownTags={tagSuggestions}
        activeTags={activeTags}
        onChange={setActiveTags}
        tagCounts={tagCounts}
        label="Filtrer tâches + idées par tag"
      />
      <TodoList
        userId={userId}
        scope={{ kind: "project", projectId: project.id, projectType: project.type }}
        kind="task"
        initialTodos={tasks}
        onTodosChange={onTasksChange}
        tagFilter={activeTags}
        tagSuggestions={tagSuggestions}
      />
      <TodoList
        userId={userId}
        scope={{ kind: "project", projectId: project.id, projectType: project.type }}
        kind="idea"
        initialTodos={ideas}
        onTodosChange={onIdeasChange}
        tagFilter={activeTags}
        tagSuggestions={tagSuggestions}
      />
    </div>
  );
}
