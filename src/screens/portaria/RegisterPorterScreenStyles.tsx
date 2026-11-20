import { StyleSheet } from "react-native";
import { styles as residents } from "../residents/styles";
export const styles = StyleSheet.create({
  ...residents,
  screen: { 
    flex: 1, 
    backgroundColor: "#fff" 
    },
    form: { 
        gap: 12, 
        marginVertical: 12 
    },
    error: { 
        color: "#9d2222" 
    },
    cancel: {
        textAlign: "center",
        padding: 10,
        color: "#466CA5",
        fontWeight: "600",
    },
});
