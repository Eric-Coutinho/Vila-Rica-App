import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert, AlertButton } from "react-native";

import ConfirmModal from "./ConfirmModal.tsx";
import LoadingModal from "./LoadingModal";
import { subscribeLoading } from "../services/loadingController";

type DialogOptions = {
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const DialogContext = createContext<{
  showDialog: (options: DialogOptions) => void;
} | null>(null);

export function useAppDialog() {
  const context = useContext(DialogContext);
  if (!context)
    throw new Error(
      "useAppDialog deve ser usado dentro do AppFeedbackProvider",
    );
  return context;
}

function parseAlertButtons(buttons?: AlertButton[]): DialogOptions {
  const cancel = buttons?.find(
    (button) =>
      button.style === "cancel" || button.text?.toLowerCase() === "cancelar",
  );
  const confirm = buttons?.filter((button) => button !== cancel).at(-1);
  return {
    title: "Atenção",
    text: "",
    showCancel: Boolean(cancel),
    cancelText: cancel?.text || "Cancelar",
    confirmText: confirm?.text || "OK",
    onCancel: cancel?.onPress,
    onConfirm: confirm?.onPress,
  };
}

export default function AppFeedbackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<DialogOptions | null>(null);
  const showDialog = useCallback(
    (options: DialogOptions) => setDialog(options),
    [],
  );

  useEffect(() => subscribeLoading(setLoading), []);

  useEffect(() => {
    const originalAlert = Alert.alert;
    const originalGlobalAlert = (globalThis as any).alert;
    const interceptedAlert = ((
      title: string,
      text?: string,
      buttons?: AlertButton[],
    ) => {
      const buttonOptions = parseAlertButtons(buttons);
      showDialog({
        ...buttonOptions,
        title: title || "Atenção",
        text: text || "",
      });
    }) as typeof Alert.alert;

    Alert.alert = interceptedAlert;
    (globalThis as any).alert = (text?: unknown) => {
      const message = String(text || "");
      const separator = message.indexOf(" - ");
      const title = separator > 0 ? message.slice(0, separator) : "Atenção";
      const body = separator > 0 ? message.slice(separator + 3) : message;
      showDialog({ title, text: body, confirmText: "OK", showCancel: false });
    };

    return () => {
      Alert.alert = originalAlert;
      (globalThis as any).alert = originalGlobalAlert;
    };
  }, [showDialog]);

  const dismiss = () => setDialog(null);
  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}
      <LoadingModal visible={loading} />
      <ConfirmModal
        visible={Boolean(dialog)}
        title={dialog?.title || "Atenção"}
        text={dialog?.text || ""}
        confirmText={dialog?.confirmText || "OK"}
        cancelText={dialog?.cancelText || "Cancelar"}
        showCancel={Boolean(dialog?.showCancel)}
        onCancel={() => {
          const callback = dialog?.onCancel;
          dismiss();
          callback?.();
        }}
        onConfirm={() => {
          const callback = dialog?.onConfirm;
          dismiss();
          callback?.();
        }}
      />
    </DialogContext.Provider>
  );
}
