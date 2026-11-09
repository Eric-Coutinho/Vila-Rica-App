import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ApartmentCandidate,
  ApartmentInfo,
  findApartment,
  getApartmentCandidates,
  getMyApartments,
  linkResidentToApartment,
  updateApartment,
} from "../../services/apartmentService";
import { styles } from "./styles";

type Props = { manager: boolean };

const RELATIONS = ["Morador", "Inquilino", "Proprietário"];

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
  const [saving, setSaving] = useState(false);
  const [rented, setRented] = useState(apartment.isRented);
  const [contact, setContact] = useState(
    apartment.contact === "Não informado" ? "" : apartment.contact,
  );
  const [responsibleId, setResponsibleId] = useState(
    apartment.responsible?.id || "",
  );
  const [candidates, setCandidates] = useState<ApartmentCandidate[]>([]);
  const [residentId, setResidentId] = useState("");
  const [relation, setRelation] = useState("Morador");

  useEffect(() => {
    setRented(apartment.isRented);
    setContact(apartment.contact === "Não informado" ? "" : apartment.contact);
    setResponsibleId(apartment.responsible?.id || "");
  }, [apartment]);

  const loadCandidates = useCallback(() => {
    if (!manager || candidates.length) return;
    getApartmentCandidates()
      .then(setCandidates)
      .catch(() => setCandidates([]));
  }, [manager, candidates.length]);

  const beginEdit = () => {
    loadCandidates();
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      onChanged?.(
        await updateApartment(apartment, {
          isRented: rented,
          contact,
          responsibleId,
        }),
      );
      setEditing(false);
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

  const linkResident = async () => {
    if (!residentId) return;
    setSaving(true);
    try {
      onChanged?.(
        await linkResidentToApartment(apartment, residentId, relation),
      );
      setResidentId("");
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
    <View style={styles.apartmentCard}>
      <Text style={styles.apartmentTitle}>
        Apartamento {apartment.apartamento}
        {"\n"}Bloco {apartment.bloco}
      </Text>
      <Text style={styles.apartmentFieldLabel}>Apartamento alugado?</Text>
      {editing ? (
        <View style={styles.switchRow}>
          <Text>{rented ? "Sim" : "Não"}</Text>
          <Switch value={rented} onValueChange={setRented} />
        </View>
      ) : (
        <Text style={styles.apartmentFieldValue}>
          {apartment.isRented ? "Sim" : "Não"}
        </Text>
      )}

      <Text style={styles.apartmentFieldLabel}>Responsável (proprietário)</Text>
      {editing ? (
        <View style={styles.pickerBorder}>
          <Picker
            selectedValue={responsibleId}
            onValueChange={(value) => setResponsibleId(String(value))}
          >
            <Picker.Item label="Não informado" value="" />
            {candidates.map((candidate) => (
              <Picker.Item
                key={candidate.id}
                label={candidate.name}
                value={candidate.id}
              />
            ))}
          </Picker>
        </View>
      ) : (
        <Text style={styles.apartmentFieldValue}>
          {apartment.responsible?.name || "Não informado"}
        </Text>
      )}

      <Text style={styles.apartmentFieldLabel}>Contato</Text>
      {editing ? (
        <TextInput
          value={contact}
          onChangeText={setContact}
          style={styles.apartmentInput}
          placeholder="Telefone ou outro contato"
          keyboardType="phone-pad"
        />
      ) : (
        <Text style={styles.apartmentFieldValue}>{apartment.contact}</Text>
      )}

      <Text style={styles.apartmentResidentsTitle}>Moradores vinculados</Text>
      {apartment.residents.length ? (
        apartment.residents.map((resident) => (
          <View key={resident.id} style={styles.apartmentResidentRow}>
            <Text style={styles.apartmentResidentName}>{resident.name}</Text>
            <Text style={styles.apartmentResidentPhone}>{resident.phone}</Text>
            {manager && resident.relation ? (
              <Text style={styles.apartmentResidentRelation}>
                {resident.relation}
              </Text>
            ) : null}
          </View>
        ))
      ) : (
        <Text style={styles.apartmentEmpty}>Nenhum morador vinculado.</Text>
      )}

      {manager && editing ? (
        <View style={styles.linkResidentBox}>
          <Text style={styles.apartmentFieldLabel}>Vincular morador</Text>
          <View style={styles.pickerBorder}>
            <Picker
              selectedValue={residentId}
              onValueChange={(value) => setResidentId(String(value))}
            >
              <Picker.Item label="Selecione um morador" value="" />
              {candidates.map((candidate) => (
                <Picker.Item
                  key={candidate.id}
                  label={candidate.name}
                  value={candidate.id}
                />
              ))}
            </Picker>
          </View>
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
            style={styles.secondaryApartmentButton}
            onPress={linkResident}
            disabled={!residentId || saving}
          >
            <Text style={styles.apartmentButtonText}>Vincular morador</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {manager ? (
        editing ? (
          <View style={styles.apartmentActionRow}>
            <TouchableOpacity
              style={styles.cancelApartmentButton}
              onPress={() => setEditing(false)}
              disabled={saving}
            >
              <Text style={styles.apartmentButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveApartmentButton}
              onPress={save}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.apartmentButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.saveApartmentButton}
            onPress={beginEdit}
          >
            <Text style={styles.apartmentButtonText}>Editar apartamento</Text>
          </TouchableOpacity>
        )
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
        {manager ? "Busca rápida de informações" : "Seus apartamentos"}
      </Text>
      {manager ? (
        <View style={styles.apartmentSearch}>
          <TextInput
            value={bloco}
            onChangeText={setBloco}
            placeholder="Bloco"
            style={styles.apartmentSearchInput}
            keyboardType="numeric"
          />
          <TextInput
            value={apartamento}
            onChangeText={setApartamento}
            placeholder="Apartamento"
            style={styles.apartmentSearchInput}
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
