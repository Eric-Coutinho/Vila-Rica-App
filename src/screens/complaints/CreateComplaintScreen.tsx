import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createComplaint } from "../../services/complaintService";
import { getStoredUser } from "../../services/session";
import type {
  ComplaintApartment,
  ComplaintPerson,
} from "../../types/complaint";
import { styles } from "./CreateComplaintStyles";

const AVAILABLE_RESIDENTS: ComplaintPerson[] = [
  { id: "resident-1", name: "Morador 1" },
  { id: "resident-2", name: "Morador 2" },
  { id: "resident-3", name: "Morador 3" },
  { id: "resident-4", name: "Morador 4" },
  { id: "resident-5", name: "Morador 5" },
  { id: "resident-6", name: "Morador 6" },
];

const AVAILABLE_APARTMENTS: ComplaintApartment[] = [
  { id: "apartment-23-7", apartamento: "23", bloco: "7" },
  { id: "apartment-24-7", apartamento: "24", bloco: "7" },
  { id: "apartment-12-3", apartamento: "12", bloco: "3" },
  { id: "apartment-18-4", apartamento: "18", bloco: "4" },
];

type InvolvedType = "resident" | "apartment";

const toDateInputValue = (date: Date | null) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDisplayDate = (date: Date | null) => {
  if (!date) return "Data do ocorrido...";
  return date.toLocaleDateString("pt-BR");
};

