import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../config/designSystem';
import { commonStyles } from '../config/commonStyles';
import GRButton from '../components/GRButton';
import { apiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

interface SignupScreenProps {
  onBack: () => void;
}

const signupScreen = ({ onBack }: SignupScreenProps) => {
	const { signInWithGoogle } = useAuth();
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [name, setName] = useState('');
	const [lastname, setLastName] = useState('');
	const [age, setAge] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [gender, setGender] = useState<'Male' | 'Female' | 'No specify' | ''>('');
	const [description, setDescription] = useState('');
	const [profileImage, setProfileImage] = useState<string | null>(null);

	const pickImage = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permissionResult.granted) {
			Alert.alert("Permission Required", "You need to grant camera roll permissions to select an image.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8
		});

		if (!result.canceled) {
			setProfileImage(result.assets[0].uri);
		}
	};

	// Minimum eight characters, at least one uppercase, one lowercase, one number and one special character (allows most punctuation, no spaces)
	const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,}$/;
	function isSecurePassword(pwd: string) {
		return re.test(pwd);
	}

	const handleSignup = async () => {
		if (password !== confirmPassword) {
			Alert.alert("Error", "Passwords do not match");
			return;
		}
		if (!isSecurePassword(password)) {
			Alert.alert("Error", "Password must be at least 8 characters long and include uppercase, lowercase, number, and a special character (no spaces).");
			return;
		}

		// debug log removed

		try {
			const formData = new FormData();
			formData.append('username', username);
			formData.append('email', email);
			formData.append('name', name);
			formData.append('lastname', lastname);
			formData.append('age', age);
			formData.append('password', password);
			formData.append('gender', gender);
			formData.append('description', description);

			if (profileImage) {
				const uriParts = profileImage.split('.');
				const fileType = uriParts[uriParts.length - 1];

				formData.append('profilePhoto', {
					uri: profileImage,
					name: `profile.${fileType}`,
					type: `image/${fileType}`
				} as unknown as Blob);
			}

			const response = await fetch(apiUrl('/api/register'), {
				method: "POST",
				body: formData
			});

			const data = await response.json();
			if (!response.ok) {
				Alert.alert("Error", data?.message || `Error ${response.status}`);
				return;
			}
			Alert.alert("Success", data.message || "Registration successful");
			onBack();
		} catch (error) {
			console.error("Request error:", error);
			Alert.alert("Error", "Could not connect to server");
		}
	};

	return (
		<SafeAreaView style={commonStyles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.content}>
					<Text style={commonStyles.title}>Sign Up</Text>

					<View style={commonStyles.form}>
						{/* Profile Photo Section */}
						<TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
							{profileImage ? (
								<Image source={{ uri: profileImage }} style={styles.profileImage} />
							) : (
								<View style={styles.placeholderImage}>
									<Text style={styles.placeholderText}>Tap to select profile photo</Text>
								</View>
							)}
						</TouchableOpacity>

						<TextInput
							style={commonStyles.input}
							placeholder="Email"
							placeholderTextColor="#999"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
						/>

						<TextInput
							style={commonStyles.input}
							placeholder="Username"
							placeholderTextColor="#999"
							value={username}
							onChangeText={setUsername}
							autoCapitalize="none"
						/>
						<TextInput
							style={commonStyles.input}
							placeholder="Name"
							placeholderTextColor="#999"
							value={name}
							onChangeText={setName}
							autoCapitalize="none"
						/>
						<TextInput
							style={commonStyles.input}
							placeholder="Last Name"
							placeholderTextColor="#999"
							value={lastname}
							onChangeText={setLastName}
							autoCapitalize="none"
						/>
						<TextInput
							style={commonStyles.input}
							placeholder="Age"
							placeholderTextColor="#999"
							value={age}
							onChangeText={setAge}
							autoCapitalize="none"
							keyboardType="numeric"
						/>

						{/* Gender Picker */}
						<View style={styles.pickerContainer}>
							<Picker
								selectedValue={gender}
								onValueChange={(itemValue: typeof gender) => setGender(itemValue)}
								style={styles.picker}
							>
								<Picker.Item label="Select Gender" value="" />
								<Picker.Item label="Male" value="Male" />
								<Picker.Item label="Female" value="Female" />
								<Picker.Item label="Don't want to specify" value="No specify" />
							</Picker>
						</View>

						{/* Description */}
						<TextInput
							style={[commonStyles.input, styles.descriptionInput]}
							placeholder="Description (optional)"
							placeholderTextColor="#999"
							value={description}
							onChangeText={setDescription}
							multiline
							numberOfLines={3}
							maxLength={500}
						/>

						<TextInput
							style={commonStyles.input}
							placeholder="Password"
							placeholderTextColor="#999"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
						/>

						<TextInput
							style={commonStyles.input}
							placeholder="Confirm Password"
							placeholderTextColor="#999"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							secureTextEntry
						/>

						<GRButton label="Create Account" variant="primary" onPress={handleSignup} style={styles.buttonSpacing} />
						<GRButton label="Sign Up with Google" variant="secondary" onPress={() => signInWithGoogle()} leftIcon="G" style={styles.buttonSpacing} />
						<GRButton label="Back" variant="outline" onPress={onBack} style={styles.buttonSpacing} />
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	scrollContent: { flexGrow: 1 },
	content: { flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.xl + 10, paddingVertical: theme.spacing.xl * 2 },
	buttonSpacing: { width: '100%', marginTop: theme.spacing.s },
	imagePickerButton: {
		alignSelf: 'center',
		marginBottom: theme.spacing.l
	},
	profileImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 3,
		borderColor: theme.colors.primary
	},
	placeholderImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: theme.colors.surface,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: theme.colors.primary,
		borderStyle: 'dashed'
	},
	placeholderText: {
		color: theme.colors.textSecondary,
		fontSize: theme.typography.size.s,
		textAlign: 'center',
		paddingHorizontal: theme.spacing.m
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: theme.radii.m,
		marginBottom: theme.spacing.m,
		backgroundColor: theme.colors.surface,
		overflow: 'hidden',
		paddingVertical: theme.spacing.xs
	},
	picker: {
		height: 60,
		width: '100%',
		color: theme.colors.textPrimary
	},
	descriptionInput: {
		height: 80,
		textAlignVertical: 'top',
		paddingTop: theme.spacing.s
	}
});

export default signupScreen;
