import React, { useState, useRef } from 'react';
import { 
  StyleSheet, View, TextInput, ScrollView, 
  KeyboardAvoidingView, Platform, TouchableOpacity, StatusBar 
} from 'react-native';
import { Avatar, Text, Surface, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

export default function Assistant() {
  const { colors, isDarkMode } = useTheme();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial-1', text: "Yo! I'm your Daily Grind AI. What's the mission today? 🚀", sender: 'bot' }
  ]);
  
  const scrollViewRef = useRef<ScrollView>(null);
  // ⚠️ GENERATE A NEW KEY AND PUT IT HERE 
  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

  const getAIResponse = async (userText: string) => {
    setLoading(true);
    try {
      const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ 
          text: `You are the Daily Grind AI coach. 
                 Keep it short, hype the user up, and use emojis. 
                 User message: ${userText}` 
        }]
      }]
    })
  }
);

      const data = await response.json();

      // Check if Google sent an error (like 400, 403, etc.)
      if (data.error) {
        console.error("GOOGLE API ERROR:", data.error.message);
        throw new Error(data.error.message);
      }

      // Check if the response was blocked by safety filters
      const candidate = data?.candidates?.[0];
      if (candidate?.finishReason === "SAFETY") {
        const botMsg = "I can't talk about that. Let's stay focused on your goals! 🎯";
        setMessages(prev => [...prev, { id: `bot-${Date.now()}`, text: botMsg, sender: 'bot' }]);
        return;
      }

      const botResponse = candidate?.content?.parts?.[0]?.text || "I'm stuck... try asking that differently! 🤔";
      setMessages(prev => [...prev, { id: `bot-${Date.now()}`, text: botResponse.trim(), sender: 'bot' }]);

    } catch (err: any) {
      console.error("FETCH ERROR:", err);
      const errorMsg = err.message.includes("API key not valid") 
        ? "Invalid API Key. Check your setup! 🔑" 
        : "Connection lost. Try again! ⚡";
        
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, text: errorMsg, sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || loading) return;

    const userMsg: Message = { id: `user-${Date.now()}`, text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    const tempInput = inputText;
    setInputText(''); 
    getAIResponse(tempInput);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Avatar.Icon size={40} icon="robot" backgroundColor={colors.primary} />
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.botName, { color: colors.text }]}>Grind AI</Text>
          <Text style={styles.onlineStatus}>Online</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.msgWrapper, msg.sender === 'user' ? styles.userAlign : styles.botAlign]}>
              <Surface 
                style={[
                  styles.bubble, 
                  msg.sender === 'user' 
                    ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 } 
                    : { backgroundColor: colors.card, borderBottomLeftRadius: 4 }
                ]}
                elevation={1}
              >
                <Text style={[styles.msgText, { color: msg.sender === 'user' ? '#FFF' : colors.text }]}>
                  {msg.text}
                </Text>
              </Surface>
            </View>
          ))}
          {loading && (
             <View style={styles.botAlign}>
                <ActivityIndicator color={colors.primary} style={{ marginLeft: 10, marginTop: 5 }} />
             </View>
          )}
        </ScrollView>

        <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.divider }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.subtext}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend} 
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : colors.divider }]}
            disabled={!inputText.trim()}
          >
            <MaterialCommunityIcons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', padding: 16, alignItems: 'center', borderBottomWidth: 1 },
  botName: { fontSize: 18, fontWeight: 'bold' },
  onlineStatus: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  chatList: { padding: 20, paddingBottom: 30 },
  msgWrapper: { marginBottom: 15, maxWidth: '85%' },
  userAlign: { alignSelf: 'flex-end' },
  botAlign: { alignSelf: 'flex-start' },
  bubble: { padding: 14, borderRadius: 18 },
  msgText: { fontSize: 16, lineHeight: 22 },
  inputRow: { 
    flexDirection: 'row', 
    padding: 12, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 12, 
    alignItems: 'center', 
    borderTopWidth: 1 
  },
  input: { flex: 1, fontSize: 16, maxHeight: 100, paddingHorizontal: 12, paddingTop: 8 },
  sendBtn: { width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});