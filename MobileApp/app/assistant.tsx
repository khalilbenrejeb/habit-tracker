import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';

type Step =
  | 'start'
  | 'addHabit'
  | 'changeUsername'
  | 'aboutApp'
  | 'done'
  | 'loop';

export default function Assistant() {
  const [step, setStep] = useState<Step>('start');
  const router = useRouter();

  const goBackToProfile = () => {
    setStep('done');
    setTimeout(() => router.replace('/profile'), 1200);
  };

  const renderMessage = () => {
    switch (step) {
      case 'start':
        return 'Hello 👋 How can I help you?';
      case 'loop':
        return 'You here again huh 😏 How can I help now?';
      case 'addHabit':
        return 'To add a habit, go to the Add tab ➕, choose a task or create your own, then press Create.';
      case 'changeUsername':
        return 'To change username, open Settings ⚙️ inside Profile and edit your name.';
      case 'aboutApp':
        return 'This app helps you build discipline by tracking daily habits and keeping things simple.';
      case 'done':
        return 'Thanks for using the assistant 🚀';
    }
  };

  const renderOptions = () => {
    if (step === 'start' || step === 'loop') {
      return (
        <>
          <Button mode="contained" onPress={() => setStep('addHabit')} style={styles.btn}>
            How to add a habit
          </Button>
          <Button mode="contained" onPress={() => setStep('changeUsername')} style={styles.btn}>
            Change username
          </Button>
          <Button mode="contained" onPress={() => setStep('aboutApp')} style={styles.btn}>
            More about the app
          </Button>
        </>
      );
    }

    if (step === 'addHabit' || step === 'changeUsername' || step === 'aboutApp') {
      return (
        <>
          <Button mode="contained" onPress={() => setStep('done')}style={styles.btn}>
            Yes thank you
          </Button>
          <Button mode="outlined" onPress={() => setStep('loop')} style={styles.btn}>
            I have another question
          </Button>
        </>
      );
    }
    if (step === 'done') {
    return (
      <Button mode="outlined" onPress={() => setStep('loop')} style={styles.btn}>
        I actually have another question
      </Button>
    );
  }

    return null;
  };

  return (
    <View style={styles.container}>
      <Card style={styles.chat}>
        <Card.Content>
          <Text style={styles.text}>{renderMessage()}</Text>
        </Card.Content>
      </Card>

      <View style={styles.options}>{renderOptions()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  chat: {
    marginBottom: 30,
    borderRadius: 20,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
  },
  options: {
    gap: 12,
  },
  btn: {
    borderRadius: 12,
  },
});