import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, Animated } from 'react-native';
import { Button, Card, Text, Avatar, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Step = 'start' | 'addHabit' | 'changeUsername' | 'aboutApp' | 'done' | 'loop';

export default function Assistant() {
  const [step, setStep] = useState<Step>('start');
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);

  // Simple fade-in effect when the message changes
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    if (step === 'done') {
      const timer = setTimeout(() => router.replace('/profile' as any), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const renderMessage = () => {
    switch (step) {
      case 'start': return "Hello! I'm your habit assistant. How can I help you level up today? 👋";
      case 'loop': return "I'm still here! What else do you need to know? 😏";
      case 'addHabit': return "Easy! Go to the 'Add' tab ➕, pick a habit (like 'Drink Water'), and hit Create. It will appear on your Home screen instantly.";
      case 'changeUsername': return "Head over to Settings ⚙️. You can tap your name at the top to edit it. We'll remember you!";
      case 'aboutApp': return "This app is built to help you crush your goals. No fluff, just discipline. track daily and watch your progress climb! 🚀";
      case 'done': return "Awesome. Redirecting you back to your profile now. Go get 'em! 🔥";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* BOT HEADER */}
        <View style={styles.botInfo}>
          <Surface style={styles.avatarSurface} elevation={2}>
            <Avatar.Icon size={60} icon="robot" backgroundColor="#615EFC" />
            <View style={styles.onlineDot} />
          </Surface>
          <Text style={styles.botName}>Habit Bot</Text>
          <Text style={styles.botStatus}>Online & Ready</Text>
        </View>

        {/* CHAT BUBBLE */}
        <Animated.View style={[styles.messageWrapper, { opacity: fadeAnim }]}>
          <View style={styles.chatBubble}>
            <Text style={styles.messageText}>{renderMessage()}</Text>
            <View style={styles.bubbleTail} />
          </View>
        </Animated.View>

        {/* OPTIONS AREA */}
        <View style={styles.optionsWrapper}>
          {(step === 'start' || step === 'loop') && (
            <>
              <Button mode="contained" onPress={() => setStep('addHabit')} style={styles.mainBtn} contentStyle={styles.btnContent} icon="plus-circle">
                How to add a habit
              </Button>
              <Button mode="contained" onPress={() => setStep('changeUsername')} style={styles.mainBtn} contentStyle={styles.btnContent} icon="cog">
                Change username
              </Button>
              <Button mode="contained" onPress={() => setStep('aboutApp')} style={styles.mainBtn} contentStyle={styles.btnContent} icon="information">
                About the app
              </Button>
            </>
          )}

          {(['addHabit', 'changeUsername', 'aboutApp'].includes(step)) && (
            <>
              <Button mode="contained" onPress={() => setStep('done')} style={styles.doneBtn} icon="check">
                Thanks, I'm good!
              </Button>
              <Button mode="outlined" onPress={() => setStep('loop')} style={styles.loopBtn} textColor="#615EFC">
                Another question
              </Button>
            </>
          )}

          {step === 'done' && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Closing chat...</Text>
            </View>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  
  botInfo: { alignItems: 'center', marginBottom: 40 },
  avatarSurface: { borderRadius: 40, padding: 2, position: 'relative' },
  onlineDot: { 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    backgroundColor: '#10B981', 
    borderWidth: 2, 
    borderColor: '#FFF' 
  },
  botName: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 12 },
  botStatus: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },

  messageWrapper: { alignItems: 'center', marginBottom: 40 },
  chatBubble: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    width: '100%',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  messageText: { fontSize: 17, color: '#334155', lineHeight: 24, textAlign: 'center' },
  bubbleTail: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
    zIndex: -1,
  },

  optionsWrapper: { gap: 12 },
  mainBtn: { borderRadius: 16, backgroundColor: '#615EFC' },
  btnContent: { height: 50, flexDirection: 'row-reverse' },
  doneBtn: { borderRadius: 16, backgroundColor: '#10B981' },
  loopBtn: { borderRadius: 16, borderColor: '#615EFC', borderWidth: 1.5 },
  
  loadingContainer: { alignItems: 'center', marginTop: 20 },
  loadingText: { color: '#94A3B8', fontStyle: 'italic' },
});