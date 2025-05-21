import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { add, subtract, multiply, divide } from '@dividee/core';

export default function App() {
  const [num1, setNum1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [operation, setOperation] = useState<string>('+');
  const [result, setResult] = useState<number | string>('');

  const handleCalculate = () => {
    const n1 = Number.parseFloat(num1);
    const n2 = Number.parseFloat(num2);

    if (Number.isNaN(n1) || Number.isNaN(n2)) {
      Alert.alert('Error', 'Invalid input');
      setResult('');
      return;
    }

    try {
      let calculatedResult: number;
      switch (operation) {
        case '+':
          calculatedResult = add(n1, n2);
          break;
        case '-':
          calculatedResult = subtract(n1, n2);
          break;
        case '*':
          calculatedResult = multiply(n1, n2);
          break;
        case '/':
          calculatedResult = divide(n1, n2);
          break;
        default:
          Alert.alert('Error', 'Invalid operation');
          setResult('');
          return;
      }
      setResult(calculatedResult);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
      setResult('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile Calculator</Text>
      <TextInput
        style={styles.input}
        value={num1}
        onChangeText={setNum1}
        placeholder="Number 1"
        keyboardType="numeric"
      />
      <Picker
        selectedValue={operation}
        style={styles.picker}
        onValueChange={(itemValue: string) => setOperation(itemValue)}
      >
        <Picker.Item label="+" value="+" />
        <Picker.Item label="-" value="-" />
        <Picker.Item label="*" value="*" />
        <Picker.Item label="/" value="/" />
      </Picker>
      <TextInput
        style={styles.input}
        value={num2}
        onChangeText={setNum2}
        placeholder="Number 2"
        keyboardType="numeric"
      />
      <Button title="Calculate" onPress={handleCalculate} />
      <Text style={styles.result}>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '80%',
  },
  picker: {
    height: 50,
    width: '80%',
    marginBottom: 10,
  },
  result: {
    marginTop: 20,
    fontSize: 20,
  },
});
