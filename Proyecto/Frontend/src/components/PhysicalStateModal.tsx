import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { apiUrl } from '../config/api';
import GRButton from './GRButton';

interface PhysicalStateModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail: string;
  onSuccess: () => void;
  currentPhysicalState?: {
    date: string;
    height: number;
    weight: number;
  } | null;
}

export default function PhysicalStateModal({
  visible,
  onClose,
  userEmail,
  onSuccess,
  currentPhysicalState,
}: PhysicalStateModalProps) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPhysicalState) {
      setHeight(currentPhysicalState.height.toString());
      setWeight(currentPhysicalState.weight.toString());
      const dateObj = new Date(currentPhysicalState.date);
      setDate(dateObj.toISOString().split('T')[0]);
    } else {
      setHeight('');
      setWeight('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [currentPhysicalState, visible]);

  const handleSave = async () => {
    if (!height.trim() || !weight.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
      Alert.alert('Error', 'Height and weight must be positive numbers');
      return;
    }

    if (heightNum < 1.0 || heightNum > 2.5) {
      Alert.alert('Error', 'Height must be between 1.0 and 2.5 meters');
      return;
    }

    if (weightNum < 20 || weightNum > 300) {
      Alert.alert('Error', 'Weight must be between 20kg and 300kg');
      return;
    }

    try {
      setLoading(true);
      const resp = await fetch(apiUrl('/api/physical-state'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          date,
          height: heightNum,
          weight: weightNum,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        Alert.alert(
          'Success',
          data.action === 'created'
            ? 'Physical state created successfully'
            : 'Physical state updated successfully'
        );
        onSuccess();
        onClose();
      } else {
        const error = await resp.json();
        Alert.alert('Error', error.error || 'Failed to save physical state');
      }
    } catch (err) {
      console.warn('Error saving physical state:', err);
      Alert.alert('Error', 'Failed to save physical state');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {currentPhysicalState ? 'Update Physical State' : 'Add Physical State'}
          </Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                editable={!currentPhysicalState}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Height (meters)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1.75"
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 75"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <GRButton
              title="Cancel"
              onPress={onClose}
              disabled={loading}
            />
            <GRButton
              title={loading ? 'Saving...' : 'Save'}
              onPress={handleSave}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  form: {
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
});
