'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTaskStore } from '@/store';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from '../tasks/TaskCard';
import { Task, WorkflowStage } from '@/types';

interface KanbanBoardProps {
  projectId: number;
  onTaskClick: (task: Task) => void;
  onAddTask: (stageId: number) => void;
}

export function KanbanBoard({ projectId, onTaskClick, onAddTask }: KanbanBoardProps) {
  const { stages, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as number;

    // Find the task
    for (const stage of stages) {
      const task = stage.tasks?.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    const overId = over.id;

    // Find source stage and task
    let sourceStage: WorkflowStage | null = null;
    let task: Task | null = null;

    for (const stage of stages) {
      const foundTask = stage.tasks?.find((t) => t.id === taskId);
      if (foundTask) {
        sourceStage = stage;
        task = foundTask;
        break;
      }
    }

    if (!task || !sourceStage) return;

    // Determine target stage
    let targetStageId: number;
    let targetIndex: number;

    // Check if dropped on a stage
    const targetStage = stages.find((s) => s.id === overId);
    if (targetStage) {
      targetStageId = targetStage.id;
      targetIndex = targetStage.tasks?.length || 0;
    } else {
      // Dropped on another task
      for (const stage of stages) {
        const taskIndex = stage.tasks?.findIndex((t) => t.id === overId);
        if (taskIndex !== undefined && taskIndex !== -1) {
          targetStageId = stage.id;
          targetIndex = taskIndex;
          break;
        }
      }
    }

    if (targetStageId! === undefined) return;

    // Move task
    try {
      await moveTask(taskId, targetStageId!, targetIndex!);
    } catch (error) {
      console.error('Move task error:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            tasks={stage.tasks || []}
            onTaskClick={onTaskClick}
            onAddTask={() => onAddTask(stage.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
