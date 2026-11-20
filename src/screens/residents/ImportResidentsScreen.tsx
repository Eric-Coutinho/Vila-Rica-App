import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  importResidentsSpreadsheet,
  residentImportTemplateUrl,
} from "../../services/apartmentService";
import { styles } from "./styles";

type ImportResult = {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
  warnings?: Array<{ row: number; message: string }>;
};

export default function ImportResidentsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const downloadTemplate = async () => {
    try {
      await Linking.openURL(residentImportTemplateUrl);
    } catch {
      alert("Não foi possível abrir o modelo de planilha.");
    }
  };

  const selectAndImport = async () => {
    const selected = await DocumentPicker.getDocumentAsync({
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (selected.canceled || !selected.assets?.[0]) return;

    const asset = selected.assets[0];
    setSelectedName(asset.name);
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      if (asset.file) {
        formData.append("file", asset.file);
      } else {
        formData.append("file", {
          uri: asset.uri,
          name: asset.name || "moradores.xlsx",
          type:
            asset.mimeType ||
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        } as any);
      }
      setResult(await importResidentsSpreadsheet(formData));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível importar a planilha.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Importar moradores</Text>
      </View>
      <View style={styles.importCard}>
        <Text style={styles.importText}>
          Use o modelo para cadastrar vários moradores de uma vez.
        </Text>
        <Text style={styles.importText}>
          <Text style={styles.requiredText}>Obrigatórios:</Text> Nome, CPF e
          Data de Nascimento.
        </Text>
        <Text style={styles.importText}>
          Email, bloco, apartamento e relação são opcionais e podem ser
          atualizados depois.
        </Text>
        <TouchableOpacity
          style={styles.templateButton}
          onPress={downloadTemplate}
        >
          <Text style={styles.registerButtonText}>
            Baixar modelo da planilha
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={selectAndImport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>
              Selecionar e importar XLSX
            </Text>
          )}
        </TouchableOpacity>
        {selectedName ? (
          <Text style={styles.selectedFile}>
            Arquivo selecionado: {selectedName}
          </Text>
        ) : null}
      </View>
      {result ? (
        <View style={styles.importResultCard}>
          <Text style={styles.cardTitle}>Importação concluída</Text>
          <Text style={styles.cardSmall}>
            Moradores importados: {result.imported}
          </Text>
          <Text style={styles.cardSmall}>
            Linhas não importadas: {result.skipped}
          </Text>
          {result.errors.map((item) => (
            <Text
              key={`${item.row}-${item.message}`}
              style={styles.importError}
            >
              Linha {item.row}: {item.message}
            </Text>
          ))}
          {result.warnings?.map((item) => (
            <Text
              key={`warning-${item.row}-${item.message}`}
              style={styles.importWarning}
            >
              Linha {item.row}: {item.message}
            </Text>
          ))}
        </View>
      ) : null}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
