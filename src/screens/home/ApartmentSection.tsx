import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ApartmentCandidate,
  ApartmentInfo,
  ApartmentResident,
  findApartment,
  getMyApartments,
  linkResidentToApartment,
  searchApartmentCandidates,
  unlinkResidentFromApartment,
  updateApartment,
} from "../../services/apartmentService";
import { styles } from "./styles";

type Props = { manager: boolean };
const RELATIONS = ["Morador", "Inquilino", "Proprietário"];

function ageFromDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  if (
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())
  )
    age -= 1;
  return `${age} anos`;
}

function ResidentCard({
  resident,
  manager,
  onRemove,
}: {
  resident: ApartmentResident;
  manager: boolean;
  onRemove?: () => void;
}) {
  return (
    <View style={styles.apartmentResidentCard}>
      {manager && onRemove ? (
        <TouchableOpacity
          style={styles.residentDeleteButton}
          onPress={onRemove}
        >
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      ) : null}
      <Image
        source={require("../../../assets/images/user.png")}
        style={styles.apartmentResidentAvatar}
        contentFit="contain"
      />
      <Text style={styles.apartmentResidentName}>{resident.name}</Text>
      {manager ? (
        <>
          <Text style={styles.apartmentResidentInfo}>
            {resident.cpf || "CPF não informado"}
          </Text>
          <Text style={styles.apartmentResidentInfo}>{resident.phone}</Text>
          <Text style={styles.apartmentResidentInfo}>
            {ageFromDate(resident.birthDate) || "Idade não informada"}
          </Text>
        </>
      ) : (
        <Text style={styles.apartmentResidentInfo}>{resident.phone}</Text>
      )}
    </View>
  );
}