export default function CreateComplaintScreen() {
  const router = useRouter();

  const [occurrenceDate, setOccurrenceDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useDefaultContact, setUseDefaultContact] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [residents, setResidents] = useState<ComplaintPerson[]>([]);
  const [apartments, setApartments] = useState<ComplaintApartment[]>([]);
  const [involvedModalVisible, setInvolvedModalVisible] = useState(false);
  const [involvedType, setInvolvedType] =
    useState<InvolvedType>("resident");
  const [selectedInvolvedId, setSelectedInvolvedId] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedInvolvedLabel = useMemo(() => {
    const parts = [
      ...residents.map((resident) => resident.name),
      ...apartments.map(
        (apartment) =>
          `Apartamento ${apartment.apartamento}, Bloco ${apartment.bloco}`,
      ),
    ];

    return parts.length > 0 ? parts.join(", ") : "Apartamento / Morador...";
  }, [apartments, residents]);

  const availableOptions =
    involvedType === "resident" ? AVAILABLE_RESIDENTS : AVAILABLE_APARTMENTS;

  const addInvolved = () => {
    if (!selectedInvolvedId) {
      Alert.alert("Atenção", "Selecione um envolvido.");
      return;
    }

    if (involvedType === "resident") {
      const resident = AVAILABLE_RESIDENTS.find(
        (item) => item.id === selectedInvolvedId,
      );

      if (resident && !residents.some((item) => item.id === resident.id)) {
        setResidents((current) => [...current, resident]);
      }
    } else {
      const apartment = AVAILABLE_APARTMENTS.find(
        (item) => item.id === selectedInvolvedId,
      );

      if (
        apartment &&
        !apartments.some((item) => item.id === apartment.id)
      ) {
        setApartments((current) => [...current, apartment]);
      }
    }

    setSelectedInvolvedId("");
    setInvolvedModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!occurrenceDate) {
      Alert.alert("Atenção", "Informe a data do ocorrido.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Atenção", "Informe o título da reclamação.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Atenção", "Informe a descrição da reclamação.");
      return;
    }

    if (!useDefaultContact && (!contactEmail.trim() || !contactPhone.trim())) {
      Alert.alert(
        "Atenção",
        "Informe o email e o telefone para contato ou selecione o uso dos dados padrão.",
      );
      return;
    }

    setSaving(true);

    try {
      const user = await getStoredUser();
      const dateValue = toDateInputValue(occurrenceDate);

      await createComplaint({
        title: title.trim(),
        description: description.trim(),
        occurrenceDate: `${dateValue}T12:00:00.000Z`,
        involved: { residents, apartments },
        useDefaultContact,
        contactEmail: useDefaultContact ? undefined : contactEmail.trim(),
        contactPhone: useDefaultContact ? undefined : contactPhone.trim(),
        createdBy: {
          id: user?._id || "current-resident",
          name: user?.name || "Morador",
          bloco: "7",
          apartamento: "23",
        },
      });

      Alert.alert("Sucesso", "Reclamação registrada.");
      router.replace("/complaints");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a reclamação.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Nova{`\n`}Reclamação</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>
          Data <Text style={styles.required}>*</Text>
        </Text>

        {Platform.OS === "web" ? (
          <input
            type="date"
            value={toDateInputValue(occurrenceDate)}
            onChange={(event) => {
              if (!event.target.value) {
                setOccurrenceDate(null);
                return;
              }

              const [year, month, day] = event.target.value
                .split("-")
                .map(Number);
              setOccurrenceDate(new Date(year, month - 1, day));
            }}
            style={styles.webDateInput as React.CSSProperties}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={
                  occurrenceDate ? styles.inputText : styles.placeholderText
                }
              >
                {toDisplayDate(occurrenceDate)}
              </Text>
              <Ionicons name="calendar-outline" size={19} color="#111" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={occurrenceDate || new Date()}
                mode="date"
                maximumDate={new Date()}
                onChange={(_event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) setOccurrenceDate(selectedDate);
                }}
              />
            )}
          </>
        )}

        <Text style={styles.label}>Envolvidos</Text>
        <TouchableOpacity
          style={styles.inputButton}
          activeOpacity={0.8}
          onPress={() => setInvolvedModalVisible(true)}
        >
          <Text
            numberOfLines={1}
            style={
              residents.length || apartments.length
                ? styles.inputText
                : styles.placeholderText
            }
          >
            {selectedInvolvedLabel}
          </Text>
          <Ionicons name="add" size={22} color="#111" />
        </TouchableOpacity>

        {(residents.length > 0 || apartments.length > 0) && (
          <View style={styles.chipsContainer}>
            {residents.map((resident) => (
              <View key={resident.id} style={styles.chip}>
                <Text style={styles.chipText}>{resident.name}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setResidents((current) =>
                      current.filter((item) => item.id !== resident.id),
                    )
                  }
                >
                  <Ionicons name="close" size={17} color="#333" />
                </TouchableOpacity>
              </View>
            ))}

            {apartments.map((apartment) => (
              <View key={apartment.id} style={styles.chip}>
                <Text style={styles.chipText}>
                  Ap. {apartment.apartamento} / Bl. {apartment.bloco}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setApartments((current) =>
                      current.filter((item) => item.id !== apartment.id),
                    )
                  }
                >
                  <Ionicons name="close" size={17} color="#333" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.label}>
          Título <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Título da reclamação (máx. 75 caracteres)"
          placeholderTextColor="#888"
          maxLength={75}
        />
        <Text style={styles.counter}>{title.length}/75</Text>

        <Text style={styles.label}>
          Descrição <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descrição da reclamação (máx. 500 caracteres)"
          placeholderTextColor="#888"
          multiline
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.counter}>{description.length}/500</Text>

        <TouchableOpacity
          style={styles.checkboxRow}
          activeOpacity={0.75}
          onPress={() => setUseDefaultContact((current) => !current)}
        >
          <View
            style={[
              styles.checkbox,
              useDefaultContact && styles.checkboxSelected,
            ]}
          >
            {useDefaultContact && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            Usar minhas informações de contato padrão
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Email para contato</Text>
        <TextInput
          style={[styles.input, useDefaultContact && styles.disabledInput]}
          value={contactEmail}
          onChangeText={setContactEmail}
          editable={!useDefaultContact}
          placeholder={
            useDefaultContact ? "Dados do cadastro" : "Exemplo@gmail.com"
          }
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Telefone para contato</Text>
        <TextInput
          style={[styles.input, useDefaultContact && styles.disabledInput]}
          value={contactPhone}
          onChangeText={setContactPhone}
          editable={!useDefaultContact}
          placeholder={
            useDefaultContact ? "Dados do cadastro" : "41 91234-5678"
          }
          placeholderTextColor="#888"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        activeOpacity={0.85}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Registrar reclamação</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        activeOpacity={0.85}
        onPress={() => router.back()}
        disabled={saving}
      >
        <Text style={styles.primaryButtonText}>Cancelar</Text>
      </TouchableOpacity>

      <Modal
        visible={involvedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInvolvedModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setInvolvedModalVisible(false)}
        >
          <Pressable
            style={styles.selectionModal}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Adicionar envolvido</Text>

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={involvedType}
                onValueChange={(value: InvolvedType) => {
                  setInvolvedType(value);
                  setSelectedInvolvedId("");
                }}
                style={styles.picker}
              >
                <Picker.Item label="Morador" value="resident" />
                <Picker.Item label="Apartamento" value="apartment" />
              </Picker>
            </View>

            <Text style={styles.label}>
              {involvedType === "resident" ? "Morador" : "Apartamento"}
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedInvolvedId}
                onValueChange={(value) => setSelectedInvolvedId(String(value))}
                style={styles.picker}
              >
                <Picker.Item label="Selecione..." value="" />
                {availableOptions.map((option) => (
                  <Picker.Item
                    key={option.id}
                    label={
                      "name" in option
                        ? option.name
                        : `Apartamento ${option.apartamento}, Bloco ${option.bloco}`
                    }
                    value={option.id}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setInvolvedModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={addInvolved}
              >
                <Text style={styles.primaryButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
