import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "../constants/colors";

type PasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function PasswordInput({
  value,
  onChangeText,
  placeholder = "Enter your password",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry={!showPassword}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={styles.eyeButton}
        activeOpacity={0.7}
        onPress={() => setShowPassword((previous) => !previous)}
      >
        <Ionicons
          name={showPassword ? "eye-off-outline" : "eye-outline"}
          size={22}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  eyeButton: {
    width: 52,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});