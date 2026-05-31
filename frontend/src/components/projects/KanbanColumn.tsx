'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { TaskCard } from '../tasks/TaskCard';
import { Task, WorkflowStage } from '@/types';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  stage: WorkflowStage;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

export function KanbanColumn({ stage, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div
        className="rounded-lg bg-gray-100 p-3"
        style={{ borderTop: `3px solid ${stage.color}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onAddTask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div
          ref={setNodeRef}
          className={`kanban-column space-y-2 min-h-[200px] ${
            isOver ? 'bg-gray-200 rounded-lg' : ''
          }`}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              Görev yok
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
