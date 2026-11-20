import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { searchDeliveryResidents } from "../../services/deliveryService";
import type { DeliveryResident } from "../../types/delivery";
import { ChoiceField } from "./DeliveryFields";
import { styles as s } from "./DeliveriesScreenStyles";

const empty: DeliveryResident[] = [];
export function ResidentField({
  label,
  defaults = empty,
  selected,
  change,
}: {
  label: string;
  defaults?: DeliveryResident[];
  selected: string;
  change: (id: string, name?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DeliveryResident[]>([]);
  const [error, setError] = useState("");
  const term = query.trim();
  useEffect(() => {
    let active = true;
    if (term.length < 4) return;
    const timer = setTimeout(() => {
      searchDeliveryResidents(term)
        .then((rows) => {
          if (active) setResults(rows);
        })
        .catch(() => {
          if (active) setError("Falha ao pesquisar moradores.");
        });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [term]);
  const options = term.length >= 4 ? results : term ? empty : defaults;
  return (
    <View>
      <ChoiceField
        label={label}
        value={selected}
        change={(id) => change(id, options.find((o) => o.id === id)?.name)}
        options={[
          { value: "", label: "Selecione o morador" },
          ...options.map((p) => ({ value: p.id, label: p.name })),
        ]}
      />
      <TextInput
        accessibilityLabel="Pesquisar morador"
        style={s.input}
        placeholder="Pesquisar nome (mín. 4 letras)"
        value={query}
        onChangeText={(v) => {
          setQuery(v);
          setResults([]);
          setError("");
          change("");
        }}
      />
      {selected && !options.some((p) => p.id === selected) ? (
        <Text>Morador selecionado</Text>
      ) : null}
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}
