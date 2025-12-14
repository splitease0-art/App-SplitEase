import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
  useColorScheme,
} from "react-native";
import { db, auth } from "../../config/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

// ✅ Fix for UUID in React Native
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

export default function CheckGroup() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const PALETTE = {
    primary: "#059669",
    accent: "#111827",
    background: isDark ? "#0b0b0b" : "#f9f9f9",
    surface: isDark ? "#111827" : "#ffffff",
    text: isDark ? "#f5f5f5" : "#111827",
    muted: isDark ? "#9ca3af" : "#4b5563",
    border: isDark ? "#1f2937" : "#e5e7eb",
  };

  const [emails, setEmails] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Get current logged-in user
  const currentUserEmail = auth.currentUser?.email;

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const usersCol = collection(db, "users");
        const usersSnapshot = await getDocs(usersCol);
        let emailsList: string[] = usersSnapshot.docs.map((doc) => doc.data().email);

        // ✅ Remove current logged-in user from selection list
        if (currentUserEmail) {
          emailsList = emailsList.filter(email => email !== currentUserEmail);
        }

        setEmails(emailsList);
      } catch (err: any) {
        Alert.alert("Error", "Failed to fetch emails: " + err.message);
      }
    };

    fetchEmails();
  }, [currentUserEmail]);

  const toggleCheckbox = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter((e) => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedEmails.length === 0) {
      return Alert.alert("No Users Selected", "Please select at least one user.");
    }
    setShowGroupModal(true);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      return Alert.alert("Missing Group Name", "Please enter a group name.");
    }

    try {
      const groupId = uuidv4();
      const groupRef = doc(db, "groups", groupId);

      // ✅ Include current user as a member/admin
      const members = currentUserEmail ? [currentUserEmail, ...selectedEmails] : selectedEmails;

      await setDoc(groupRef, {
        groupId,
        groupName,
        members,
        admin: currentUserEmail || "", // store admin separately if needed
      });

      Alert.alert("Group Created", `Group "${groupName}" created successfully!`);
      setShowGroupModal(false);
      setSelectedEmails([]);
      setGroupName("");
      setShowCheckboxes(false);
    } catch (err: any) {
      Alert.alert("Error", "Failed to create group: " + err.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: PALETTE.background }]}>
        <Text style={{ color: PALETTE.text }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: PALETTE.background }]}>
        <Text style={{ color: PALETTE.text }}>
          Please sign in to view your dashboard.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: PALETTE.background }]}>
      {/* Profile summary */}
      <View style={[styles.card, { backgroundColor: PALETTE.surface, borderColor: PALETTE.border }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: PALETTE.primary }]}>
            {user.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: PALETTE.text }]}>
              {user.displayName || "Unnamed user"}
            </Text>
            <Text style={[styles.email, { color: PALETTE.muted }]}>{user.email}</Text>
            <Text style={[styles.email, { color: PALETTE.muted }]}>
              {user.phoneNumber || "No phone on file"}
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor: user.emailVerified ? PALETTE.primary : PALETTE.accent,
                  color: "#fff",
                },
              ]}
            >
              {user.emailVerified ? "Verified" : "Unverified"}
            </Text>
          </View>
        </View>
      </View>

      {/* Create Group Button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: PALETTE.primary, shadowColor: PALETTE.accent }]}
        onPress={() => setShowCheckboxes(!showCheckboxes)}
      >
        <Text style={styles.createButtonText}>+ Create Group</Text>
      </TouchableOpacity>

      {/* Emails List with Checkboxes */}
      {showCheckboxes && (
        <FlatList
          data={emails}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.emailContainer,
                { backgroundColor: PALETTE.surface, shadowColor: PALETTE.accent },
              ]}
              onPress={() => toggleCheckbox(item)}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: PALETTE.primary },
                  selectedEmails.includes(item) && { backgroundColor: PALETTE.primary },
                ]}
              >
                {selectedEmails.includes(item) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.emailText, { color: PALETTE.text }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Confirm Selection Button */}
      {showCheckboxes && selectedEmails.length > 0 && (
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: PALETTE.accent }]}
          onPress={handleConfirmSelection}
        >
          <Text style={styles.confirmButtonText}>Confirm Selection</Text>
        </TouchableOpacity>
      )}

      {/* Group Name Modal */}
      <Modal visible={showGroupModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: PALETTE.surface }]}>
            <Text style={[styles.modalTitle, { color: PALETTE.text }]}>
              Enter Group Name
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { borderColor: PALETTE.border, color: PALETTE.text },
              ]}
              placeholder="Group Name"
              placeholderTextColor={PALETTE.muted}
              value={groupName}
              onChangeText={setGroupName}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: PALETTE.primary }]}
              onPress={handleCreateGroup}
            >
              <Text style={styles.modalButtonText}>Create Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: PALETTE.border, marginTop: 10 }]}
              onPress={() => setShowGroupModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: PALETTE.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  name: { fontSize: 18, fontWeight: "700" },
  email: { fontSize: 14, marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },

  createButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 15,
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: { color: "white", fontSize: 18, fontWeight: "700" },

  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 5,
    borderWidth: 1.5,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {},
  checkmark: { color: "white", fontWeight: "bold", fontSize: 16 },
  emailText: { fontSize: 16 },

  confirmButton: {
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 15,
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButtonText: { color: "white", fontSize: 18, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: { width: "80%", borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
});
