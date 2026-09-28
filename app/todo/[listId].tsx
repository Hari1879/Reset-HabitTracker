import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/theme';
import { IconGlyph } from '@/components/IconGlyph';
import { useTodoStore, type TodoItem, type Priority } from '@/store/useTodoStore';

const PRIORITY_COLORS: Record<Priority, string> = {
  none: 'transparent',
  low: '#6BCB77',
  medium: '#E8B85B',
  high: '#FF6B6B',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  none: 'Priority',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function TodoListDetail() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const theme = useTheme();

  const lists = useTodoStore((s) => s.lists);
  const items = useTodoStore((s) => s.items);
  const addItem = useTodoStore((s) => s.addItem);
  const toggleComplete = useTodoStore((s) => s.toggleComplete);
  const removeItem = useTodoStore((s) => s.removeItem);
  const updateItem = useTodoStore((s) => s.updateItem);
  const toggleMyDay = useTodoStore((s) => s.toggleMyDay);
  const addStep = useTodoStore((s) => s.addStep);
  const toggleStep = useTodoStore((s) => s.toggleStep);
  const removeStep = useTodoStore((s) => s.removeStep);

  const list = lists.find((l) => l.id === listId) ?? { id: listId, title: 'Tasks', color: theme.teal.base, emoji: '✅', createdAt: '' };
  const isMyDay = listId === 'myday';

  const listItems = isMyDay
    ? items.filter((i) => i.isMyDay)
    : items.filter((i) => i.listId === listId);

  const active = listItems.filter((i) => !i.completed);
  const done = listItems.filter((i) => i.completed);
  const totalCount = active.length + done.length;
  const progress = totalCount > 0 ? done.length / totalCount : 0;

  const [newTaskText, setNewTaskText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [addingStepFor, setAddingStepFor] = useState<string | null>(null);
  const [stepDraft, setStepDraft] = useState('');
  const [showDone, setShowDone] = useState(false);

  const handleAdd = () => {
    if (!newTaskText.trim()) return;
    addItem(listId, newTaskText.trim());
    setNewTaskText('');
  };

  const handleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setEditingNotes(null);
    setAddingStepFor(null);
  };

  const handleDeleteItem = (item: TodoItem) => {
    Alert.alert(`Delete "${item.title}"?`, '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removeItem(item.id); if (expandedId === item.id) setExpandedId(null); } },
    ]);
  };

  const handleSaveNotes = (id: string) => {
    updateItem(id, { notes: notesDraft });
    setEditingNotes(null);
  };

  const handleAddStep = (itemId: string) => {
    if (!stepDraft.trim()) return;
    addStep(itemId, stepDraft.trim());
    setStepDraft('');
    setAddingStepFor(null);
  };

  const cyclePriority = (item: TodoItem) => {
    const order: Priority[] = ['none', 'low', 'medium', 'high'];
    const next = order[(order.indexOf(item.priority) + 1) % order.length];
    updateItem(item.id, { priority: next });
  };

  const accentColor = isMyDay ? theme.teal.base : list.color;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 12, width: 36, height: 36, borderRadius: 12, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border }}>
              <IconGlyph name="chevronLeft" size={18} color={theme.textSecondary} />
            </Pressable>
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: accentColor + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 20 }}>{list.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 21, fontWeight: '800' }} numberOfLines={1}>{list.title}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 1 }}>
                {active.length > 0 ? `${active.length} remaining` : done.length > 0 ? 'All done!' : 'No tasks yet'}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          {totalCount > 0 && (
            <View style={{ marginTop: 14, marginBottom: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '600' }}>{done.length} completed</Text>
                <Text style={{ color: accentColor, fontSize: 11, fontWeight: '700' }}>{Math.round(progress * 100)}%</Text>
              </View>
              <View style={{ height: 4, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${Math.round(progress * 100)}%`, backgroundColor: accentColor, borderRadius: 3 }} />
              </View>
            </View>
          )}

          <View style={{ height: 1, backgroundColor: theme.divider, marginTop: 14 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* Active tasks */}
          {active.map((item) => (
            <TaskRow
              key={item.id}
              item={item}
              accentColor={accentColor}
              theme={theme}
              expanded={expandedId === item.id}
              editingNotes={editingNotes === item.id}
              notesDraft={notesDraft}
              addingStep={addingStepFor === item.id}
              stepDraft={stepDraft}
              onExpand={() => handleExpand(item.id)}
              onToggle={() => toggleComplete(item.id)}
              onDelete={() => handleDeleteItem(item)}
              onCyclePriority={() => cyclePriority(item)}
              onToggleMyDay={() => toggleMyDay(item.id)}
              isMyDay={isMyDay}
              onStartNotes={() => { setEditingNotes(item.id); setNotesDraft(item.notes ?? ''); }}
              onNotesChange={setNotesDraft}
              onSaveNotes={() => handleSaveNotes(item.id)}
              onStartStep={() => { setAddingStepFor(item.id); setStepDraft(''); }}
              onStepChange={setStepDraft}
              onAddStep={() => handleAddStep(item.id)}
              onToggleStep={(stepId) => toggleStep(item.id, stepId)}
              onRemoveStep={(stepId) => removeStep(item.id, stepId)}
            />
          ))}

          {active.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 52 }}>
              <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: accentColor + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 32 }}>{list.emoji}</Text>
              </View>
              <Text style={{ color: theme.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: 6 }}>
                {done.length > 0 ? 'All done!' : 'Nothing here yet'}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
                {done.length > 0 ? 'Great work. Add more tasks below.' : 'Tap the field below to add your first task.'}
              </Text>
            </View>
          )}

          {/* Completed section */}
          {done.length > 0 && (
            <>
              <Pressable
                onPress={() => setShowDone((v) => !v)}
                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 22, marginBottom: 10, paddingVertical: 4 }}
              >
                <View style={{ flex: 1, height: 1, backgroundColor: theme.divider, marginRight: 12 }} />
                <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>COMPLETED {done.length}</Text>
                <View style={{ marginLeft: 8 }}>
                  <IconGlyph name={showDone ? 'chevronLeft' : 'chevronRight'} size={14} color={theme.textMuted} />
                </View>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.divider, marginLeft: 12 }} />
              </Pressable>
              {showDone && done.map((item) => (
                <TaskRow
                  key={item.id}
                  item={item}
                  accentColor={accentColor}
                  theme={theme}
                  expanded={false}
                  editingNotes={false}
                  notesDraft=""
                  addingStep={false}
                  stepDraft=""
                  onExpand={() => {}}
                  onToggle={() => toggleComplete(item.id)}
                  onDelete={() => handleDeleteItem(item)}
                  onCyclePriority={() => {}}
                  onToggleMyDay={() => {}}
                  isMyDay={isMyDay}
                  onStartNotes={() => {}}
                  onNotesChange={() => {}}
                  onSaveNotes={() => {}}
                  onStartStep={() => {}}
                  onStepChange={() => {}}
                  onAddStep={() => {}}
                  onToggleStep={() => {}}
                  onRemoveStep={() => {}}
                />
              ))}
            </>
          )}
        </ScrollView>

        {/* Add task bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingVertical: 10,
          backgroundColor: theme.card,
          borderTopWidth: 1, borderTopColor: theme.border,
          gap: 10,
        }}>
          <TextInput
            value={newTaskText}
            onChangeText={setNewTaskText}
            onSubmitEditing={handleAdd}
            placeholder={isMyDay ? 'Add to My Day…' : 'Add a task…'}
            placeholderTextColor={theme.textMuted}
            returnKeyType="done"
            style={{
              flex: 1,
              color: theme.textPrimary,
              fontSize: 15,
              backgroundColor: theme.cardAlt,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 11,
              borderWidth: 1,
              borderColor: newTaskText.trim() ? accentColor + '50' : 'transparent',
            }}
          />
          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: newTaskText.trim() ? accentColor : theme.cardAlt,
              alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <IconGlyph name="plus" size={20} color={newTaskText.trim() ? '#fff' : theme.textMuted} />
          </Pressable>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface TaskRowProps {
  item: TodoItem;
  accentColor: string;
  theme: any;
  expanded: boolean;
  editingNotes: boolean;
  notesDraft: string;
  addingStep: boolean;
  stepDraft: string;
  onExpand: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onCyclePriority: () => void;
  onToggleMyDay: () => void;
  isMyDay: boolean;
  onStartNotes: () => void;
  onNotesChange: (v: string) => void;
  onSaveNotes: () => void;
  onStartStep: () => void;
  onStepChange: (v: string) => void;
  onAddStep: () => void;
  onToggleStep: (stepId: string) => void;
  onRemoveStep: (stepId: string) => void;
}

function TaskRow({
  item, accentColor, theme, expanded, editingNotes, notesDraft, addingStep, stepDraft,
  onExpand, onToggle, onDelete, onCyclePriority, onToggleMyDay, isMyDay,
  onStartNotes, onNotesChange, onSaveNotes, onStartStep, onStepChange, onAddStep,
  onToggleStep, onRemoveStep,
}: TaskRowProps) {
  const priorityColor = PRIORITY_COLORS[item.priority];
  const completedSteps = item.steps.filter((s) => s.completed).length;
  const hasPriority = item.priority !== 'none';

  return (
    <View style={{
      backgroundColor: theme.card,
      borderRadius: 18,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: expanded ? accentColor + '40' : theme.border,
      overflow: 'hidden',
      // Left accent stripe for priority
      borderLeftWidth: hasPriority ? 3.5 : 1,
      borderLeftColor: hasPriority ? priorityColor : theme.border,
    }}>
      <Pressable onPress={onExpand} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingRight: 14, paddingLeft: 14 }}>
        {/* Checkbox */}
        <Pressable
          onPress={onToggle}
          style={{
            width: 26, height: 26, borderRadius: 13, borderWidth: 2,
            borderColor: item.completed ? accentColor : theme.border,
            backgroundColor: item.completed ? accentColor : 'transparent',
            alignItems: 'center', justifyContent: 'center', marginRight: 12,
          }}
        >
          {item.completed && <IconGlyph name="check" size={13} color="#fff" strokeWidth={2.5} />}
        </Pressable>

        {/* Title + meta */}
        <View style={{ flex: 1 }}>
          <Text style={{
            color: item.completed ? theme.textMuted : theme.textPrimary,
            fontSize: 15, fontWeight: '600',
            textDecorationLine: item.completed ? 'line-through' : 'none',
          }}>
            {item.title}
          </Text>
          {(item.steps.length > 0 || item.dueDate || (item.isMyDay && !isMyDay)) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 }}>
              {item.steps.length > 0 && (
                <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '500' }}>
                  {completedSteps}/{item.steps.length} steps
                </Text>
              )}
              {item.dueDate && (
                <Text style={{ color: theme.gold.base, fontSize: 11, fontWeight: '500' }}>
                  📅 {item.dueDate}
                </Text>
              )}
              {item.isMyDay && !isMyDay && (
                <Text style={{ color: theme.teal.base, fontSize: 11, fontWeight: '500' }}>☀️ My Day</Text>
              )}
            </View>
          )}
        </View>

        <View style={{ marginLeft: 8, opacity: 0.5 }}>
          <IconGlyph name={expanded ? 'chevronLeft' : 'chevronRight'} size={15} color={theme.textMuted} />
        </View>
      </Pressable>

      {/* Expanded panel */}
      {expanded && !item.completed && (
        <View style={{ borderTopWidth: 1, borderTopColor: theme.divider, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 }}>

          {/* Steps list */}
          {item.steps.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              {item.steps.map((step) => (
                <View key={step.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7 }}>
                  <Pressable onPress={() => onToggleStep(step.id)} style={{
                    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
                    borderColor: step.completed ? accentColor : theme.border,
                    backgroundColor: step.completed ? accentColor : 'transparent',
                    alignItems: 'center', justifyContent: 'center', marginRight: 10,
                  }}>
                    {step.completed && <IconGlyph name="check" size={10} color="#fff" strokeWidth={2.5} />}
                  </Pressable>
                  <Text style={{
                    flex: 1, color: step.completed ? theme.textMuted : theme.textSecondary,
                    fontSize: 14, textDecorationLine: step.completed ? 'line-through' : 'none',
                  }}>
                    {step.title}
                  </Text>
                  <Pressable onPress={() => onRemoveStep(step.id)} style={{ padding: 4, marginLeft: 4 }}>
                    <IconGlyph name="close" size={13} color={theme.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Add step */}
          {addingStep ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TextInput
                value={stepDraft}
                onChangeText={onStepChange}
                onSubmitEditing={onAddStep}
                placeholder="Step title…"
                placeholderTextColor={theme.textMuted}
                autoFocus
                returnKeyType="done"
                style={{ flex: 1, color: theme.textPrimary, fontSize: 14, backgroundColor: theme.cardAlt, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9 }}
              />
              <Pressable onPress={onAddStep} style={{ marginLeft: 8, backgroundColor: accentColor, borderRadius: 11, padding: 9 }}>
                <IconGlyph name="check" size={16} color="#fff" strokeWidth={2.5} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={onStartStep} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <IconGlyph name="plus" size={14} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted, fontSize: 13, marginLeft: 6 }}>Add step</Text>
            </Pressable>
          )}

          {/* Notes */}
          <View style={{ marginBottom: 14 }}>
            {editingNotes ? (
              <>
                <TextInput
                  value={notesDraft}
                  onChangeText={onNotesChange}
                  placeholder="Add notes…"
                  placeholderTextColor={theme.textMuted}
                  multiline
                  autoFocus
                  textAlignVertical="top"
                  style={{ backgroundColor: theme.cardAlt, borderRadius: 12, padding: 12, color: theme.textPrimary, fontSize: 13, minHeight: 72, lineHeight: 20 }}
                />
                <Pressable onPress={onSaveNotes} style={{ marginTop: 8, alignSelf: 'flex-end', backgroundColor: accentColor + '20', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 }}>
                  <Text style={{ color: accentColor, fontWeight: '700', fontSize: 13 }}>Save</Text>
                </Pressable>
              </>
            ) : (
              <Pressable onPress={onStartNotes} style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.cardAlt, borderRadius: 12, padding: 12 }}>
                <IconGlyph name="edit" size={14} color={theme.textMuted} />
                <Text style={{ color: item.notes ? theme.textSecondary : theme.textMuted, fontSize: 13, marginLeft: 8, flex: 1, lineHeight: 19 }} numberOfLines={3}>
                  {item.notes || 'Add notes…'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Action pills */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable onPress={onCyclePriority} style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: hasPriority ? priorityColor + '18' : theme.cardAlt,
              borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
              borderWidth: 1, borderColor: hasPriority ? priorityColor + '50' : 'transparent',
            }}>
              {hasPriority && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: priorityColor }} />}
              <Text style={{ color: hasPriority ? priorityColor : theme.textMuted, fontSize: 12, fontWeight: '700' }}>
                {PRIORITY_LABELS[item.priority]}
              </Text>
            </Pressable>

            {!isMyDay && (
              <Pressable onPress={onToggleMyDay} style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                backgroundColor: item.isMyDay ? theme.teal.soft : theme.cardAlt,
                borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
                borderWidth: 1, borderColor: item.isMyDay ? theme.teal.base + '50' : 'transparent',
              }}>
                <Text style={{ fontSize: 12 }}>☀️</Text>
                <Text style={{ color: item.isMyDay ? theme.teal.base : theme.textMuted, fontSize: 12, fontWeight: '700' }}>
                  {item.isMyDay ? 'In My Day' : 'My Day'}
                </Text>
              </Pressable>
            )}

            <View style={{ flex: 1 }} />

            <Pressable onPress={onDelete} style={{ backgroundColor: '#FF6B6B18', borderRadius: 12, padding: 9, borderWidth: 1, borderColor: '#FF6B6B30' }}>
              <IconGlyph name="trash" size={15} color="#FF6B6B" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Completed item quick actions */}
      {expanded && item.completed && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 14, borderTopWidth: 1, borderTopColor: theme.divider, paddingTop: 12 }}>
          <Pressable onPress={onToggle} style={{ flex: 1, backgroundColor: theme.cardAlt, borderRadius: 12, padding: 11, alignItems: 'center' }}>
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>Uncomplete</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={{ backgroundColor: '#FF6B6B18', borderRadius: 12, padding: 11, paddingHorizontal: 16 }}>
            <IconGlyph name="trash" size={16} color="#FF6B6B" />
          </Pressable>
        </View>
      )}
    </View>
  );
}
