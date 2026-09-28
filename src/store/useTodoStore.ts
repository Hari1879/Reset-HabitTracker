import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/lib/id';

export type Priority = 'none' | 'low' | 'medium' | 'high';

export interface TodoStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  priority: Priority;
  isMyDay: boolean;
  dueDate?: string;       // ISO date string yyyy-MM-dd
  reminderAt?: string;    // ISO datetime
  notes?: string;
  steps: TodoStep[];
  createdAt: string;
}

export interface TodoList {
  id: string;
  title: string;
  color: string;
  emoji: string;
  createdAt: string;
}

const DEFAULT_LISTS: TodoList[] = [
  { id: 'myday',    title: 'My Day',      color: '#2FBFAE', emoji: '☀️', createdAt: new Date().toISOString() },
  { id: 'tasks',    title: 'Tasks',        color: '#7B68EE', emoji: '✅', createdAt: new Date().toISOString() },
  { id: 'shopping', title: 'Shopping',     color: '#FF6B6B', emoji: '🛒', createdAt: new Date().toISOString() },
  { id: 'bills',    title: 'Bills',        color: '#FFD93D', emoji: '💰', createdAt: new Date().toISOString() },
  { id: 'notes',    title: 'Notes',        color: '#6BCB77', emoji: '📝', createdAt: new Date().toISOString() },
];

interface TodoState {
  lists: TodoList[];
  items: TodoItem[];

  addList: (title: string, color: string, emoji: string) => string;
  updateList: (id: string, patch: Partial<Pick<TodoList, 'title' | 'color' | 'emoji'>>) => void;
  removeList: (id: string) => void;

  addItem: (listId: string, title: string) => string;
  updateItem: (id: string, patch: Partial<Omit<TodoItem, 'id' | 'listId' | 'steps' | 'createdAt'>>) => void;
  toggleComplete: (id: string) => void;
  removeItem: (id: string) => void;
  toggleMyDay: (id: string) => void;

  addStep: (itemId: string, title: string) => void;
  toggleStep: (itemId: string, stepId: string) => void;
  removeStep: (itemId: string, stepId: string) => void;

  itemsForList: (listId: string) => TodoItem[];
  myDayItems: () => TodoItem[];
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      lists: DEFAULT_LISTS,
      items: [],

      addList: (title, color, emoji) => {
        const id = generateId('list');
        set((s) => ({ lists: [...s.lists, { id, title, color, emoji, createdAt: new Date().toISOString() }] }));
        return id;
      },

      updateList: (id, patch) =>
        set((s) => ({ lists: s.lists.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),

      removeList: (id) =>
        set((s) => ({ lists: s.lists.filter((l) => l.id !== id), items: s.items.filter((i) => i.listId !== id) })),

      addItem: (listId, title) => {
        const id = generateId('todo');
        const isMyDay = listId === 'myday';
        set((s) => ({
          items: [...s.items, {
            id, listId: isMyDay ? 'tasks' : listId, title, completed: false,
            priority: 'none', isMyDay, steps: [], createdAt: new Date().toISOString(),
          }],
        }));
        return id;
      },

      updateItem: (id, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),

      toggleComplete: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date().toISOString() : undefined } : i,
          ),
        })),

      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      toggleMyDay: (id) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, isMyDay: !i.isMyDay } : i)) })),

      addStep: (itemId, title) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === itemId
              ? { ...i, steps: [...i.steps, { id: generateId('step'), title, completed: false }] }
              : i,
          ),
        })),

      toggleStep: (itemId, stepId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === itemId
              ? { ...i, steps: i.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s)) }
              : i,
          ),
        })),

      removeStep: (itemId, stepId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === itemId ? { ...i, steps: i.steps.filter((s) => s.id !== stepId) } : i,
          ),
        })),

      itemsForList: (listId) => {
        if (listId === 'myday') return get().items.filter((i) => i.isMyDay);
        return get().items.filter((i) => i.listId === listId);
      },

      myDayItems: () => get().items.filter((i) => i.isMyDay && !i.completed),
    }),
    {
      name: 'reset:todoStore',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
