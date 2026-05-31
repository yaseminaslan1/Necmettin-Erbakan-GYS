'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task } from '@/types';
import { formatDate, getPriorityColor, getPriorityLabel, getInitials, isOverdue } from '@/lib/utils';
import { Calendar, MessageSquare } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-task ${isDragging ? 'dragging' : ''}`}
    >
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                {task.title}
              </h4>
              <Badge className={`ml-2 ${getPriorityColor(task.priority)} text-xs`}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>

            {task.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                {task.due_date && (
                  <div
                    className={`flex items-center text-xs ${
                      isOverdue(task.due_date) ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(task.due_date)}
                  </div>
                )}
              </div>

              {task.assignee_id && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee_avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(task.assignee_name || 'U')}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
