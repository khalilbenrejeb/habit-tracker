import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';

const router = useRouter();

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title="Your Name"
          subtitle="Your Email"
          left={(props) => <Avatar.Text {...props} label="YN" />}
        />
        <Card.Content>
          <Text>Welcome to your profile!</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => alert('Edit Profile')}>
            Edit
          </Button>
        </Card.Actions>
         <Card style={styles.card}>
        <Card.Content>
          <ThemedText>Need help using the app?</ThemedText>
        </Card.Content>

        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => router.push('/assistant')}
          >
            Open Assistant
          </Button>
        </Card.Actions>
      </Card>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%' },
});