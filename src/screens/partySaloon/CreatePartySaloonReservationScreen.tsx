import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "./CreatePartySaloonReservationStyles";

const API_BASE = "http://localhost:3000/api";

type Guest = {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
};

export default function CreatePartySaloonScreen() {
  const router = useRouter();

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [occasion, setOccasion] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestCpf, setGuestCpf] = useState("");
  const [guestBirthDate, setGuestBirthDate] = useState<Date | null>(null);

  const [showGuestBirthPicker, setShowGuestBirthPicker] = useState(false);

  const [guests, setGuests] = useState<Guest[]>([]);

  const [loading, setLoading] = useState(false);

  function formatDate(date: Date | null) {
    if (!date) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function formatDatePayload(date: Date | null) {
    if (!date) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }

  function formatTime(date: Date | null) {
    if (!date) return "";

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  function formatCpf(value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function onlyCpfNumbers(value: string) {
    return value.replace(/\D/g, "");
  }

  function handleDateWeb(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    if (!value) {
      setDate(null);
      return;
    }

    const [year, month, day] = value.split("-").map(Number);

    setDate(new Date(year, month - 1, day));
  }

  function handleTimeWeb(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    if (!value) {
      setTime(null);
      return;
    }

    const [hours, minutes] = value.split(":").map(Number);

    const selectedTime = new Date();
    selectedTime.setHours(hours);
    selectedTime.setMinutes(minutes);
    selectedTime.setSeconds(0);
    selectedTime.setMilliseconds(0);

    setTime(selectedTime);
  }

  function handleGuestBirthDateWeb(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    if (!value) {
      setGuestBirthDate(null);
      return;
    }

    const [year, month, day] = value.split("-").map(Number);

    setGuestBirthDate(new Date(year, month - 1, day));
  }

  function onChangeDateMobile(
    _event: any,
    selectedDate?: Date
  ) {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
  }

  function onChangeTimeMobile(
    _event: any,
    selectedTime?: Date
  ) {
    if (Platform.OS !== "ios") {
      setShowTimePicker(false);
    }

    if (selectedTime) {
      setTime(selectedTime);
    }
  }

  function onChangeGuestBirthMobile(
    _event: any,
    selectedDate?: Date
  ) {
    if (Platform.OS !== "ios") {
      setShowGuestBirthPicker(false);
    }

    if (selectedDate) {
      setGuestBirthDate(selectedDate);
    }
  }

  function handleAddGuest() {
    if (!guestName.trim()) {
      return alert("Erro - Informe o nome do convidado.");
    }

    if (!guestCpf.trim()) {
      return alert("Erro - Informe o CPF do convidado.");
    }

    const cpfNumbers = onlyCpfNumbers(guestCpf);

    if (cpfNumbers.length !== 11) {
      return alert("Erro - Informe um CPF válido.");
    }

    if (!guestBirthDate) {
      return alert(
        "Erro - Informe a data de nascimento do convidado."
      );
    }

    const newGuest: Guest = {
      id: String(Date.now()),
      name: guestName.trim(),
      cpf: cpfNumbers,
      birthDate: formatDatePayload(guestBirthDate),
    };

    setGuests((current) => [...current, newGuest]);

    setGuestName("");
    setGuestCpf("");
    setGuestBirthDate(null);
  }

  function handleRemoveGuest(id: string) {
    setGuests((current) =>
      current.filter((guest) => guest.id !== id)
    );
  }

  async function handleCreateReservation() {
    if (!date) {
      return alert("Erro - Informe a data da reserva.");
    }

    if (!time) {
      return alert("Erro - Informe o horário da reserva.");
    }

    if (!occasion.trim()) {
      return alert("Erro - Informe a ocasião.");
    }

    try {
      setLoading(true);

      const raw =
        (await AsyncStorage.getItem("user")) ||
        (typeof localStorage !== "undefined"
          ? localStorage.getItem("user")
          : null);

      const user = raw ? JSON.parse(raw) : null;

      const userId = user?._id || user?.id;

      if (!userId) {
        alert("Erro - Usuário logado não encontrado.");
        return;
      }

      const payload = {
        type: "party_saloon",
        date: formatDatePayload(date),
        time: formatTime(time),
        occasion: occasion.trim(),

        guests: guests.map((guest) => ({
          name: guest.name,
          cpf: guest.cpf,
          birthDate: guest.birthDate,
        })),
      };

      const response = await fetch(
        `${API_BASE}/reservation/create-reservation`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-user-id": String(userId),
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.warn(
          "Erro ao criar reserva:",
          response.status,
          data
        );

        return alert(
          `Erro - ${data.message || "Falha ao criar reserva."}`
        );
      }

      alert("Sucesso - Reserva criada.");

      router.push("/party-saloon");
    } catch (error) {
      console.error("Erro ao criar reserva:", error);

      alert(
        "Erro - Não foi possível conectar ao servidor."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.headerTitle}>
        Reservar{"\n"}Salão de Festas
      </Text>

      <View style={styles.formCard}>
        {/* DATA + HORA */}

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>
              Data <Text style={styles.required}>*</Text>
            </Text>

            {Platform.OS === "web" ? (
              <input
                type="date"
                value={formatDatePayload(date)}
                onChange={handleDateWeb}
                style={styles.webInput as any}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={{
                      color: date ? "#000" : "#777",
                    }}
                  >
                    {date
                      ? formatDate(date)
                      : "dd/mm/aaaa"}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={date ?? new Date()}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={onChangeDateMobile}
                  />
                )}
              </>
            )}
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>
              Hora <Text style={styles.required}>*</Text>
            </Text>

            {Platform.OS === "web" ? (
              <input
                type="time"
                value={formatTime(time)}
                onChange={handleTimeWeb}
                style={styles.webInput as any}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text
                    style={{
                      color: time ? "#000" : "#777",
                    }}
                  >
                    {time
                      ? formatTime(time)
                      : "hh:mm"}
                  </Text>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={time ?? new Date()}
                    mode="time"
                    display="default"
                    is24Hour
                    onChange={onChangeTimeMobile}
                  />
                )}
              </>
            )}
          </View>
        </View>

        {/* OCASIÃO */}

        <Text style={styles.label}>
          Ocasião <Text style={styles.required}>*</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: Aniversário de criança"
          placeholderTextColor="#9b9b9b"
          value={occasion}
          onChangeText={setOccasion}
        />

        {/* CONVIDADOS */}

        <Text style={styles.sectionTitle}>
          Lista de Convidados
        </Text>

        <Text style={styles.label}>Nome</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do convidado"
          placeholderTextColor="#9b9b9b"
          value={guestName}
          onChangeText={setGuestName}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>CPF</Text>

            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#9b9b9b"
              value={guestCpf}
              onChangeText={(value) =>
                setGuestCpf(formatCpf(value))
              }
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>
              Data Nasc.
            </Text>

            {Platform.OS === "web" ? (
              <input
                type="date"
                value={formatDatePayload(
                  guestBirthDate
                )}
                onChange={handleGuestBirthDateWeb}
                style={styles.webInput as any}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() =>
                    setShowGuestBirthPicker(true)
                  }
                >
                  <Text
                    style={{
                      color: guestBirthDate
                        ? "#000"
                        : "#777",
                    }}
                  >
                    {guestBirthDate
                      ? formatDate(guestBirthDate)
                      : "dd/mm/aaaa"}
                  </Text>
                </TouchableOpacity>

                {showGuestBirthPicker && (
                  <DateTimePicker
                    value={
                      guestBirthDate ??
                      new Date(2000, 0, 1)
                    }
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={
                      onChangeGuestBirthMobile
                    }
                  />
                )}
              </>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.addGuestButton}
          onPress={handleAddGuest}
        >
          <Text style={styles.addGuestButtonText}>
            Adicionar Convidado
          </Text>
        </TouchableOpacity>

        {/* TABELA */}

        <View style={styles.guestsContainer}>
          {guests.length === 0 ? (
            <View style={styles.emptyGuests}>
              <Text style={styles.emptyGuestsText}>
                Nenhum convidado adicionado.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.nameColumn,
                  ]}
                >
                  Nome
                </Text>

                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.cpfColumn,
                  ]}
                >
                  CPF
                </Text>

                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.dateColumn,
                  ]}
                >
                  Nascimento
                </Text>

                <View style={styles.removeColumn} />
              </View>

              {guests.map((guest) => (
                <View
                  key={guest.id}
                  style={styles.tableRow}
                >
                  <Text
                    style={[
                      styles.tableText,
                      styles.nameColumn,
                    ]}
                    numberOfLines={2}
                  >
                    {guest.name}
                  </Text>

                  <Text
                    style={[
                      styles.tableText,
                      styles.cpfColumn,
                    ]}
                  >
                    {formatCpf(guest.cpf)}
                  </Text>

                  <Text
                    style={[
                      styles.tableText,
                      styles.dateColumn,
                    ]}
                  >
                    {guest.birthDate
                      .split("-")
                      .reverse()
                      .join("/")}
                  </Text>

                  <TouchableOpacity
                    style={styles.removeColumn}
                    onPress={() =>
                      handleRemoveGuest(guest.id)
                    }
                  >
                    <Text style={styles.removeText}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </View>
      </View>

      {/* CONFIRMAR */}

      <TouchableOpacity
        style={[
          styles.confirmButton,
          loading && styles.disabledButton,
        ]}
        disabled={loading}
        onPress={handleCreateReservation}
      >
        <Text style={styles.confirmButtonText}>
          {loading
            ? "Confirmando..."
            : "Confirmar Reserva"}
        </Text>
      </TouchableOpacity>

      {/* CANCELAR */}

      <TouchableOpacity
        style={styles.cancelButton}
        disabled={loading}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>
          Cancelar
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}