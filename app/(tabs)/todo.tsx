import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { IconGlyph } from '@/components/IconGlyph';
import { useTodoStore, type TodoList } from '@/store/useTodoStore';
import AdBanner from '@/components/AdBanner';

const LIST_COLORS = ['#9C89EA', '#FF8266', '#6BCB77', '#FFD93D', '#3AB2DC', '#F4A261', '#E88DC7', '#60C5A8'];
const LIST_EMOJIS = ['✅', '🛒', '💰', '📝', '🏠', '💼', '📅', '🎯', '🧘', '📖'];

export default function TodoTab() {
  const theme = useTheme();
  const lists = useTodoStore((s) => s.lists);
  const items = useTodoStore((s) => s.items);
  const addList = useTodoStore((s) => s.addList);
  const removeList = useTodoStore((s) => s.removeList);

  const totalToday = items.filter((i) => i.isMyDay && !i.completed).length;
  const totalOpen = items.filter((i) => !i.completed).length;

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState(LIST_COLORS[0]);
  const [newEmoji, setNewEmoji] = useState('✅');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const id = addList(newTitle.trim(), newColor, newEmoji);
    setNewTitle('');
    setShowCreate(false);
    router.push(`/todo/${id}`);
  };

  const handleLongPress = (list: TodoList) => {
    if (['myday', 'tasks', 'shopping', 'bills', 'notes'].includes(list.id)) return;
    Alert.alert(`Delete "${list.title}"?`, 'All tasks in this list will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeList(list.id) },
    ]);
  };

  const visibleLists = lists.filter((l) => l.id !== 'myday');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingHorizontal: 22, paddingTop: 22, paddingBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.textPrimary, fontSize: 30, fontWeight: '800' }}>Tasks</Text>
            <View style={{ backgroundColor: theme.teal.soft, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: theme.teal.base + '50' }}>
              <Text style={{ color: theme.teal.base, fontSize: 13, fontWeight: '700' }}>{totalOpen} open</Text>
            </View>
          </View>
        </View>

        {/* My Day hero card */}
        <View style={{ paddingHorizontal: 22, marginTop: 18 }}>
          <Pressable
            onPress={() => router.push('/todo/myday')}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <View style={{
              borderRadius: 24,
              backgroundColor: theme.teal.soft,
              borderWidth: 1.5,
              borderColor: theme.teal.base + '55',
              padding: 22,
              overflow: 'hidden',
            }}>
              <View style={{ position: 'absolute', right: -24, top: -24, width: 130, height: 130, borderRadius: 65, backgroundColor: theme.teal.base + '10' }} />
              <View style={{ position: 'absolute', right: 30, bottom: -10, width: 70, height: 70, borderRadius: 35, backgroundColor: theme.teal.base + '08' }} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Text style={{ fontSize: 24 }}>☀️</Text>
                    <Text style={{ color: theme.teal.base, fontSize: 17, fontWeight: '800', letterSpacing: 0.2 }}>My Day</Text>
                  </View>
                  <Text style={{ color: theme.textPrimary, fontSize: 40, fontWeight: '800', lineHeight: 44 }}>{totalToday}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>
                    {totalToday === 0 ? 'No tasks planned — add some focus tasks' : `task${totalToday !== 1 ? 's' : ''} for today`}
                  </Text>
                </View>
                <View style={{ backgroundColor: theme.teal.base, borderRadius: 16, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <IconGlyph name="chevronRight" size={18} color="#fff" />
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        <AdBanner style={{ marginHorizontal: 22, marginTop: 16 }} />

        {/* My Lists grid */}
        <View style={{ paddingHorizontal: 22, marginTop: 28 }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 16 }}>MY LISTS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {visibleLists.map((list) => {
              const count = items.filter((i) => i.listId === list.id && !i.completed).length;
              const completed = items.filter((i) => i.listId === list.id && i.completed).length;
              const total = count + completed;
              const progress = total > 0 ? completed / total : 0;
              return (
                <Pressable
                  key={list.id}
                  onPress={() => router.push(`/todo/${list.id}`)}
                  onLongPress={() => handleLongPress(list)}
                  style={({ pressed }) => ({
                    width: '47%',
                    backgroundColor: theme.card,
                    borderRadius: 22,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: theme.border,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: list.color + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Text style={{ fontSize: 22 }}>{list.emoji}</Text>
                  </View>
                  <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 8 }} numberOfLines={1}>{list.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3, marginBottom: 12 }}>
                    <Text style={{ color: list.color, fontSize: 28, fontWeight: '800' }}>{count}</Text>
                    {total > 0 && <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '500' }}>/ {total}</Text>}
                  </View>
                  <View style={{ height: 3, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${Math.round(progress * 100)}%`, backgroundColor: list.color, borderRadius: 2 }} />
                  </View>
                </Pressable>
              );
            })}

            {/* New list card */}
            <Pressable
              onPress={() => setShowCreate(true)}
              style={({ pressed }) => ({
                width: '47%',
                borderRadius: 22,
                padding: 18,
                borderWidth: 1.5,
                borderColor: theme.teal.base + '45',
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 150,
                opacity: pressed ? 0.7 : 1,
                backgroundColor: theme.teal.soft + '30',
              })}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.teal.soft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <IconGlyph name="plus" size={22} color={theme.teal.base} />
              </View>
              <Text style={{ color: theme.teal.base, fontSize: 14, fontWeight: '700' }}>New List</Text>
            </Pressable>
          </View>
        </View>

        <AdBanner style={{ marginHorizontal: 22, marginTop: 24 }} />
      </ScrollView>

      {/* Create list bottom sheet */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} onPress={() => setShowCreate(false)} />
        <View style={{
          backgroundColor: theme.card,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingHorizontal: 24,
          paddingTop: 14,
          paddingBottom: 44,
        }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border, alignSelf: 'center', marginBottom: 22 }} />
          <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 22 }}>New List</Text>

          <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>COLOR</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
            {LIST_COLORS.map((c) => (
              <Pressable key={c} onPress={() => setNewColor(c)} style={{
                width: 34, height: 34, borderRadius: 17, backgroundColor: c,
                borderWidth: newColor === c ? 3 : 1.5,
                borderColor: newColor === c ? theme.textPrimary : 'transparent',
              }} />
            ))}
          </View>

          <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>ICON</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
            {LIST_EMOJIS.map((e) => (
              <Pressable key={e} onPress={() => setNewEmoji(e)} style={{
                width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
                backgroundColor: newEmoji === e ? newColor + '25' : theme.cardAlt,
                borderWidth: 1.5,
                borderColor: newEmoji === e ? newColor : 'transparent',
              }}>
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>NAME</Text>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="e.g. Groceries, Work, Projects…"
            placeholderTextColor={theme.textMuted}
            style={{
              backgroundColor: theme.cardAlt,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 15,
              color: theme.textPrimary,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 22,
              borderWidth: 1.5,
              borderColor: newTitle.trim() ? newColor + '70' : 'transparent',
            }}
            autoFocus
            onSubmitEditing={handleCreate}
            returnKeyType="done"
          />

          <Pressable
            onPress={handleCreate}
            style={({ pressed }) => ({
              backgroundColor: newTitle.trim() ? newColor : theme.cardAlt,
              borderRadius: 18,
              padding: 17,
              alignItems: 'center',
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text style={{ color: newTitle.trim() ? '#fff' : theme.textMuted, fontSize: 16, fontWeight: '800' }}>Create List</Text>
          </Pressable>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
