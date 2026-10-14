import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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

import { ApiError, getErrorMessage } from "../../services/api";
import {
  createComplaint,
  listComplaintResidents,
} from "../../services/complaintService";
import type {
  ComplaintApartment,
  ComplaintPerson,
  ComplaintResidentOption,
} from "../../types/complaint";
import { styles } from "./CreateComplaintStyles";

type InvolvedType = "resident" | "apartment";

const toDateInputValue = (date: Date | null) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toOccurrenceIso = (date: Date) =>
  new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12),
  ).toISOString();

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
  const [residentOptions, setResidentOptions] = useState<
    ComplaintResidentOption[]
  >([]);
  const [residentsLoaded, setResidentsLoaded] = useState(false);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [residentLoadError, setResidentLoadError] = useState("");
  const [involvedModalVisible, setInvolvedModalVisible] = useState(false);
  const [involvedType, setInvolvedType] = useState<InvolvedType>("apartment");
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [apartmentBlock, setApartmentBlock] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
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

  const loadResidents = useCallback(async () => {
    if (residentsLoaded || loadingResidents) return;

    setLoadingResidents(true);
    setResidentLoadError("");
    try {
      const options = await listComplaintResidents();
      setResidentOptions(options);
      setResidentsLoaded(true);
    } catch (error) {
      setResidentLoadError(
        error instanceof ApiError && error.status === 403
          ? "Seu perfil não possui acesso à lista de moradores. Informe um apartamento envolvido."
          : getErrorMessage(error, "Não foi possível carregar os moradores."),
      );
    } finally {
      setLoadingResidents(false);
    }
  }, [loadingResidents, residentsLoaded]);

  const changeInvolvedType = (value: InvolvedType) => {
    setInvolvedType(value);
    setSelectedResidentId("");
    if (value === "resident") void loadResidents();
  };

  const addInvolved = () => {
    if (involvedType === "resident") {
      if (!selectedResidentId) {
        Alert.alert("Atenção", "Selecione um morador.");
        return;
      }

      const resident = residentOptions.find(
        (item) => item.id === selectedResidentId,
      );
      if (resident && !residents.some((item) => item.id === resident.id)) {
        setResidents((current) => [
          ...current,
          { id: resident.id, _id: resident._id, name: resident.name },
        ]);
      }
      setSelectedResidentId("");
    } else {
      const bloco = apartmentBlock.trim();
      const apartamento = apartmentNumber.trim();
      if (!bloco || !apartamento) {
        Alert.alert("Atenção", "Informe o bloco e o apartamento.");
        return;
      }

      const id = `${bloco}:${apartamento}`;
      if (!apartments.some((item) => item.id === id)) {
        setApartments((current) => [...current, { id, bloco, apartamento }]);
      }
      setApartmentBlock("");
      setApartmentNumber("");
    }

    setInvolvedModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!occurrenceDate) {
      Alert.alert("Atenção", "Informe a data do ocorrido.");
      return;
    }
    if (occurrenceDate.getTime() > Date.now()) {
      Alert.alert("Atenção", "A data do ocorrido não pode estar no futuro.");
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
      await createComplaint({
        title: title.trim(),
        description: description.trim(),
        occurrenceDate: toOccurrenceIso(occurrenceDate),
        involved: { residents, apartments },
        useDefaultContact,
        contactEmail: useDefaultContact ? undefined : contactEmail.trim(),
        contactPhone: useDefaultContact ? undefined : contactPhone.trim(),
      });

      Alert.alert("Sucesso", "Reclamação registrada.");
      router.replace("/complaints");
    } catch (error) {
      Alert.alert(
        "Erro",
        getErrorMessage(error, "Não foi possível registrar a reclamação."),
      );
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
      }
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
            max={toDateInputValue(new Date())}
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
                  accessibilityLabel={`Remover ${resident.name}`}
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
                  accessibilityLabel={`Remover apartamento ${apartment.apartamento}`}
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
            useDefaultContact ? "Dados do cadastro" : "exemplo@email.com"
          }
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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
        style={[styles.submitButton, saving && styles.buttonDisabled]}
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
                onValueChange={(value: InvolvedType) =>
                  changeInvolvedType(value)
                }
                style={styles.picker}
              >
                <Picker.Item label="Apartamento" value="apartment" />
                <Picker.Item label="Morador" value="resident" />
              </Picker>
            </View>

            {involvedType === "resident" ? (
              <>
                <Text style={styles.label}>Morador</Text>
                {loadingResidents ? (
                  <View style={styles.modalLoading}>
                    <ActivityIndicator color="#466CA5" />
                    <Text style={styles.modalLoadingText}>
                      Carregando moradores...
                    </Text>
                  </View>
                ) : residentLoadError ? (
                  <View style={styles.modalErrorBox}>
                    <Text style={styles.modalErrorText}>
                      {residentLoadError}
                    </Text>
                    <TouchableOpacity onPress={() => void loadResidents()}>
                      <Text style={styles.tryAgainText}>Tentar novamente</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedResidentId}
                      onValueChange={(value) =>
                        setSelectedResidentId(String(value))
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecione..." value="" />
                      {residentOptions.map((resident) => (
                        <Picker.Item
                          key={resident.id}
                          label={`${resident.name}${
                            resident.bloco && resident.apartamento
                              ? ` - Bl. ${resident.bloco}, Ap. ${resident.apartamento}`
                              : ""
                          }`}
                          value={resident.id}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.apartmentFields}>
                <View style={styles.apartmentField}>
                  <Text style={styles.label}>Bloco</Text>
                  <TextInput
                    style={styles.input}
                    value={apartmentBlock}
                    onChangeText={setApartmentBlock}
                    placeholder="Bloco"
                    placeholderTextColor="#888"
                  />
                </View>
                <View style={styles.apartmentField}>
                  <Text style={styles.label}>Apartamento</Text>
                  <TextInput
                    style={styles.input}
                    value={apartmentNumber}
                    onChangeText={setApartmentNumber}
                    placeholder="Apartamento"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setInvolvedModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalAddButton,
                  involvedType === "resident" &&
                    (loadingResidents || !!residentLoadError) &&
                    styles.buttonDisabled,
                ]}
                onPress={addInvolved}
                disabled={
                  involvedType === "resident" &&
                  (loadingResidents || !!residentLoadError)
                }
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