function UserSearch({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (candidate: ApartmentCandidate) => void;
}) {
  const [suggestions, setSuggestions] = useState<ApartmentCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    if (value.trim().length < 4) {
      setSuggestions([]);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchApartmentCandidates(value)
        .then((items) => active && setSuggestions(items))
        .catch(() => active && setSuggestions([]))
        .finally(() => active && setLoading(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [value]);
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={styles.apartmentInput}
        placeholder="Digite ao menos 4 letras do nome"
      />
      {loading ? (
        <ActivityIndicator color="#466CA5" style={styles.suggestionLoading} />
      ) : null}
      {suggestions.length ? (
        <View style={styles.suggestionBox}>
          {suggestions.map((candidate) => (
            <TouchableOpacity
              key={candidate.id}
              style={styles.suggestionItem}
              onPress={() => {
                onSelect(candidate);
                setSuggestions([]);
              }}
            >
              <Text>{candidate.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function EditApartmentModal({
  apartment,
  visible,
  onClose,
  onChanged,
}: {
  apartment: ApartmentInfo;
  visible: boolean;
  onClose: () => void;
  onChanged: (apartment: ApartmentInfo) => void;
}) {
  const [rented, setRented] = useState(apartment.isRented ? "Sim" : "Não");
  const [contact, setContact] = useState(
    apartment.contact === "Não informado" ? "" : apartment.contact,
  );
  const [responsibleName, setResponsibleName] = useState(
    apartment.responsible?.name || "",
  );
  const [responsibleId, setResponsibleId] = useState(
    apartment.responsible?.id || "",
  );
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newResidentName, setNewResidentName] = useState("");
  const [newResidentId, setNewResidentId] = useState("");
  const [relation, setRelation] = useState("Morador");
  useEffect(() => {
    if (!visible) return;
    setRented(apartment.isRented ? "Sim" : "Não");
    setContact(apartment.contact === "Não informado" ? "" : apartment.contact);
    setResponsibleName(apartment.responsible?.name || "");
    setResponsibleId(apartment.responsible?.id || "");
    setAdding(false);
  }, [apartment, visible]);
  const save = async () => {
    setSaving(true);
    try {
      onChanged(
        await updateApartment(apartment, {
          isRented: rented === "Sim",
          contact,
          responsibleId,
        }),
      );
      onClose();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o apartamento.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async (resident: ApartmentResident) => {
    setSaving(true);
    try {
      onChanged(await unlinkResidentFromApartment(apartment, resident.id));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o morador.",
      );
    } finally {
      setSaving(false);
    }
  };
  const add = async () => {
    if (!newResidentId) return;
    setSaving(true);
    try {
      onChanged(
        await linkResidentToApartment(apartment, newResidentId, relation),
      );
      setAdding(false);
      setNewResidentId("");
      setNewResidentName("");
      setRelation("Morador");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível vincular o morador.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.apartmentModalOverlay}>
        <View style={styles.apartmentModal}>
          <ScrollView
            contentContainerStyle={styles.apartmentModalContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalTitleRow}>
              <Text style={styles.apartmentModalTitle}>
                Apartamento {apartment.apartamento}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#292D32" />
              </TouchableOpacity>
            </View>
            <Text style={styles.apartmentFieldLabel}>Apartamento alugado?</Text>
            <View style={styles.pickerBorder}>
              <Picker
                selectedValue={rented}
                onValueChange={(value) => setRented(String(value))}
              >
                <Picker.Item label="Sim" value="Sim" />
                <Picker.Item label="Não" value="Não" />
              </Picker>
            </View>
            <Text style={styles.apartmentFieldLabel}>Responsável</Text>
            <UserSearch
              value={responsibleName}
              onChange={(name) => {
                setResponsibleName(name);
                setResponsibleId("");
              }}
              onSelect={(candidate) => {
                setResponsibleName(candidate.name);
                setResponsibleId(candidate.id);
              }}
            />
            <Text style={styles.apartmentFieldLabel}>Contato</Text>
            <TextInput
              value={contact}
              onChangeText={setContact}
              style={styles.apartmentInput}
              keyboardType="phone-pad"
              placeholder="Telefone para contato"
            />
            <Text style={styles.apartmentResidentsTitle}>Moradores:</Text>
            <View style={styles.apartmentResidentsGrid}>
              {apartment.residents.map((resident) => (
                <ResidentCard
                  key={resident.id}
                  resident={resident}
                  manager
                  onRemove={() => remove(resident)}
                />
              ))}
              {adding ? (
                <View style={styles.addResidentPanel}>
                  <UserSearch
                    value={newResidentName}
                    onChange={(name) => {
                      setNewResidentName(name);
                      setNewResidentId("");
                    }}
                    onSelect={(candidate) => {
                      setNewResidentName(candidate.name);
                      setNewResidentId(candidate.id);
                    }}
                  />
                  <View style={styles.pickerBorder}>
                    <Picker
                      selectedValue={relation}
                      onValueChange={(value) => setRelation(String(value))}
                    >
                      {RELATIONS.map((item) => (
                        <Picker.Item key={item} label={item} value={item} />
                      ))}
                    </Picker>
                  </View>
                  <TouchableOpacity
                    style={styles.addResidentConfirm}
                    onPress={add}
                    disabled={!newResidentId || saving}
                  >
                    <Text style={styles.apartmentButtonText}>Vincular</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addResidentCard}
                  onPress={() => setAdding(true)}
                >
                  <Ionicons name="add-circle-outline" size={78} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={save}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.apartmentButtonText}>Concluir</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.apartmentButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ApartmentCard({
  apartment,
  manager,
  onChanged,
}: {
  apartment: ApartmentInfo;
  manager: boolean;
  onChanged?: (apartment: ApartmentInfo) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <View style={styles.apartmentCard}>
      <View style={styles.apartmentTitleRow}>
        <Text style={styles.apartmentTitle}>
          Apartamento {apartment.apartamento}
        </Text>
        {manager ? (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Ionicons name="pencil-outline" size={29} color="#235DFF" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.apartmentFieldLabel}>Apartamento alugado?</Text>
      <Text style={styles.apartmentFieldValue}>
        {apartment.isRented ? "Sim" : "Não"}
      </Text>
      <Text style={styles.apartmentFieldLabel}>Responsável:</Text>
      <Text style={styles.apartmentFieldValue}>
        {apartment.responsible?.name || "Não informado"}
      </Text>
      <Text style={styles.apartmentFieldLabel}>Contato:</Text>
      <Text style={styles.apartmentFieldValue}>{apartment.contact}</Text>
      <Text style={styles.apartmentResidentsTitle}>Moradores:</Text>
      <View style={styles.apartmentResidentsGrid}>
        {apartment.residents.map((resident) => (
          <ResidentCard
            key={resident.id}
            resident={resident}
            manager={manager}
          />
        ))}
      </View>
      {manager && onChanged ? (
        <EditApartmentModal
          apartment={apartment}
          visible={editing}
          onClose={() => setEditing(false)}
          onChanged={onChanged}
        />
      ) : null}
    </View>
  );
}

export default function ApartmentSection({ manager }: Props) {
  const [loading, setLoading] = useState(!manager);
  const [apartments, setApartments] = useState<ApartmentInfo[]>([]);
  const [bloco, setBloco] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [searching, setSearching] = useState(false);
  const loadMine = useCallback(async () => {
    if (manager) return;
    setLoading(true);
    try {
      setApartments(await getMyApartments());
    } catch {
      setApartments([]);
    } finally {
      setLoading(false);
    }
  }, [manager]);
  useEffect(() => {
    loadMine();
  }, [loadMine]);
  const search = async () => {
    if (!bloco.trim() || !apartamento.trim())
      return alert("Informe o bloco e o apartamento.");
    setSearching(true);
    try {
      setApartments([await findApartment(bloco.trim(), apartamento.trim())]);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível buscar o apartamento.",
      );
    } finally {
      setSearching(false);
    }
  };
  const replaceApartment = (updated: ApartmentInfo) => setApartments([updated]);
  return (
    <View style={styles.apartmentSection}>
      <Text style={styles.sectionTitle}>
        {manager ? "Buscar Apartamentos:" : "Seus apartamentos:"}
      </Text>
      {manager ? (
        <View style={styles.apartmentSearch}>
          <Text style={styles.searchLabel}>Bloco</Text>
          <TextInput
            value={bloco}
            onChangeText={setBloco}
            style={styles.compactSearchInput}
            keyboardType="numeric"
          />
          <Text style={styles.searchLabel}>Apartamento</Text>
          <TextInput
            value={apartamento}
            onChangeText={setApartamento}
            style={styles.compactSearchInput}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.apartmentSearchButton}
            onPress={search}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.apartmentButtonText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
      {loading ? (
        <View style={styles.apartmentLoading}>
          <ActivityIndicator color="#466CA5" />
        </View>
      ) : (
        apartments.map((apartment) => (
          <ApartmentCard
            key={`${apartment.bloco}-${apartment.apartamento}`}
            apartment={apartment}
            manager={manager}
            onChanged={replaceApartment}
          />
        ))
      )}
      {!loading && !apartments.length && !manager ? (
        <Text style={styles.apartmentEmpty}>
          Nenhum apartamento está vinculado ao seu cadastro.
        </Text>
      ) : null}
    </View>
  );
}
