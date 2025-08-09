import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, Send, Plus, Paperclip, Image as ImageIcon, Smile, Mic } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface User {
  id: string;
  full_name: string;
  role: string;
}

interface Message {
  id: string;
  content: string;
  from_user: string;
  from_name: string;
  from_role: string;
  created_at: string;
}

interface SimpleChatProps {
  className?: string;
}

export function SimpleChat({ className }: SimpleChatProps) {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const [effectiveRole, setEffectiveRole] = useState<UserRole | null>(role ?? null);

  const targetRole = effectiveRole === 'student' ? 'teacher' : 'student';
  const targetRolePlural = targetRole === 'teacher' ? 'Teachers' : 'Students';

  // Stable 1:1 room id to avoid re-subscribing on token refresh (underscore avoids UUID hyphen conflicts)
  const chatId = useMemo(() => {
    if (!user || !selectedUser) return null
    return [user.id, selectedUser.id].sort().join('_')
  }, [user?.id, selectedUser?.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load current role from DB if missing and then load users
  useEffect(() => {
    if (!user) return;
    if (role) {
      setEffectiveRole(role as UserRole);
      return;
    }
    const supabase = createClient();
    supabase.rpc('get_current_user_role').then(({ data }) => {
      if (data) setEffectiveRole(data as UserRole);
    });
  }, [user, role]);

  // Load users
  useEffect(() => {
    async function fetchUsers() {
      if (!user || !effectiveRole) return;

      const supabase = createClient();
      const { data } = await supabase
        .rpc('get_available_chat_users', { target_role_param: targetRole })

      setUsers(data || []);
    }
    fetchUsers();
  }, [user, targetRole, effectiveRole]);

  // Subscribe to global presence map and track online users by user.id
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('presence-online', {
      config: { presence: { key: user?.id || 'anon' } },
    })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, any>
        const map: Record<string, boolean> = {}
        Object.keys(state).forEach((uid) => {
          map[uid] = (state[uid]?.length ?? 0) > 0
        })
        setOnlineMap(map)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          const displayName = user.user_metadata?.full_name || user.email
          await channel.track({ user: { id: user.id, name: displayName, role: effectiveRole }, online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, effectiveRole])

  // Load recent conversations
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    let cancelled = false
    const loadConversations = async () => {
      const { data } = await supabase.rpc('get_user_conversations', { limit_param: 20 })
      if (!cancelled) setConversations(data || [])
    }
    loadConversations()
    return () => { cancelled = true }
  }, [user?.id])

  // Handle user selection and setup chat
  useEffect(() => {
    if (!chatId || !user || !selectedUser) return;

    const supabase = createClient();
    let cleanupAuth: (() => void) | undefined;
    let cancelled = false;

    const init = async () => {
      // Ensure Realtime is authenticated with the current access token BEFORE subscribing
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        supabase.realtime.setAuth(token);
      }
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        const t = session?.access_token;
        if (t) supabase.realtime.setAuth(t);
      });
      cleanupAuth = () => listener.subscription.unsubscribe();

      // Cleanup previous channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      // Load message history (from Supabase RPC for joined sender info)
      async function loadMessages() {
        // Primary (underscore) + legacy hyphen fallback
        const primaryRoom = `private-${chatId}`
        const legacyRoom = selectedUser && user
          ? `private-${[user.id, selectedUser.id].sort().join('-')}`
          : ''

    const resPrimary = await supabase.rpc('get_chat_messages', { room_name_param: primaryRoom, limit_param: 100 })
        const resLegacy = legacyRoom
          ? await supabase.rpc('get_chat_messages', { room_name_param: legacyRoom, limit_param: 100 })
          : { data: [] as any[] }

        const rows = [...(resPrimary.data || []), ...(resLegacy.data || [])]
        const dedup = rows.filter((m, i, arr) => i === arr.findIndex(x => x.id === m.id))
        const formattedMessages = dedup
          .map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            from_user: msg.sender_id,
            from_name: msg.sender_name,
            from_role: msg.sender_role,
            created_at: msg.created_at || new Date().toISOString(),
          }))
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        if (!cancelled) setMessages(formattedMessages)
      }

      // Setup realtime channel
      // Channel name must match RLS policy expectations: it must start with "private-"
      const channel = supabase.channel(`private-${chatId}`, {
        config: {
          // Echo our own broadcasts so the sender immediately sees their message
          broadcast: { self: true },
        },
      })
        .on('broadcast', { event: 'message' }, (payload) => {
          const msg = payload.payload as any
          setMessages(prev => [...prev, {
            id: msg.id,
            content: msg.content,
            from_user: msg.from_user,
            from_name: msg.from_name ?? (msg.from_user === user.id ? (user.user_metadata?.full_name || user.email) : selectedUser.full_name),
            from_role: msg.from_role,
            created_at: msg.created_at
          }])
        })
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      channelRef.current = channel;
      await loadMessages();
    };

    init();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      cancelled = true;
      // Cleanup auth subscription
      cleanupAuth?.();
    };
  }, [chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user || !channelRef.current || !effectiveRole) return;

    const supabase = createClient();
    const chatId = [user.id, selectedUser.id].sort().join('_');
    const messageId = crypto.randomUUID();
    
    const messageData = {
      id: messageId,
      content: newMessage,
      from_user: user.id,
      from_name: user.user_metadata?.full_name || user.email,
      from_role: effectiveRole,
      created_at: new Date().toISOString()
    };

    // Save to database
    const { error: insertError } = await supabase.from('chat_messages').insert({
      room_name: `private-${chatId}`,
      sender_id: user.id,
      sender_role: effectiveRole as UserRole,
      content: newMessage,
      sequence_number: Date.now()
    });
    if (insertError) {
      console.error('Failed to save message:', insertError)
      // Reload messages to reflect server state even after failure
      const { data } = await supabase
        .rpc('get_chat_messages', { room_name_param: `private-${chatId}`, limit_param: 50 })
      if (data) {
        setMessages(data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          from_user: msg.sender_id,
          from_name: msg.sender_name,
          from_role: msg.sender_role,
          created_at: msg.created_at || new Date().toISOString(),
        })))
      }
      return
    }

    // Broadcast to other user
    await channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: messageData
    });

    setNewMessage('');
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Determine presence status for the selected user using the global presence map
  const isSelectedUserOnline = selectedUser ? onlineMap[selectedUser.id] === true : false;

  return (
    <div className={className}>
      <div className="grid h-full gap-4 md:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <Card className="h-full overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Favorites</CardTitle>
              <Button variant="outline" size="sm" className="gap-2"><Plus className="h-4 w-4" />Add New</Button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-260px)]">
              {conversations.length > 0 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-muted-foreground">Recent</p>
                </div>
              )}
              <div className="px-2 space-y-1">
                {conversations.map((c) => (
                  <button
                    key={c.room_name}
                    onClick={() => setSelectedUser({ id: c.other_user_id, full_name: c.other_full_name, role: c.other_role })}
                    className="w-full rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {c.other_full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">{c.other_full_name}</p>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs text-muted-foreground">All {targetRolePlural}</p>
              </div>
              <div className="px-2 space-y-1 pb-4">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className="w-full rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {u.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                      </div>
                      <div className={`ml-auto w-2 h-2 rounded-full ${onlineMap[u.id] ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat panel */}
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {selectedUser?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-base truncate">{selectedUser ? selectedUser.full_name : 'Select a conversation'}</CardTitle>
                {selectedUser && (
                  <p className="text-xs text-muted-foreground capitalize flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${isSelectedUserOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {isSelectedUserOnline ? 'Active now' : 'Offline'} · {selectedUser.role}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {selectedUser && messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.from_user === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.from_user === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p>{msg.content}</p>
                      <p className="text-[10px] opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                {!selectedUser && (
                  <div className="h-full grid place-items-center text-sm text-muted-foreground">Choose someone from the list to start chatting.</div>
                )}
              </div>
              {/* Input */}
              <form onSubmit={sendMessage} className="border-t p-3 flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="shrink-0" disabled={!selectedUser || !isConnected}><Paperclip className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="shrink-0" disabled={!selectedUser || !isConnected}><ImageIcon className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="shrink-0" disabled={!selectedUser || !isConnected}><Smile className="h-4 w-4" /></Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type message..."
                  disabled={!selectedUser || !isConnected}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon" className="shrink-0" disabled={!selectedUser || !isConnected}><Mic className="h-4 w-4" /></Button>
                <Button type="submit" disabled={!newMessage.trim() || !selectedUser || !isConnected} size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}